const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCTS = {
  "nike-air-force-1": { name: "Nike Air Force 1", unitAmount: 6500 },
  "bape-sta-black-blue": { name: "BAPE STA Black / Blue", unitAmount: 8500 },
  "yeezy-350": { name: "Yeezy 350", unitAmount: 7500 },
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (!items.length || items.length > 20) {
      return res.status(400).json({ error: "Carrinho inválido" });
    }

    const lineItems = items.map(({ id, size }) => {
      const product = PRODUCTS[id];
      const cleanSize = String(size || "").trim().slice(0, 12);

      if (!product || !cleanSize) throw new Error("INVALID_CART");

      return {
        price_data: {
          currency: "eur",
          product_data: { name: product.name, description: `Tamanho ${cleanSize}` },
          unit_amount: product.unitAmount,
        },
        quantity: 1,
      };
    });

    const origin = `https://${req.headers.host || "black-project-site.vercel.app"}`;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?cancelled=true`,
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ["PT"] },
      locale: "pt",
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    if (error.message === "INVALID_CART") {
      return res.status(400).json({ error: "Carrinho inválido" });
    }
    console.error("Stripe Checkout error:", error.message);
    return res.status(500).json({ error: "Erro ao criar sessão de pagamento" });
  }
};
