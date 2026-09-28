import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error("STRIPE_SECRET_KEY saknas i miljövariablerna (.env.local).");
}

export const stripe = new Stripe(secretKey);
