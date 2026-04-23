# SCHEMA.md — Database & Data Types

## Supabase Table: reports

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID | gen_random_uuid() | Primary key |
| case_number | TEXT | | "LFK-" + 6 digits |
| name | TEXT | NOT NULL | Customer name |
| email | TEXT | NOT NULL | Customer email |
| category | TEXT | NOT NULL | Phone/Bag/Passport/Keys/Clothing/Other |
| brand_model | TEXT | null | Brand or model name |
| color | TEXT | null | Item color |
| item_description | TEXT | NOT NULL | Detailed description |
| distinguishing_features | TEXT | null | Unique marks, stickers, etc. |
| location | TEXT | NOT NULL | Location type (Subway/Taxi/Hotel/etc.) |
| location_detail | TEXT | null | Specific location details |
| date_lost | TEXT | NOT NULL | Date or approximate date |
| date_confidence | TEXT | null | Exact/±1 day/±2-3 days/Not sure |
| time_lost | TEXT | null | Time of day range |
| additional_info | TEXT | null | Extra notes |
| plan | TEXT | 'recovery' | recovery / all_in_one / delivery_only |
| status | TEXT | 'pending' | pending / found / paid / closed |
| process_stage | TEXT | 'received' | Phase 1 current stage |
| phase2_stage | TEXT | null | Phase 2 current stage |
| recovery_location | TEXT | null | Where item is held |
| recovery_contact | TEXT | null | Facility phone number |
| recovery_hours | TEXT | null | Operating hours |
| recovery_instructions | TEXT | null | English pickup instructions |
| user_images | TEXT | null | JSON array of user photo URLs |
| found_images | TEXT | null | JSON array of found photo URLs |
| paypal_transaction_id | TEXT | null | Recovery payment transaction |
| pickup_transaction_id | TEXT | null | Pickup payment transaction |
| shipping_address | TEXT | null | Delivery address |
| tracking_number | TEXT | null | Shipping tracking number |
| shipping_method | TEXT | null | DHL/EMS/etc. |
| estimated_delivery | TEXT | null | Expected delivery date |
| activity_log | JSONB | '[]' | Array of activity entries |
| auth_name | TEXT | null | Authorization legal name |
| auth_id_number | TEXT | null | Passport/ID number |
| auth_id_image | TEXT | null | ID photo URL |
| created_at | TIMESTAMPTZ | NOW() | Submission timestamp |

## RLS Policies

- INSERT: anon can insert (public form submission)
- SELECT: blocked for anon (read via server-side API with service role key)
- UPDATE: blocked for anon (update via server-side API with service role key)

## Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| report-images | Yes | User-uploaded item photos |
| found-images | Yes | Admin-uploaded found item photos |

## TypeScript Interfaces

```ts
// /types/report.ts

export interface Report {
  id: string
  case_number: string
  name: string
  email: string
  category: string
  brand_model: string | null
  color: string | null
  item_description: string
  distinguishing_features: string | null
  location: string
  location_detail: string | null
  date_lost: string
  date_confidence: string | null
  time_lost: string | null
  additional_info: string | null
  plan: 'recovery' | 'all_in_one' | 'delivery_only'
  status: 'pending' | 'found' | 'paid' | 'closed'
  process_stage: string
  phase2_stage: string | null
  recovery_location: string | null
  recovery_contact: string | null
  recovery_hours: string | null
  recovery_instructions: string | null
  user_images: string | null
  found_images: string | null
  paypal_transaction_id: string | null
  pickup_transaction_id: string | null
  shipping_address: string | null
  tracking_number: string | null
  shipping_method: string | null
  estimated_delivery: string | null
  activity_log: ActivityLogEntry[]
  auth_name: string | null
  auth_id_number: string | null
  auth_id_image: string | null
  created_at: string
}

export interface ActivityLogEntry {
  action: string
  timestamp: string
  note?: string
  user?: string
}
```

```ts
// /types/email.ts

export interface EmailPayload {
  to: string
  subject: string
  type: 'confirmation' | 'payment_link' | 'not_found' | 'info_request' | 'receipt' | 'shipping_quote' | 'tracking'
  caseNumber: string
  data: Record<string, any>
}
```

## Process Flow

### Phase 1: Search & Recovery
```
received → searching → found → payment_sent → paid
                    ↘ not_found (closed)
```

Status mapping:
- received, searching → status: pending
- found, payment_sent → status: found
- paid → status: paid
- not_found → status: closed

### Phase 2: Pickup & Delivery
```
pickup_scheduled → picked_up → shipping_quote → quote_accepted → shipped → delivered → completed
```

Activates when: plan = all_in_one OR pickup addon paid OR plan = delivery_only
