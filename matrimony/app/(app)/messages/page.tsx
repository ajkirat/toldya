'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useStore } from '@/lib/store';
import { timeAgo } from '@/lib/utils';

export default function MessagesPage() {
  const conversations = useStore((s) => s.conversations);

  return (
    <div>
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pt-10 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500">Only with mutual connections</p>
      </div>

      <div className="divide-y divide-gray-100">
        {conversations.length === 0 && (
          <div className="py-20 text-center text-gray-400 px-6">
            <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium mb-1">No conversations yet</p>
            <p className="text-xs">Accept an interest or get accepted to start messaging.</p>
          </div>
        )}

        {conversations.map(({ profile, lastMessage, unreadCount }) => (
          <Link
            key={profile.id}
            href={`/messages/${profile.id}`}
            className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="relative">
              <Avatar name={profile.name} photo={profile.photos?.[0]} size="md" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <p className={`text-sm ${unreadCount > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                  {profile.name}
                </p>
                {lastMessage && (
                  <span className="text-xs text-gray-400 shrink-0 ml-2">
                    {timeAgo(lastMessage.created_at)}
                  </span>
                )}
              </div>
              {lastMessage && (
                <p className={`text-xs truncate mt-0.5 ${unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                  {lastMessage.sender_id === 'current-user-profile' ? 'You: ' : ''}
                  {lastMessage.content}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
