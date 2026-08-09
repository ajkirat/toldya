/**
 * Mock data for local development / demo without a Supabase instance.
 * Replace with real Supabase calls once env vars are configured.
 */

import type { Profile, Interest, Message, Conversation } from './types';

export const MOCK_PROFILES: Profile[] = [
  {
    id: 'p1',
    user_id: 'u1',
    name: 'Priya Kulkarni',
    dob: '1997-03-15',
    gender: 'female',
    height_cm: 163,
    education: "Master's",
    occupation: 'Software Engineer',
    income_range: '10–20 LPA',
    city: 'Pune',
    state: 'Maharashtra',
    community: 'Marathi',
    mother_tongue: 'Marathi',
    religion: 'Hindu',
    about_me:
      'Love hiking, reading, and good chai. Looking for a partner who values both career and family.',
    photos: [],
    profile_status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    family: {
      id: 'f1',
      profile_id: 'p1',
      father_occupation: 'Retired Government Officer',
      mother_occupation: 'Homemaker',
      siblings: '1 brother',
      family_type: 'nuclear',
      family_values: 'moderate',
      native_place: 'Kolhapur',
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'p2',
    user_id: 'u2',
    name: 'Sneha Joshi',
    dob: '1998-07-22',
    gender: 'female',
    height_cm: 157,
    education: "Bachelor's",
    occupation: 'Doctor (MBBS)',
    income_range: '10–20 LPA',
    city: 'Mumbai',
    state: 'Maharashtra',
    community: 'Marathi',
    mother_tongue: 'Marathi',
    religion: 'Hindu',
    about_me: 'Passionate about medicine and social work. Family-oriented and love travelling.',
    photos: [],
    profile_status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p3',
    user_id: 'u3',
    name: 'Rahul Deshpande',
    dob: '1994-11-08',
    gender: 'male',
    height_cm: 175,
    education: "Master's",
    occupation: 'Product Manager',
    income_range: '20–50 LPA',
    city: 'Bangalore',
    state: 'Karnataka',
    community: 'Marathi',
    mother_tongue: 'Marathi',
    religion: 'Hindu',
    about_me: 'Startup enthusiast, weekend trekker, home chef wannabe.',
    photos: [],
    profile_status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p4',
    user_id: 'u4',
    name: 'Amit Patil',
    dob: '1993-05-30',
    gender: 'male',
    height_cm: 172,
    education: 'CA/CS',
    occupation: 'Chartered Accountant',
    income_range: '10–20 LPA',
    city: 'Pune',
    state: 'Maharashtra',
    community: 'Marathi',
    mother_tongue: 'Marathi',
    religion: 'Hindu',
    about_me: 'Simple, grounded person who believes in honest relationships and hard work.',
    photos: [],
    profile_status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p5',
    user_id: 'u5',
    name: 'Anjali Naik',
    dob: '1999-01-14',
    gender: 'female',
    height_cm: 160,
    education: "Bachelor's",
    occupation: 'Teacher',
    income_range: '3–5 LPA',
    city: 'Nagpur',
    state: 'Maharashtra',
    community: 'Marathi',
    mother_tongue: 'Marathi',
    religion: 'Hindu',
    about_me: 'Love teaching, art, and spending time with family. Traditional yet open-minded.',
    photos: [],
    profile_status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_INTERESTS: Interest[] = [
  {
    id: 'i1',
    sender_id: 'current-user-profile',
    receiver_id: 'p1',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    receiver: MOCK_PROFILES[0],
  },
  {
    id: 'i2',
    sender_id: 'p3',
    receiver_id: 'current-user-profile',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sender: MOCK_PROFILES[2],
  },
  {
    id: 'i3',
    sender_id: 'current-user-profile',
    receiver_id: 'p2',
    status: 'accepted',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    receiver: MOCK_PROFILES[1],
  },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender_id: 'p2',
    receiver_id: 'current-user-profile',
    content: 'Hi! Thanks for accepting my interest 😊',
    read: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'm2',
    sender_id: 'current-user-profile',
    receiver_id: 'p2',
    content: "Hi Sneha! Nice to connect. I really liked your profile.",
    read: true,
    created_at: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: 'm3',
    sender_id: 'p2',
    receiver_id: 'current-user-profile',
    content: 'Thank you! Tell me about yourself 😊',
    read: false,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    profile: MOCK_PROFILES[1],
    lastMessage: MOCK_MESSAGES[2],
    unreadCount: 1,
  },
];

export function calcAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
