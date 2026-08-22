const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PRODUCTS = {
  "essentials-black-tee": { name: "Essentials Fear of God Black / Yellow", unitAmount: 4500, sizes: ["M"] },
  "essentials-grey-tee": { name: "Essentials Fear of God Grey", unitAmount: 4500, sizes: ["M", "L"] },
  "off-white-black-tee": { name: "Off-White Caravaggio Black", unitAmount: 4500, sizes: ["M"] },
  "bape-black-blue-tee": { name: "BAPE A Bathing Ape Blue Camo", unitAmount: 4500, sizes: ["L"] },
  "bape-red-tee": { name: "BAPE A Bathing Ape Red", unitAmount: 4500, sizes: ["M"] },
  "corteiz-black-tee": { name: "Corteiz Script Black", unitAmount: 4500, sizes: ["M"] },
  "essentials-black-set": { name: "Essentials Conjunto Black", unitAmount: 6500, sizes: ["M", "L"] },
  "essentials-grey-set": { name: "Essentials Conjunto Grey", unitAmount: 6500, sizes: ["M", "L"] },
  "oakley-black-shorts": { name: "Oakley Bermuda Technical Black", unitAmount: 3500, sizes: ["M"] },
  "supreme-caps": { name: "Supreme Cap", unitAmount: 4000, sizes: ["Único"] },
  "air-force-existing-41": { name: "Nike Air Force — modelo anterior", unitAmount: 6500, sizes: ["41"] },
  "yeezy-existing-41": { name: "Yeezy 350 — modelo anterior", unitAmount: 7500, sizes: ["41"] },
  "off-white-air-force-41": { name: "Off-White Air Force Black", unitAmount: 9500, sizes: ["41"] },
  "bape-sta-42": { name: "BAPE STA Black / White", unitAmount: 8500, sizes: ["42"] },
  "yeezy-350-44": { name: "Yeezy 350 White / Volt", unitAmount: 7500, sizes: ["44"] }
};
module.exports = async (req, res) => {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Método não permitido" }); }
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length || items.length > 20) return res.status(400).json({ error: "Carrinho inválido" });
    const lineItems = items.map(({ id, size }) => {
      const product = PRODUCTS[id], cleanSize = String(size || "").trim();
      if (!product || !product.sizes.includes(cleanSize)) throw new Error("INVALID_CART");
      return { price_data: { currency: "eur", product_data: { name: product.name, description: `Tamanho ${cleanSize}` }, unit_amount: product.unitAmount }, quantity: 1 };
    });
    const origin = `https://${req.headers.host || "black-project-site.vercel.app"}`;
    const session = await stripe.checkout.sessions.create({ mode: "payment", line_items: lineItems, success_url: `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${origin}/?cancelled=true`, billing_address_collection: "required", phone_number_collection: { enabled: true }, shipping_address_collection: { allowed_countries: ["PT"] }, locale: "pt" });
    return res.status(200).json({ url: session.url });
  } catch (error) {
    if (error.message === "INVALID_CART") return res.status(400).json({ error: "Carrinho inválido" });
    console.error("Stripe Checkout error:", error.message); return res.status(500).json({ error: "Erro ao criar sessão de pagamento" });
  }
};
