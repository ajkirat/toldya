// ─────────────────────────────────────────────
// Core domain types – mirror the Supabase schema
// ─────────────────────────────────────────────

export type ProfileStatus = 'draft' | 'pending' | 'active' | 'suspended';
export type Gender = 'male' | 'female' | 'other';
export type InterestStatus = 'pending' | 'accepted' | 'declined';
export type FamilyType = 'nuclear' | 'joint' | 'extended';
export type FamilyValues = 'traditional' | 'moderate' | 'liberal';
export type DocType = 'aadhaar' | 'pan' | 'passport' | 'selfie';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  dob: string;               // ISO date
  gender: Gender;
  height_cm?: number;
  education?: string;
  occupation?: string;
  income_range?: string;
  city?: string;
  state?: string;
  community?: string;
  mother_tongue?: string;
  religion?: string;
  about_me?: string;
  photos: string[];
  profile_status: ProfileStatus;
  created_at: string;
  updated_at: string;
  // joined from family_details
  family?: FamilyDetails;
  // joined from partner_preferences
  preferences?: PartnerPreferences;
}

export interface FamilyDetails {
  id: string;
  profile_id: string;
  father_occupation?: string;
  mother_occupation?: string;
  siblings?: string;
  family_type?: FamilyType;
  family_values?: FamilyValues;
  native_place?: string;
  created_at: string;
}

export interface PartnerPreferences {
  id: string;
  profile_id: string;
  age_min: number;
  age_max: number;
  height_min_cm?: number;
  height_max_cm?: number;
  education_pref?: string[];
  community_pref?: string[];
  city_pref?: string[];
  income_pref?: string;
  religion_pref?: string[];
  family_type_pref?: string[];
  created_at: string;
  updated_at: string;
}

export interface Interest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: InterestStatus;
  message?: string;
  created_at: string;
  updated_at: string;
  // populated joins
  sender?: Profile;
  receiver?: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  profile: Profile;
  lastMessage?: Message;
  unreadCount: number;
}

export interface ProfileView {
  id: string;
  viewer_id: string;
  viewed_id: string;
  viewed_at: string;
  viewer?: Profile;
}

export interface Verification {
  id: string;
  profile_id: string;
  doc_type: DocType;
  doc_url: string;
  status: VerificationStatus;
  notes?: string;
  created_at: string;
  verified_at?: string;
}

// ─── Search / filter shape ───────────────────

export interface SearchFilters {
  gender?: Gender;
  age_min?: number;
  age_max?: number;
  community?: string[];
  religion?: string[];
  city?: string[];
  education?: string[];
  income_range?: string[];
  family_type?: FamilyType[];
  height_min_cm?: number;
  height_max_cm?: number;
}

// ─── Wizard step shapes ──────────────────────

export type WizardStep =
  | 'basic'
  | 'appearance'
  | 'career'
  | 'family'
  | 'preferences'
  | 'photos'
  | 'review';

export const WIZARD_STEPS: WizardStep[] = [
  'basic',
  'appearance',
  'career',
  'family',
  'preferences',
  'photos',
  'review',
];

// ─── Constants / options ─────────────────────

export const EDUCATION_OPTIONS = [
  'High School',
  'Diploma',
  "Bachelor's",
  "Master's",
  'PhD',
  'CA/CS',
  'MBBS/MD',
  'LLB',
  'Other',
];

export const INCOME_OPTIONS = [
  'Below 3 LPA',
  '3–5 LPA',
  '5–10 LPA',
  '10–20 LPA',
  '20–50 LPA',
  '50+ LPA',
  "Prefer not to say",
];

export const COMMUNITY_OPTIONS = [
  'Marathi',
  'Gujarati',
  'Punjabi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Bengali',
  'Malayali',
  'Rajasthani',
  'Sindhi',
  'Other',
];

export const RELIGION_OPTIONS = [
  'Hindu',
  'Muslim',
  'Christian',
  'Sikh',
  'Jain',
  'Buddhist',
  'Parsi',
  'Other',
];

export const MOTHER_TONGUE_OPTIONS = [
  'Marathi',
  'Hindi',
  'Gujarati',
  'Punjabi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Bengali',
  'Malayalam',
  'Other',
];

export const HEIGHT_OPTIONS = Array.from({ length: 41 }, (_, i) => {
  const cm = 145 + i;
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return { label: `${feet}'${inches}" (${cm} cm)`, value: cm };
});
