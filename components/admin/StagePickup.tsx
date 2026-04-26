"use client";

// StagePickup is the Phase-2 router. The admin workflow has 6 granular
// sub-stages between "paid" (end of Phase 1) and "completed" (terminal):
// pickup_scheduled → picked_up → shipping_quote → quote_accepted →
// shipped → delivered. Each sub-stage lives in its own file under
// stage-pickup/; this dispatcher routes by `subStage`.

import type { StagePickupProps } from "@/components/admin/stage-pickup/shared";
import PickupScheduled from "@/components/admin/stage-pickup/PickupScheduled";
import PickedUp from "@/components/admin/stage-pickup/PickedUp";
import ShippingQuote from "@/components/admin/stage-pickup/ShippingQuote";
import QuoteAccepted from "@/components/admin/stage-pickup/QuoteAccepted";
import Shipped from "@/components/admin/stage-pickup/Shipped";
import Delivered from "@/components/admin/stage-pickup/Delivered";

// SubStage is re-exported for back-compat with existing importers
// (DeliveryDetail). Step 3 of the migration moves consumers to import
// directly from stage-pickup/ and this file goes away.
export type { SubStage } from "@/components/admin/stage-pickup/shared";

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
