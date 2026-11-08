// =============================================================================
// DocuMind - Stripe Webhooks Listener API Route
// POST /api/stripe/webhook
// Handles subscription activation, updates, and cancellations
// =============================================================================

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret || !signature) {
    // If webhook secret isn't configured, acknowledge receipt for demo/mock testing
    return NextResponse.json({ received: true, mode: "unconfigured" }, { status: 200 });
  }

  try {
    const rawBody = await request.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    const supabase = createServerClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const customerId = session.customer;
        const clientReferenceId = session.client_reference_id;

        if (clientReferenceId) {
          await supabase
            .from("profiles")
            .update({ plan: "pro", documents_limit: 9999 })
            .eq("id", clientReferenceId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_customer_id", customerId);
        break;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 }
    );
  }
}
