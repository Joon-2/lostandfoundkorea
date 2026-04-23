# EMAILS.md — Email Templates

## Global Rules
- From: "Lost and Found Korea" <support@lostandfoundkorea.com>
- SMTP auth: admin@kustody.co (never shown)
- All subjects end with [LFK-XXXXXX]
- All emails include footer: "Lost and Found Korea · Seoul, Korea · lostandfoundkorea.com"
- All emails include WhatsApp link for questions
- HTML format with consistent branding

## Email Header (all emails)
- Dark navy (#1e293b) banner with "Lost & Found Korea" in white
- Clean white body

## Email Footer (all emails)
- Divider line
- "Lost and Found Korea · Seoul, Korea · lostandfoundkorea.com"
- WhatsApp link

---

## 1. Confirmation Email
**Type:** `confirmation`
**Trigger:** Admin clicks "Send confirmation email"
**Subject:** We received your report [LFK-XXXXXX]

**Body:**
```
Hi {name},

We've received your lost item report. Here are your case details:

Case Number: {case_number}
Item: {category} — {item_description}
Location: {location}
Date Lost: {date_lost}

Our team will begin searching immediately. We'll contact you 
within 24 hours with an update.

If we locate your item, you can unlock the full recovery details 
for ${plan_price}.

No item found? You pay nothing.

Need urgent help? Chat with us on WhatsApp: {whatsapp_link}
```

---

## 2. Additional Info Request
**Type:** `info_request`
**Trigger:** Admin types request and clicks "Send request email"
**Subject:** Additional info needed for your case [LFK-XXXXXX]

**Body:**
```
Hi {name},

Thanks for your report (case {case_number}). To help us find 
your item faster, could you provide some additional information?

{admin_message}

You can reply to this email or chat with us on WhatsApp.
```

---

## 3. Payment Link (Item Found)
**Type:** `payment_link`
**Trigger:** Admin clicks "Send payment link"
**Subject:** Your item has been found! [LFK-XXXXXX]

**Body:**
```
Hi {name},

Great news — we have a strong lead on your lost item 
(case {case_number}).

[Found item photos here — if available]

Is this your item? Photos taken by our team at the recovery location.

Complete the ${price} recovery payment to unlock the exact 
location, contact info, and step-by-step English pickup instructions.

[Pay ${price} to unlock] — button linking to /pay/{case_number}

Or copy this link: https://lostandfoundkorea.com/pay/{case_number}

Reminder: if the item turns out not to be yours, you pay nothing.
```

---

## 4. Not Found
**Type:** `not_found`
**Trigger:** Admin clicks "Send 'no item found' email & close"
**Subject:** Update on your lost item search [LFK-XXXXXX]

**Body:**
```
Hi {name},

We weren't able to find your item in the {location} area 
despite our best efforts.

{admin_reason — if provided}

As promised, there is no charge since we did not find your item.

If you have any new information that might help, reply to this 
email or chat with us on WhatsApp.

We hope you enjoy the rest of your time in Korea.
```

---

## 5. Payment Receipt
**Type:** `receipt`
**Trigger:** Auto-sent after PayPal payment success
**Subject:** Payment confirmed [LFK-XXXXXX]

**Body:**
```
Hi {name},

Your payment has been confirmed. Here are your details:

Case: {case_number}
Amount: ${amount}
Transaction ID: {transaction_id}
Date: {date}

You can now view your recovery details at:
https://lostandfoundkorea.com/pay/{case_number}

Questions? Chat with us on WhatsApp.
```

---

## 6. Shipping Quote
**Type:** `shipping_quote`
**Trigger:** Admin sends shipping cost estimate
**Subject:** Shipping quote for your item [LFK-XXXXXX]

**Body:**
```
Hi {name},

We've picked up your item and it's ready to ship. 
Here's the shipping breakdown:

Item: {category} — {item_description}
Destination: {shipping_address}
Shipping method: {shipping_method}
Estimated cost: ${shipping_cost}
Estimated delivery: {estimated_delivery}

Please reply to this email or WhatsApp to confirm, 
and we'll ship it right away.

Note: customs duties and import taxes are the 
recipient's responsibility.
```

---

## 7. Tracking
**Type:** `tracking`
**Trigger:** Admin enters tracking number and clicks send
**Subject:** Your item has been shipped! [LFK-XXXXXX]

**Body:**
```
Hi {name},

Your item has been shipped!

Tracking number: {tracking_number}
Shipping method: {shipping_method}
Estimated delivery: {estimated_delivery}

Track your package: {tracking_url}

If you have any issues with delivery, please contact us 
via WhatsApp or reply to this email.

Thank you for using Lost and Found Korea!
```
