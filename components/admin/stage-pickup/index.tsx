"use client";

// Phase-2 router. The admin workflow has 6 granular sub-stages between
// "paid" (end of Phase 1) and "completed" (terminal):
// pickup_scheduled → picked_up → shipping_quote → quote_accepted →
// shipped → delivered. Each sub-stage lives in its own file under this
// folder; this dispatcher routes by `subStage`.

import type { StagePickupProps } from "./shared";
import PickupScheduled from "./PickupScheduled";
import PickedUp from "./PickedUp";
import ShippingQuote from "./ShippingQuote";
import QuoteAccepted from "./QuoteAccepted";
import Shipped from "./Shipped";
import Delivered from "./Delivered";

export type { SubStage, StagePickupProps } from "./shared";

export default function StagePickup(props: StagePickupProps) {
  switch (props.subStage) {
    case "pickup_scheduled":
      return <PickupScheduled {...props} />;
    case "picked_up":
      return <PickedUp {...props} />;
    case "shipping_quote":
      return <ShippingQuote {...props} />;
    case "quote_accepted":
      return <QuoteAccepted {...props} />;
    case "shipped":
      return <Shipped {...props} />;
    case "delivered":
      return <Delivered {...props} />;
    default:
      return null;
  }
}
