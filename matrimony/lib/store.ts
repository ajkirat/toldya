/**
 * Global client-side state (Zustand).
 * In production, most of this is fetched from Supabase.
 * Here we seed with mock data so the app is fully interactive offline.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile, Interest, Message, Conversation } from './types';
import {
  MOCK_PROFILES,
  MOCK_INTERESTS,
  MOCK_MESSAGES,
  MOCK_CONVERSATIONS,
} from './mock-data';

interface AuthState {
  userId: string | null;
  myProfile: Profile | null;
  isOnboarded: boolean;
}

interface DataState {
  profiles: Profile[];
  interests: Interest[];
  messages: Message[];
  conversations: Conversation[];
  sentInterestIds: Set<string>;    // profile ids we've sent interest to
  receivedInterestIds: Set<string>; // profile ids who sent us interest
  mutualIds: Set<string>;           // mutually accepted
}

interface Actions {
  // auth
  setAuth: (userId: string, profile: Profile | null) => void;
  setMyProfile: (profile: Profile) => void;
  clearAuth: () => void;

  // interests
  sendInterest: (toProfileId: string, message?: string) => void;
  respondToInterest: (interestId: string, accept: boolean) => void;

  // messages
  sendMessage: (toProfileId: string, content: string) => void;
  markRead: (fromProfileId: string) => void;
}

type Store = AuthState & DataState & Actions;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // auth
      userId: null,
      myProfile: null,
      isOnboarded: false,

      // data — seeded from mock
      profiles: MOCK_PROFILES,
      interests: MOCK_INTERESTS,
      messages: MOCK_MESSAGES,
      conversations: MOCK_CONVERSATIONS,
      sentInterestIds: new Set(
        MOCK_INTERESTS
          .filter((i) => i.sender_id === 'current-user-profile')
          .map((i) => i.receiver_id)
      ),
      receivedInterestIds: new Set(
        MOCK_INTERESTS
          .filter((i) => i.receiver_id === 'current-user-profile' && i.status === 'pending')
          .map((i) => i.sender_id)
      ),
      mutualIds: new Set(
        MOCK_INTERESTS
          .filter((i) => i.status === 'accepted')
          .flatMap((i) => [i.sender_id, i.receiver_id])
          .filter((id) => id !== 'current-user-profile')
      ),

      // ── actions ──────────────────────────────────────────────

      setAuth: (userId, profile) =>
        set({ userId, myProfile: profile, isOnboarded: !!profile }),

      setMyProfile: (profile) => set({ myProfile: profile, isOnboarded: true }),

      clearAuth: () =>
        set({ userId: null, myProfile: null, isOnboarded: false }),

      sendInterest: (toProfileId, message) => {
        const newInterest: Interest = {
          id: `i_${Date.now()}`,
          sender_id: 'current-user-profile',
          receiver_id: toProfileId,
          status: 'pending',
          message,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          receiver: get().profiles.find((p) => p.id === toProfileId),
        };
        const sentInterestIds = new Set(get().sentInterestIds);
        sentInterestIds.add(toProfileId);
        set((s) => ({
          interests: [...s.interests, newInterest],
          sentInterestIds,
        }));
      },

      respondToInterest: (interestId, accept) => {
        const updated = get().interests.map((i) =>
          i.id === interestId
            ? { ...i, status: (accept ? 'accepted' : 'declined') as Interest['status'] }
            : i
        );
        const acceptedInterest = updated.find((i) => i.id === interestId && i.status === 'accepted');
        if (acceptedInterest) {
          const mutualIds = new Set(get().mutualIds);
          mutualIds.add(acceptedInterest.sender_id);
          const senderProfile = get().profiles.find((p) => p.id === acceptedInterest.sender_id);
          const newConv: Conversation = {
            profile: senderProfile!,
            unreadCount: 0,
          };
          set((s) => ({
            interests: updated,
            mutualIds,
            conversations: [...s.conversations.filter(c => c.profile.id !== acceptedInterest.sender_id), newConv],
          }));
        } else {
          set({ interests: updated });
        }
      },

      sendMessage: (toProfileId, content) => {
        const msg: Message = {
          id: `m_${Date.now()}`,
          sender_id: 'current-user-profile',
          receiver_id: toProfileId,
          content,
          read: false,
          created_at: new Date().toISOString(),
        };
        set((s) => ({
          messages: [...s.messages, msg],
          conversations: s.conversations.map((c) =>
            c.profile.id === toProfileId
              ? { ...c, lastMessage: msg }
              : c
          ),
        }));
      },

      markRead: (fromProfileId) => {
        set((s) => ({
          messages: s.messages.map((m) =>
            m.sender_id === fromProfileId ? { ...m, read: true } : m
          ),
          conversations: s.conversations.map((c) =>
            c.profile.id === fromProfileId ? { ...c, unreadCount: 0 } : c
          ),
        }));
      },
    }),
    {
      name: 'matrimony-store',
      // don't persist Sets (not serialisable by default)
      partialize: (s) => ({
        userId: s.userId,
        myProfile: s.myProfile,
        isOnboarded: s.isOnboarded,
      }),
    }
  )
);
