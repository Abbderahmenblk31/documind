// =============================================================================
// DocuMind - Stripe Checkout Session API Route
// POST /api/stripe/checkout
// Creates a hosted Stripe checkout session for subscription plans
// =============================================================================

import { NextResponse } from "next/server";
import { stripe, isStripeConfigured, PLANS } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { plan = "pro", billingCycle = "monthly" } = body as {
      plan?: "pro" | "enterprise";
      billingCycle?: "monthly" | "annual";
    };

    const host = request.headers.get("origin") || request.headers.get("referer") || "http://localhost:3000";
    const selectedPlan = PLANS[plan] || PLANS.pro;
    const unitAmount =
      billingCycle === "annual" ? selectedPlan.annualPrice : selectedPlan.monthlyPrice;

    // If Stripe is configured with a real secret key
    if (isStripeConfigured && !process.env.STRIPE_SECRET_KEY?.includes("placeholder")) {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: selectedPlan.name,
                description: `${selectedPlan.name} (${billingCycle} subscription)`,
              },
              unit_amount: unitAmount,
              recurring: {
                interval: billingCycle === "annual" ? "year" : "month",
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${host}/dashboard/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${host}/dashboard/billing?status=cancelled`,
      });

      return NextResponse.json({ url: session.url }, { status: 200 });
    }

    // Demo Mode simulation fallback
    const simulatedUrl = `${host}/dashboard/billing?status=success&mode=demo_upgraded&plan=${plan}`;
    return NextResponse.json(
      {
        url: simulatedUrl,
        mode: "demo",
        message: "Stripe test mode simulated. Redirecting to upgraded state.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize checkout session.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
