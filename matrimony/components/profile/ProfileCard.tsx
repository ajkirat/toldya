'use client';

import Link from 'next/link';
import { Heart, X, MessageCircle, MapPin, GraduationCap, Briefcase } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { calcAge, fmtHeight } from '@/lib/utils';
import type { Profile } from '@/lib/types';

interface ProfileCardProps {
  profile: Profile;
  sent?: boolean;
  mutual?: boolean;
  onInterest?: (profileId: string) => void;
  onDecline?: (profileId: string) => void;
  compact?: boolean;
}

export function ProfileCard({
  profile,
  sent,
  mutual,
  onInterest,
  onDecline,
  compact = false,
}: ProfileCardProps) {
  const age = calcAge(profile.dob);

  return (
    <Card hover className="overflow-hidden">
      <Link href={`/profile/${profile.id}`} className="block">
        {/* Photo strip */}
        <div className="relative h-48 bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center">
          <Avatar name={profile.name} photo={profile.photos?.[0]} size="xl" />
          {profile.profile_status === 'active' && (
            <span className="absolute top-3 right-3 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-700 font-medium">Active</span>
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-base">{profile.name}</h3>
              <p className="text-sm text-gray-500">
                {age} yrs{profile.height_cm ? `, ${fmtHeight(profile.height_cm)}` : ''}
              </p>
            </div>
            {mutual && (
              <Badge variant="green" className="shrink-0">Mutual ✓</Badge>
            )}
          </div>

          {!compact && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {profile.community && (
                  <Badge variant="rose">{profile.community}</Badge>
                )}
                {profile.religion && (
                  <Badge variant="gray">{profile.religion}</Badge>
                )}
              </div>

              <div className="space-y-1">
                {profile.city && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {profile.city}{profile.state ? `, ${profile.state}` : ''}
                  </div>
                )}
                {profile.education && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <GraduationCap className="h-3 w-3" />
                    {profile.education}
                  </div>
                )}
                {profile.occupation && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Briefcase className="h-3 w-3" />
                    {profile.occupation}
                  </div>
                )}
              </div>

              {profile.about_me && (
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                  {profile.about_me}
                </p>
              )}
            </>
          )}
        </div>
      </Link>

      {/* Actions */}
      {(onInterest || onDecline || mutual) && (
        <div className="px-4 pb-4 flex gap-2">
          {mutual ? (
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              className="gap-1.5"
              onClick={(e) => { e.preventDefault(); }}
            >
              <MessageCircle className="h-4 w-4" />
              Message
            </Button>
          ) : sent ? (
            <Button variant="ghost" size="sm" fullWidth disabled>
              Interest Sent ✓
            </Button>
          ) : (
            <>
              {onDecline && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-500"
                  onClick={(e) => { e.preventDefault(); onDecline(profile.id); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {onInterest && (
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="gap-1.5"
                  onClick={(e) => { e.preventDefault(); onInterest(profile.id); }}
                >
                  <Heart className="h-4 w-4" />
                  Express Interest
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
