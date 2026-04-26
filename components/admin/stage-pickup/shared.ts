// Shared types for the stage-pickup sub-stages. Each sub-stage component
// receives the same StagePickupProps shape; the dispatcher routes by
// `subStage`. Kept type-only so this file stays runtime-free.

import type { StatusMsg } from "@/components/admin/StatusPill";

export type SubStage =
  | "pickup_scheduled"
  | "picked_up"
  | "shipping_quote"
  | "quote_accepted"
  | "shipped"
  | "delivered";

export type Common = {
  report: any;
  password: string;
  onUnauthorized?: () => void;
  onUpdate: (report: any) => void;
  onAdvance: () => void;
  stageMoving: boolean;
  stageMsg: StatusMsg | null;
};

export type StagePickupProps = Common & {
  subStage: SubStage;
  pickupScheduledAt: string;
  setPickupScheduledAt: (v: string) => void;
  shippingQuoteAmount: string;
  setShippingQuoteAmount: (v: string) => void;
  shippingQuoteNotes: string;
  setShippingQuoteNotes: (v: string) => void;
  trackingNumber: string;
  setTrackingNumber: (v: string) => void;
  shippingMethod: string;
  setShippingMethod: (v: string) => void;
  estimatedDelivery: string;
  setEstimatedDelivery: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  saveMsg: StatusMsg | null;
  onMarkShipped: () => void;
  shipping: boolean;
};
