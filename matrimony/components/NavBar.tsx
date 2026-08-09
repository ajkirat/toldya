'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

const NAV_ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/interests', icon: Heart, label: 'Interests' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/profile/me', icon: User, label: 'Profile' },
];

export function NavBar() {
  const pathname = usePathname();
  const conversations = useStore((s) => s.conversations);
  const unread = conversations.reduce((n, c) => n + c.unreadCount, 0);
  const interests = useStore((s) => s.interests);
  const pendingReceived = interests.filter(
    (i) => i.receiver_id === 'current-user-profile' && i.status === 'pending'
  ).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          const badge =
            href === '/messages' ? unread :
            href === '/interests' ? pendingReceived : 0;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors',
                active ? 'text-rose-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5', active && 'fill-rose-100')} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px] font-medium', active ? 'text-rose-600' : 'text-gray-400')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
