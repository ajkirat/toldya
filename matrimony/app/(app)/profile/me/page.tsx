'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Settings, Edit3, Shield, LogOut, ChevronRight,
  Bell, Eye, Lock, HelpCircle
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import { calcAge, fmtHeight } from '@/lib/utils';

export default function MyProfilePage() {
  const router = useRouter();
  const myProfile = useStore((s) => s.myProfile);
  const clearAuth = useStore((s) => s.clearAuth);
  const isOnboarded = useStore((s) => s.isOnboarded);

  if (!isOnboarded || !myProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <span className="text-5xl mb-4">👤</span>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Complete your profile</h2>
        <p className="text-gray-500 text-sm mb-6">
          Create your profile to start finding matches.
        </p>
        <Link href="/profile/create">
          <Button variant="primary" size="lg">Create Profile →</Button>
        </Link>
      </div>
    );
  }

  const age = calcAge(myProfile.dob);

  const statusColor =
    myProfile.profile_status === 'active' ? 'green' :
    myProfile.profile_status === 'pending' ? 'yellow' : 'gray';

  // Completeness
  const fields = ['name', 'dob', 'occupation', 'city', 'about_me', 'education', 'community'] as const;
  const filled = fields.filter((f) => myProfile[f]).length;
  const pct = Math.round((filled / fields.length) * 100);

  return (
    <div>
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pt-10 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <Link href="/profile/edit">
          <button className="text-rose-600 hover:text-rose-700 flex items-center gap-1 text-sm font-medium">
            <Edit3 className="h-4 w-4" /> Edit
          </button>
        </Link>
      </div>

      <div className="p-4 space-y-4">
        {/* Hero card */}
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <Avatar name={myProfile.name} photo={myProfile.photos?.[0]} size="lg" />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900">{myProfile.name}</h2>
              <p className="text-sm text-gray-500">
                {age} yrs{myProfile.height_cm ? `, ${fmtHeight(myProfile.height_cm)}` : ''}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <Badge variant={statusColor as 'green' | 'yellow' | 'gray'}>
                  {myProfile.profile_status === 'active' ? '● Active' :
                   myProfile.profile_status === 'pending' ? '⏳ Under Review' : myProfile.profile_status}
                </Badge>
                {myProfile.community && <Badge variant="rose">{myProfile.community}</Badge>}
              </div>
            </div>
          </div>

          {/* Completeness bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Profile Completeness</span>
              <span className="font-medium text-rose-600">{pct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-rose-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            {pct < 100 && (
              <p className="text-xs text-gray-400 mt-1">
                Complete your profile for better visibility
              </p>
            )}
          </div>
        </Card>

        {/* Quick info */}
        <Card className="divide-y divide-gray-100">
          {[
            { label: 'Occupation', value: myProfile.occupation },
            { label: 'City', value: myProfile.city },
            { label: 'Education', value: myProfile.education },
            { label: 'Income', value: myProfile.income_range },
            { label: 'Religion', value: myProfile.religion },
          ].map(({ label, value }) =>
            value ? (
              <div key={label} className="flex justify-between items-center px-4 py-3">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-medium text-gray-800">{value}</span>
              </div>
            ) : null
          )}
        </Card>

        {/* About */}
        {myProfile.about_me && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1.5">About Me</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{myProfile.about_me}</p>
          </Card>
        )}

        {/* Settings menu */}
        <Card className="divide-y divide-gray-100 overflow-hidden">
          {[
            { icon: Shield, label: 'ID Verification', badge: 'Pending', href: '#' },
            { icon: Bell, label: 'Notifications', href: '#' },
            { icon: Eye, label: 'Privacy Settings', href: '#' },
            { icon: Lock, label: 'Change Password', href: '#' },
            { icon: HelpCircle, label: 'Help & Support', href: '#' },
          ].map(({ icon: Icon, label, badge, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <Icon className="h-4 w-4 text-gray-400" />
              <span className="flex-1 text-sm text-gray-700">{label}</span>
              {badge && <Badge variant="yellow">{badge}</Badge>}
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </Link>
          ))}
        </Card>

        {/* Sign out */}
        <Button
          variant="ghost"
          fullWidth
          className="text-red-500 hover:bg-red-50"
          onClick={() => { clearAuth(); router.push('/login'); }}
        >
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </Button>

        <p className="text-center text-xs text-gray-400 pb-4">Bandhan v1.0 MVP</p>
      </div>
    </div>
  );
}
