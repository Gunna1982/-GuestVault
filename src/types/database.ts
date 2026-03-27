// ─── Core Database Types ─────────────────────────────────────────────────────

export type Plan = 'free' | 'growth' | 'pro' | 'enterprise';
export type ReservationStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'refunded' | 'failed';
export type UpsellCategory = 'checkout' | 'transport' | 'grocery' | 'cleaning' | 'experience' | 'equipment' | 'chef' | 'custom';
export type PriceType = 'fixed' | 'per_person' | 'per_night';
export type Channel = 'airbnb' | 'vrbo' | 'direct' | 'booking';
export type GuestSource = 'check_in_portal' | 'pms_sync' | 'wifi' | 'manual';
export type SequenceTrigger = 'post_checkout' | 'post_booking' | 'anniversary' | 'winback_30d' | 'winback_60d' | 'winback_90d' | 'seasonal' | 'manual';
export type EmailStatus = 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed' | 'unsubscribed';

export interface BrandConfig {
  logo_url?: string;
  primary_color: string;
  font?: string;
  welcome_message?: string;
}

export interface PropertyInfo {
  wifi_name?: string;
  wifi_pass?: string;
  checkout_time?: string;
  check_in_instructions?: string;
  house_rules?: string;
  parking?: string;
  trash?: string;
  emergency_contacts?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

export interface PropertyImage {
  url: string;
  alt?: string;
  order: number;
}

// ─── Table Interfaces ────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_user_id: string;
  plan: Plan;
  stripe_account_id: string | null;
  custom_domain: string | null;
  brand_config: BrandConfig;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Property {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  address: Address | null;
  description: string | null;
  images: PropertyImage[];
  property_info: PropertyInfo;
  pms_source: string | null;
  pms_external_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  organization_id: string;
  property_id: string;
  pms_external_id: string | null;
  channel: Channel | null;
  check_in: string;
  check_out: string;
  guest_count: number | null;
  total_amount: number | null;
  currency: string;
  status: ReservationStatus;
  portal_token: string;
  portal_accessed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Guest {
  id: string;
  organization_id: string;
  reservation_id: string;
  email: string | null;
  email_verified: boolean;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  is_primary: boolean;
  marketing_consent: boolean;
  consent_timestamp: string | null;
  consent_ip: string | null;
  source: GuestSource;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface UpsellTemplate {
  id: string;
  organization_id: string;
  category: UpsellCategory;
  name: string;
  description: string | null;
  image_url: string | null;
  price_cents: number;
  price_type: PriceType;
  currency: string;
  provider_id: string | null;
  host_revenue_pct: number;
  requires_lead_time: number | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface UpsellOrder {
  id: string;
  organization_id: string;
  reservation_id: string;
  guest_id: string;
  upsell_template_id: string;
  quantity: number;
  amount_cents: number;
  platform_fee_cents: number;
  host_payout_cents: number;
  provider_payout_cents: number;
  stripe_payment_id: string | null;
  stripe_transfer_id: string | null;
  status: OrderStatus;
  fulfilled_at: string | null;
  created_at: string;
}

export interface ServiceProvider {
  id: string;
  organization_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  service_type: string | null;
  stripe_account_id: string | null;
  commission_pct: number;
  is_active: boolean;
  created_at: string;
}
