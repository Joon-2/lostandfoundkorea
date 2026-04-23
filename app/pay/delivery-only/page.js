import CheckoutForm from "@/components/CheckoutForm";
import { plans } from "@/config/plans";
import { siteConfig } from "@/config/site";

const deliveryPrice = plans.delivery_only.priceSeoul;

export const metadata = {
  title: `${plans.delivery_only.name} — ${siteConfig.name}`,
};

const FIELDS = [
  {
    name: "locationDetail",
    label: "Where is the item being held?",
    required: true,
    multiline: true,
    placeholder:
      "Tell us exactly where the item is right now: business / station / police office name, address, contact person if known.",
  },
  {
    name: "shippingAddress",
    label: "Shipping address",
    required: true,
    multiline: true,
    placeholder:
      "Full address including country and postal code (we ship domestically and internationally).",
  },
];

export default function Page() {
  return (
    <CheckoutForm
      plan="delivery-only"
      title={`${plans.delivery_only.name} — $${deliveryPrice}`}
      subtitle="When you already know where the item is. We pick it up in Korean and ship it to your address."
      price={String(deliveryPrice)}
      fields={FIELDS}
    />
  );
}
