'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { useStore } from '@/lib/store';
import {
  EDUCATION_OPTIONS,
  INCOME_OPTIONS,
  COMMUNITY_OPTIONS,
  RELIGION_OPTIONS,
  MOTHER_TONGUE_OPTIONS,
  HEIGHT_OPTIONS,
  type Profile,
} from '@/lib/types';

export default function EditProfilePage() {
  const router = useRouter();
  const myProfile = useStore((s) => s.myProfile);
  const setMyProfile = useStore((s) => s.setMyProfile);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: myProfile?.name ?? '',
    about_me: myProfile?.about_me ?? '',
    occupation: myProfile?.occupation ?? '',
    education: myProfile?.education ?? '',
    income_range: myProfile?.income_range ?? '',
    city: myProfile?.city ?? '',
    state: myProfile?.state ?? '',
    community: myProfile?.community ?? '',
    religion: myProfile?.religion ?? '',
    mother_tongue: myProfile?.mother_tongue ?? '',
    height_cm: String(myProfile?.height_cm ?? ''),
  });

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    const updated: Profile = {
      ...myProfile!,
      ...form,
      height_cm: form.height_cm ? +form.height_cm : undefined,
      updated_at: new Date().toISOString(),
    };
    setMyProfile(updated);
    router.back();
  }

  if (!myProfile) {
    return <div className="p-8 text-center text-gray-500">No profile found.</div>;
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pt-8 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Edit Profile</h1>
      </div>

      <div className="p-4 space-y-5">
        <Section title="Basic">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
          <Textarea
            label="About Me"
            value={form.about_me}
            onChange={(e) => update('about_me', e.target.value)}
            placeholder="Tell people about yourself…"
          />
          <Select
            label="Community"
            options={COMMUNITY_OPTIONS.map((c) => ({ label: c, value: c }))}
            value={form.community}
            onChange={(e) => update('community', e.target.value)}
            placeholder="Select"
          />
          <Select
            label="Religion"
            options={RELIGION_OPTIONS.map((r) => ({ label: r, value: r }))}
            value={form.religion}
            onChange={(e) => update('religion', e.target.value)}
            placeholder="Select"
          />
          <Select
            label="Mother Tongue"
            options={MOTHER_TONGUE_OPTIONS.map((l) => ({ label: l, value: l }))}
            value={form.mother_tongue}
            onChange={(e) => update('mother_tongue', e.target.value)}
            placeholder="Select"
          />
        </Section>

        <Section title="Appearance">
          <Select
            label="Height"
            options={HEIGHT_OPTIONS.map((h) => ({ label: h.label, value: h.value }))}
            value={form.height_cm}
            onChange={(e) => update('height_cm', e.target.value)}
            placeholder="Select height"
          />
        </Section>

        <Section title="Career & Location">
          <Input
            label="Occupation"
            value={form.occupation}
            onChange={(e) => update('occupation', e.target.value)}
          />
          <Select
            label="Education"
            options={EDUCATION_OPTIONS.map((e) => ({ label: e, value: e }))}
            value={form.education}
            onChange={(e) => update('education', e.target.value)}
            placeholder="Select"
          />
          <Select
            label="Annual Income"
            options={INCOME_OPTIONS.map((i) => ({ label: i, value: i }))}
            value={form.income_range}
            onChange={(e) => update('income_range', e.target.value)}
            placeholder="Select"
          />
          <Input
            label="City"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
          />
          <Input
            label="State"
            value={form.state}
            onChange={(e) => update('state', e.target.value)}
          />
        </Section>
      </div>

      {/* Save button */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-3 bg-white border-t border-gray-100">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          loading={saving}
          onClick={handleSave}
        >
          <Save className="h-4 w-4 mr-1.5" /> Save Changes
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}
