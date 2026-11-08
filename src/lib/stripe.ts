// =============================================================================
// DocuMind - Stripe Payments Configuration & Client
// =============================================================================

import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key";

export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-03-25" as any,
  typescript: true,
});

export const PLANS = {
  pro: {
    name: "DocuMind Pro",
    monthlyPrice: 1900, // $19.00 in cents
    annualPrice: 18000, // $180.00 in cents ($15/mo)
    features: [
      "Unlimited document uploads",
      "GPT-4o deep analysis",
      "Unlimited AI Q&A with citations",
      "Export to PDF, Markdown, and CSV",
      "Priority processing queue",
    ],
  },
  enterprise: {
    name: "DocuMind Enterprise",
    monthlyPrice: 9900, // $99.00 in cents
    annualPrice: 95000,
    features: [
      "Everything in Pro",
      "Dedicated high-throughput API",
      "Custom retention policies",
      "Team collaboration & RBAC",
      "SOC2 and HIPAA compliance guarantee",
    ],
  },
};
