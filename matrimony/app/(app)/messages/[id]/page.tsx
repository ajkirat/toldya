'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useStore } from '@/lib/store';
import { cn, timeAgo } from '@/lib/utils';

const MY_PROFILE_ID = 'current-user-profile';

export default function ChatPage() {
  const { id: profileId } = useParams<{ id: string }>();
  const router = useRouter();
  const profiles = useStore((s) => s.profiles);
  const messages = useStore((s) => s.messages);
  const sendMessage = useStore((s) => s.sendMessage);
  const markRead = useStore((s) => s.markRead);

  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const otherProfile = profiles.find((p) => p.id === profileId);
  const convoMessages = messages.filter(
    (m) =>
      (m.sender_id === MY_PROFILE_ID && m.receiver_id === profileId) ||
      (m.sender_id === profileId && m.receiver_id === MY_PROFILE_ID)
  );

  useEffect(() => {
    if (profileId) markRead(profileId);
  }, [profileId, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convoMessages.length]);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !profileId) return;
    sendMessage(profileId, trimmed);
    setText('');
  }

  if (!otherProfile) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-3 bg-white border-b border-gray-100 sticky top-0 z-30">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 -ml-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar name={otherProfile.name} photo={otherProfile.photos?.[0]} size="sm" />
        <div>
          <p className="font-semibold text-gray-900 text-sm">{otherProfile.name}</p>
          <p className="text-xs text-green-500">Active recently</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {convoMessages.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Say hello! 👋</p>
            <p className="text-xs mt-1">You're now connected with {otherProfile.name.split(' ')[0]}</p>
          </div>
        )}

        {convoMessages.map((msg) => {
          const isMe = msg.sender_id === MY_PROFILE_ID;
          return (
            <div
              key={msg.id}
              className={cn('flex gap-2', isMe ? 'justify-end' : 'justify-start')}
            >
              {!isMe && (
                <Avatar name={otherProfile.name} photo={otherProfile.photos?.[0]} size="sm" className="self-end" />
              )}
              <div
                className={cn(
                  'max-w-[72%] rounded-2xl px-3.5 py-2.5 shadow-sm',
                  isMe
                    ? 'bg-rose-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-900 rounded-bl-sm'
                )}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={cn('text-[10px] mt-1', isMe ? 'text-rose-200' : 'text-gray-400')}>
                  {timeAgo(msg.created_at)}
                  {isMe && msg.read && ' · ✓✓'}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 pb-6 pt-3 flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 max-h-32 overflow-y-auto"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white shadow transition-all hover:bg-rose-700 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
