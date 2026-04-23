# API.md — API Endpoints

## Authentication
- Admin routes: `ADMIN_PASSWORD` in request header
- Public routes: no auth (form submission)
- DB reads: `SUPABASE_SERVICE_ROLE_KEY` server-side only

---

## Endpoints

### POST /api/reports
**Purpose:** Create new report (form submission)
**Auth:** None (public)
**Body:**
```json
{
  "name": "John",
  "email": "john@email.com",
  "category": "Phone / Electronics",
  "brand_model": "iPhone 15",
  "color": "Black",
  "item_description": "iPhone with clear case",
  "distinguishing_features": "Cracked screen protector",
  "location": "Subway / Train",
  "location_detail": "Line 2, Hongdae station",
  "date_lost": "2026-04-22",
  "date_confidence": "Exact date",
  "time_lost": "Afternoon (12-3 PM)",
  "additional_info": "...",
  "plan": "recovery",
  "user_images": "[\"url1\", \"url2\"]"
}
```
**Response:** `{ case_number: "LFK-XXXXXX" }`
**Notes:** Auto-generates case_number. Saves to Supabase with status "pending", process_stage "received".

---

### GET /api/reports
**Purpose:** Fetch all reports (admin dashboard)
**Auth:** ADMIN_PASSWORD header
**Response:** Array of Report objects
**Notes:** Sorted by created_at desc

---

### GET /api/reports/[caseNumber]
**Purpose:** Fetch single report (payment page, admin detail)
**Auth:** None (case number is the auth — hard to guess)
**Response:** Single Report object
**Notes:** Uses SERVICE_ROLE_KEY to bypass RLS

---

### POST /api/reports/update
**Purpose:** Update report fields (admin actions)
**Auth:** ADMIN_PASSWORD header
**Body:**
```json
{
  "case_number": "LFK-XXXXXX",
  "updates": {
    "status": "found",
    "process_stage": "found",
    "recovery_location": "Hongdae Police Station",
    "recovery_contact": "02-1234-5678",
    "recovery_hours": "Mon-Fri 09:00-18:00",
    "recovery_instructions": "Go to the lost items desk..."
  }
}
```
**Response:** Updated Report object

---

### POST /api/upload
**Purpose:** Upload image to Supabase Storage
**Auth:** ADMIN_PASSWORD header (for found-images), None (for report-images)
**Body:** FormData with file + bucket + caseNumber
**Response:** `{ url: "https://...supabase.co/storage/..." }`
**Notes:** Accepts any image format. Compresses to JPEG server-side if needed.

---

### POST /api/email
**Purpose:** Send email (all types)
**Auth:** ADMIN_PASSWORD header (admin-triggered), None (auto-triggered on form submit)
**Body:**
```json
{
  "type": "confirmation",
  "to": "user@email.com",
  "caseNumber": "LFK-XXXXXX",
  "data": {
    "name": "John",
    "category": "Phone / Electronics",
    "item_description": "iPhone with clear case",
    "location": "Subway / Train"
  }
}
```
**Email types:**
| Type | Subject | When |
|------|---------|------|
| confirmation | We received your report [LFK-XXXXXX] | After form submission |
| info_request | Additional info needed [LFK-XXXXXX] | Admin requests more info |
| payment_link | Your item has been found [LFK-XXXXXX] | Admin marks as found |
| not_found | Update on your lost item search [LFK-XXXXXX] | Admin closes case |
| receipt | Payment confirmed [LFK-XXXXXX] | After PayPal payment |
| shipping_quote | Shipping quote for your item [LFK-XXXXXX] | Admin sends shipping cost |
| tracking | Your item has been shipped [LFK-XXXXXX] | After shipping |

---

### POST /api/payment/capture
**Purpose:** Handle PayPal payment success
**Auth:** None (called by PayPal SDK)
**Body:**
```json
{
  "orderID": "PayPal order ID",
  "caseNumber": "LFK-XXXXXX",
  "type": "recovery | pickup_addon",
  "amount": 39
}
```
**Response:** `{ success: true, transactionId: "..." }`
**Notes:** Updates status to "paid", saves transaction ID, logs to activity_log

---

### GET /api/health
**Purpose:** System status check
**Auth:** ADMIN_PASSWORD header
**Response:**
```json
{
  "database": { "status": "ok", "rows": 10 },
  "env": {
    "SUPABASE_URL": true,
    "SUPABASE_ANON_KEY": true,
    "SERVICE_ROLE_KEY": true,
    "PAYPAL_CLIENT_ID": true,
    "PAYPAL_SECRET": true,
    "GMAIL_USER": true,
    "GMAIL_APP_PASSWORD": true,
    "ADMIN_PASSWORD": true
  }
}
```
