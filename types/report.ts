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
