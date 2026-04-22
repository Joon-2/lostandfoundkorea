import CheckoutForm from "@/components/CheckoutForm";

export const metadata = {
  title: "All-in-One Recovery — Lost and Found Korea",
};

const FIELDS = [
  {
    name: "itemDescription",
    label: "What did you lose?",
    required: true,
    multiline: true,
    placeholder:
      "Brand, model, color, distinguishing features, what's inside, etc.",
  },
  {
    name: "location",
    label: "Where did you last have it?",
    required: true,
    placeholder: "e.g. Hongdae area, Subway Line 2, around 3pm",
  },
];

export default function Page() {
  return (
    <CheckoutForm
      plan="all-in-one"
      title="All-in-One Recovery — $79"
      subtitle="We search for your item in Korean and ship it to your address. One price upfront, no add-on fees."
      price="79"
      fields={FIELDS}
    />
  );
}
