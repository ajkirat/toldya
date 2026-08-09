'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Heart, MessageCircle, MapPin, GraduationCap, Briefcase,
  Users, Home, Flag, Ruler, Flag as FlagIcon, Share2, MoreVertical
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useStore } from '@/lib/store';
import { calcAge, fmtHeight } from '@/lib/utils';

export default function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const profiles = useStore((s) => s.profiles);
  const sentInterestIds = useStore((s) => s.sentInterestIds);
  const mutualIds = useStore((s) => s.mutualIds);
  const sendInterest = useStore((s) => s.sendInterest);

  const profile = profiles.find((p) => p.id === id);

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Profile not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-rose-600 text-sm">Go back</button>
      </div>
    );
  }

  const age = calcAge(profile.dob);
  const isSent = sentInterestIds.has(profile.id);
  const isMutual = mutualIds.has(profile.id);

  return (
    <div className="pb-28">
      {/* Header with back */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-white/90 backdrop-blur border-b border-gray-100 px-4 pt-8 pb-3">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          <button className="text-gray-400 hover:text-gray-600">
            <Share2 className="h-5 w-5" />
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Photo / hero */}
      <div className="bg-gradient-to-br from-rose-100 to-pink-200 h-72 flex items-center justify-center relative">
        <Avatar name={profile.name} photo={profile.photos?.[0]} size="xl" className="h-40 w-40 text-4xl" />
        {isMutual && (
          <div className="absolute top-4 left-4">
            <Badge variant="green">Mutual Match ✓</Badge>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Name + basics */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-gray-500 mt-0.5">
            {age} years old · {profile.gender === 'male' ? 'Groom' : 'Bride'}
            {profile.height_cm ? ` · ${fmtHeight(profile.height_cm)}` : ''}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {profile.community && <Badge variant="rose">{profile.community}</Badge>}
            {profile.religion && <Badge variant="gray">{profile.religion}</Badge>}
            {profile.mother_tongue && <Badge variant="blue">{profile.mother_tongue}</Badge>}
          </div>
        </div>

        {/* Quick facts */}
        <Card className="p-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">Profile Details</h2>
          <div className="space-y-2.5">
            <DetailRow icon={MapPin} label="Location" value={[profile.city, profile.state].filter(Boolean).join(', ')} />
            <DetailRow icon={GraduationCap} label="Education" value={profile.education} />
            <DetailRow icon={Briefcase} label="Occupation" value={profile.occupation} />
            {profile.income_range && (
              <DetailRow icon={Briefcase} label="Income" value={profile.income_range} />
            )}
            {profile.height_cm && (
              <DetailRow icon={Ruler} label="Height" value={fmtHeight(profile.height_cm)} />
            )}
          </div>
        </Card>

        {/* About */}
        {profile.about_me && (
          <Card className="p-4">
            <h2 className="font-semibold text-gray-900 text-sm mb-2">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{profile.about_me}</p>
          </Card>
        )}

        {/* Family */}
        {profile.family && (
          <Card className="p-4">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Family</h2>
            <div className="space-y-2.5">
              {profile.family.family_type && (
                <DetailRow icon={Home} label="Family Type" value={profile.family.family_type} />
              )}
              {profile.family.family_values && (
                <DetailRow icon={Users} label="Family Values" value={profile.family.family_values} />
              )}
              {profile.family.native_place && (
                <DetailRow icon={FlagIcon} label="Native Place" value={profile.family.native_place} />
              )}
              {profile.family.father_occupation && (
                <DetailRow icon={Briefcase} label="Father's Occupation" value={profile.family.father_occupation} />
              )}
              {profile.family.mother_occupation && (
                <DetailRow icon={Briefcase} label="Mother's Occupation" value={profile.family.mother_occupation} />
              )}
              {profile.family.siblings && (
                <DetailRow icon={Users} label="Siblings" value={profile.family.siblings} />
              )}
            </div>
          </Card>
        )}

        {/* Partner preferences */}
        {profile.preferences && (
          <Card className="p-4">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Partner Preferences</h2>
            <div className="space-y-2.5">
              <DetailRow
                icon={Users}
                label="Age Range"
                value={`${profile.preferences.age_min}–${profile.preferences.age_max} years`}
              />
              {profile.preferences.education_pref?.length ? (
                <DetailRow icon={GraduationCap} label="Education" value={profile.preferences.education_pref.join(', ')} />
              ) : null}
              {profile.preferences.city_pref?.length ? (
                <DetailRow icon={MapPin} label="City" value={profile.preferences.city_pref.join(', ')} />
              ) : null}
            </div>
          </Card>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-20 mx-auto max-w-lg px-4 pb-3">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 flex gap-3">
          {isMutual ? (
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => router.push(`/messages/${profile.id}`)}
            >
              <MessageCircle className="h-5 w-5 mr-1" />
              Send Message
            </Button>
          ) : isSent ? (
            <Button variant="secondary" fullWidth size="lg" disabled>
              Interest Sent ✓
            </Button>
          ) : (
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => sendInterest(profile.id)}
            >
              <Heart className="h-5 w-5 mr-1" />
              Express Interest
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-400 leading-none mb-0.5">{label}</p>
        <p className="text-sm text-gray-800 capitalize">{value}</p>
      </div>
    </div>
  );
}
