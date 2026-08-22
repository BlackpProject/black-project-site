const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método não permitido" });
  }

  const sessionId = String(req.query?.session_id || "");
  if (!sessionId.startsWith("cs_")) {
    return res.status(400).json({ error: "Sessão inválida" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return res.status(200).json({ paid: session.payment_status === "paid" });
  } catch (error) {
    console.error("Stripe session verification error:", error.message);
    return res.status(400).json({ error: "Não foi possível verificar o pagamento" });
  }
};
