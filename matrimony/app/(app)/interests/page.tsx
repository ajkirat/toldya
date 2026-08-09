'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, X, Check, Clock } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useStore } from '@/lib/store';
import { calcAge, timeAgo } from '@/lib/utils';

type Tab = 'received' | 'sent' | 'mutual';

export default function InterestsPage() {
  const [tab, setTab] = useState<Tab>('received');
  const interests = useStore((s) => s.interests);
  const mutualIds = useStore((s) => s.mutualIds);
  const respondToInterest = useStore((s) => s.respondToInterest);
  const profiles = useStore((s) => s.profiles);

  const MY_PROFILE_ID = 'current-user-profile';

  const received = interests.filter(
    (i) => i.receiver_id === MY_PROFILE_ID && i.status === 'pending'
  );
  const sent = interests.filter((i) => i.sender_id === MY_PROFILE_ID);
  const mutual = profiles.filter((p) => mutualIds.has(p.id));

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: 'received', label: 'Received', count: received.length },
    { id: 'sent', label: 'Sent', count: sent.length },
    { id: 'mutual', label: 'Mutual', count: mutual.length },
  ];

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pt-10 pb-0">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Interests</h1>
        {/* Tabs */}
        <div className="flex">
          {TABS.map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === id
                  ? 'border-rose-600 text-rose-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                  tab === id ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Received */}
        {tab === 'received' && (
          <>
            {received.length === 0 && <EmptyState message="No pending interests yet." />}
            {received.map((interest) => {
              const sender = interest.sender;
              if (!sender) return null;
              return (
                <Card key={interest.id} className="p-4">
                  <Link href={`/profile/${sender.id}`} className="flex items-center gap-3 mb-3">
                    <Avatar name={sender.name} photo={sender.photos?.[0]} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{sender.name}</p>
                      <p className="text-xs text-gray-500">
                        {calcAge(sender.dob)} yrs · {sender.city}
                      </p>
                      {sender.occupation && (
                        <p className="text-xs text-gray-500">{sender.occupation}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 shrink-0">{timeAgo(interest.created_at)}</p>
                  </Link>
                  {interest.message && (
                    <p className="text-xs text-gray-600 bg-rose-50 rounded-lg p-2 mb-3 italic">
                      "{interest.message}"
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-red-500 border border-red-200 hover:bg-red-50"
                      onClick={() => respondToInterest(interest.id, false)}
                    >
                      <X className="h-4 w-4 mr-1" /> Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => respondToInterest(interest.id, true)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Accept
                    </Button>
                  </div>
                </Card>
              );
            })}
          </>
        )}

        {/* Sent */}
        {tab === 'sent' && (
          <>
            {sent.length === 0 && <EmptyState message="You haven't sent any interests yet." />}
            {sent.map((interest) => {
              const receiver = interest.receiver;
              if (!receiver) return null;
              return (
                <Card key={interest.id} className="p-4">
                  <Link href={`/profile/${receiver.id}`} className="flex items-center gap-3">
                    <Avatar name={receiver.name} photo={receiver.photos?.[0]} size="md" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{receiver.name}</p>
                      <p className="text-xs text-gray-500">
                        {calcAge(receiver.dob)} yrs · {receiver.city}
                      </p>
                    </div>
                    <StatusBadge status={interest.status} />
                  </Link>
                </Card>
              );
            })}
          </>
        )}

        {/* Mutual */}
        {tab === 'mutual' && (
          <>
            {mutual.length === 0 && (
              <EmptyState message="No mutual matches yet. Accept interests to connect!" />
            )}
            {mutual.map((profile) => (
              <Card key={profile.id} className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={profile.name} photo={profile.photos?.[0]} size="md" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{profile.name}</p>
                    <p className="text-xs text-gray-500">
                      {calcAge(profile.dob)} yrs · {profile.city}
                    </p>
                    <Badge variant="green" className="mt-1">Mutual Match ✓</Badge>
                  </div>
                  <Link href={`/messages/${profile.id}`}>
                    <Button variant="primary" size="sm">Message</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'accepted') return <Badge variant="green">Accepted ✓</Badge>;
  if (status === 'declined') return <Badge variant="gray">Declined</Badge>;
  return (
    <span className="flex items-center gap-1 text-xs text-amber-600">
      <Clock className="h-3 w-3" /> Pending
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center text-gray-400">
      <Heart className="h-8 w-8 mx-auto mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
