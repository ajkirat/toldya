'use client';

import Link from 'next/link';
import { Search, Heart, Shield, Star, ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { useStore } from '@/lib/store';
import { calcAge } from '@/lib/utils';
import { MOCK_PROFILES } from '@/lib/mock-data';

export default function DashboardPage() {
  const myProfile = useStore((s) => s.myProfile);
  const sentInterestIds = useStore((s) => s.sentInterestIds);
  const interests = useStore((s) => s.interests);
  const sendInterest = useStore((s) => s.sendInterest);

  const pendingReceived = interests.filter(
    (i) => i.receiver_id === 'current-user-profile' && i.status === 'pending'
  );

  // Suggested profiles (exclude already interacted)
  const suggested = MOCK_PROFILES.filter(
    (p) => p.id !== myProfile?.id && !sentInterestIds.has(p.id)
  ).slice(0, 4);

  // Profile completeness
  const completionFields = ['name', 'dob', 'occupation', 'city', 'about_me', 'education', 'community'] as const;
  const filledFields = myProfile
    ? completionFields.filter((f) => myProfile[f]).length
    : 0;
  const completionPct = Math.round((filledFields / completionFields.length) * 100);

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Hey, {myProfile?.name?.split(' ')[0] ?? 'there'} 👋
            </h1>
            <p className="text-sm text-gray-500">
              {suggested.length} new matches today
            </p>
          </div>
          <Avatar name={myProfile?.name ?? 'Me'} photo={myProfile?.photos?.[0]} size="md" />
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Profile completion nudge */}
        {completionPct < 100 && (
          <Card className="p-4 border-rose-100 bg-rose-50">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-rose-800">
                  Complete your profile — {completionPct}% done
                </p>
                <p className="text-xs text-rose-600 mt-0.5">
                  Profiles with 100% completion get 3× more interest
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-rose-200">
                  <div
                    className="h-2 rounded-full bg-rose-600 transition-all"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
              <Link href="/profile/edit">
                <Button variant="primary" size="sm">Complete</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Heart, label: 'Interests', value: interests.filter(i => i.sender_id === 'current-user-profile').length, color: 'text-rose-600', bg: 'bg-rose-50' },
            { icon: Star, label: 'Received', value: pendingReceived.length, color: 'text-amber-600', bg: 'bg-amber-50' },
            { icon: Shield, label: 'Matches', value: useStore.getState().mutualIds.size, color: 'text-green-600', bg: 'bg-green-50' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <Card key={label} className="p-3 text-center">
              <div className={`inline-flex p-2 rounded-xl ${bg} mb-1`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </Card>
          ))}
        </div>

        {/* New interests received */}
        {pendingReceived.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 text-sm">New Interests ✨</h2>
              <Link href="/interests" className="text-xs text-rose-600 flex items-center gap-0.5">
                See all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {pendingReceived.slice(0, 5).map((interest) => {
                const sender = interest.sender;
                if (!sender) return null;
                return (
                  <Link
                    key={interest.id}
                    href={`/profile/${sender.id}`}
                    className="flex-shrink-0 text-center"
                  >
                    <div className="relative">
                      <Avatar name={sender.name} photo={sender.photos?.[0]} size="lg" />
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white text-xs">
                        ♥
                      </span>
                    </div>
                    <p className="text-xs mt-1.5 text-gray-700 font-medium w-16 truncate">
                      {sender.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-gray-400">{calcAge(sender.dob)} yrs</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Suggested matches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 text-sm">Suggested for you</h2>
            <Link href="/search" className="text-xs text-rose-600 flex items-center gap-0.5">
              Browse all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {suggested.map((p) => (
              <ProfileCard
                key={p.id}
                profile={p}
                sent={sentInterestIds.has(p.id)}
                onInterest={sendInterest}
                compact
              />
            ))}
          </div>
          {suggested.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500 text-sm">You've explored everyone for now.</p>
              <Link href="/search" className="mt-3 inline-block">
                <Button variant="secondary" size="sm">
                  <Search className="h-4 w-4 mr-1" />
                  Search profiles
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
