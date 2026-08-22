import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const signature = request.headers.get("stripe-signature");
    const rawBody = await request.text();

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      console.error("Invalid Stripe webhook signature:", error.message);
      return new Response("Invalid signature", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
        expand: ["line_items"],
      });

      console.log("PAID_ORDER", JSON.stringify({
        sessionId: session.id,
        amountTotal: session.amount_total,
        currency: session.currency,
        customer: session.customer_details,
        shipping: session.shipping_details,
        items: session.line_items?.data.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          amountTotal: item.amount_total,
        })),
      }));
    }

    return Response.json({ received: true });
  },
};
