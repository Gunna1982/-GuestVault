// Lead Management Types for StaySteward CRM

export type LeadTier = 'enterprise' | 'growth' | 'starter' | 'unknown';
export type LicenseType = 'collective' | 'group' | 'multiple_individual' | 'single' | 'unknown';
export type TechSophistication = 'very_high' | 'high' | 'medium_high' | 'medium' | 'low' | 'unknown';
export type LeadSource = 'dbpr' | 'vrma' | 'pms_directory' | 'google' | 'airbnb_vrbo' | 'association' | 'referral' | 'web_research' | 'manual';

export type OutreachStatus =
  | 'not_contacted'
  | 'researching'
  | 'contacted'
  | 'responded'
  | 'demo_scheduled'
  | 'demo_completed'
  | 'proposal_sent'
  | 'negotiating'
  | 'converted'
  | 'lost'
  | 'not_a_fit';

export type OutreachPriority = 'tier_1' | 'tier_2' | 'tier_3' | 'monitor' | 'none';

export type ActivityType =
  | 'note'
  | 'email_sent'
  | 'email_received'
  | 'call'
  | 'meeting'
  | 'demo'
  | 'proposal'
  | 'status_change'
  | 'research'
  | 'import';

export interface Lead {
  id: string;
  organization_id: string;

  // Company
  company_name: string;
  brand_name: string | null;
  licensee_name: string | null;

  // Contact
  email: string | null;
  phone: string | null;
  website: string | null;
  contact_person: string | null;

  // Business
  tier: LeadTier;
  estimated_units: number;
  license_count: number;
  license_type: LicenseType;

  // Location
  market_area: string | null;
  counties: string[];
  cities: string[];
  state: string;

  // Intelligence
  pms_used: string | null;
  current_upsells: string | null;
  tech_sophistication: TechSophistication;
  guestvault_opportunity: string | null;
  services_offered: string | null;

  // Source
  source: LeadSource;
  source_detail: string | null;
  enrichment_notes: string | null;

  // Outreach
  outreach_status: OutreachStatus;
  outreach_priority: OutreachPriority;
  date_first_contacted: string | null;
  date_last_contacted: string | null;
  date_demo_scheduled: string | null;
  date_converted: string | null;
  contact_method: string | null;
  response_notes: string | null;

  // DBPR
  dbpr_license_numbers: string[];
  dbpr_rank_code: string | null;
  dbpr_modifier_code: string | null;
  mailing_address: string | null;

  // Meta
  tags: string[];
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  organization_id: string;
  activity_type: ActivityType;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface LeadFilters {
  search?: string;
  tier?: LeadTier | 'all';
  outreach_status?: OutreachStatus | 'all';
  outreach_priority?: OutreachPriority | 'all';
  source?: LeadSource | 'all';
  pms_used?: string;
  market_area?: string;
  county?: string;
  has_email?: boolean;
  has_website?: boolean;
  min_units?: number;
  max_units?: number;
  tags?: string[];
}

export interface LeadStats {
  total: number;
  by_tier: Record<LeadTier, number>;
  by_status: Record<OutreachStatus, number>;
  by_priority: Record<OutreachPriority, number>;
  by_source: Record<LeadSource, number>;
  with_email: number;
  with_website: number;
  with_phone: number;
  avg_units: number;
}

export interface LeadImportRow {
  company_name: string;
  brand_name?: string;
  licensee_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  contact_person?: string;
  tier?: LeadTier;
  estimated_units?: number;
  license_count?: number;
  license_type?: LicenseType;
  market_area?: string;
  counties?: string;
  cities?: string;
  pms_used?: string;
  current_upsells?: string;
  tech_sophistication?: TechSophistication;
  guestvault_opportunity?: string;
  services_offered?: string;
  source?: LeadSource;
  source_detail?: string;
  enrichment_notes?: string;
  outreach_priority?: OutreachPriority;
  tags?: string;
}
