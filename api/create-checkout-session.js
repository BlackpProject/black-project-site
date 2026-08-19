
const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Black Project Test",
            },
            unit_amount: 100,
          },
          quantity: 1,
        },
      ],

      success_url: "https://black-project-site.vercel.app/?success=true",
      cancel_url: "https://black-project-site.vercel.app/?cancelled=true",
    });

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro ao criar sessão de pagamento",
    });
  }
};
