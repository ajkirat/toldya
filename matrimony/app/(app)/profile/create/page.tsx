'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
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
  WIZARD_STEPS,
  type WizardStep,
  type Profile,
  type Gender,
  type FamilyType,
  type FamilyValues,
} from '@/lib/types';

const STEP_LABELS: Record<WizardStep, string> = {
  basic:       'Basic Info',
  appearance:  'Appearance',
  career:      'Career',
  family:      'Family',
  preferences: 'Partner Prefs',
  photos:      'Photos',
  review:      'Review',
};

const STEP_ICONS: Record<WizardStep, string> = {
  basic:       '👤',
  appearance:  '📏',
  career:      '💼',
  family:      '🏠',
  preferences: '❤️',
  photos:      '📸',
  review:      '✅',
};

interface WizardData {
  // basic
  name: string;
  dob: string;
  gender: Gender | '';
  community: string;
  religion: string;
  mother_tongue: string;
  about_me: string;
  // appearance
  height_cm: string;
  // career
  education: string;
  occupation: string;
  income_range: string;
  city: string;
  state: string;
  // family
  family_type: FamilyType | '';
  family_values: FamilyValues | '';
  father_occupation: string;
  mother_occupation: string;
  siblings: string;
  native_place: string;
  // preferences
  pref_age_min: string;
  pref_age_max: string;
  pref_community: string[];
  pref_religion: string[];
  pref_city: string;
}

const INITIAL: WizardData = {
  name: '', dob: '', gender: '', community: '', religion: '',
  mother_tongue: '', about_me: '', height_cm: '', education: '',
  occupation: '', income_range: '', city: '', state: '',
  family_type: '', family_values: '', father_occupation: '',
  mother_occupation: '', siblings: '', native_place: '',
  pref_age_min: '21', pref_age_max: '35', pref_community: [],
  pref_religion: [], pref_city: '',
};

export default function CreateProfilePage() {
  const router = useRouter();
  const setMyProfile = useStore((s) => s.setMyProfile);
  const [step, setStep] = useState<WizardStep>('basic');
  const [data, setData] = useState<WizardData>(INITIAL);
  const [saving, setSaving] = useState(false);

  const stepIdx = WIZARD_STEPS.indexOf(step);

  function set(key: keyof WizardData, value: WizardData[keyof WizardData]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function toggleArr(key: 'pref_community' | 'pref_religion', val: string) {
    setData((d) => {
      const arr = d[key] as string[];
      return {
        ...d,
        [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
      };
    });
  }

  function prev() {
    if (stepIdx > 0) setStep(WIZARD_STEPS[stepIdx - 1]);
  }

  async function next() {
    if (step === 'review') {
      await save();
      return;
    }
    setStep(WIZARD_STEPS[stepIdx + 1]);
  }

  async function save() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate API call

    const profile: Profile = {
      id: 'current-user-profile',
      user_id: 'demo-user-id',
      name: data.name,
      dob: data.dob,
      gender: (data.gender || 'other') as Gender,
      height_cm: data.height_cm ? +data.height_cm : undefined,
      education: data.education || undefined,
      occupation: data.occupation || undefined,
      income_range: data.income_range || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      community: data.community || undefined,
      mother_tongue: data.mother_tongue || undefined,
      religion: data.religion || undefined,
      about_me: data.about_me || undefined,
      photos: [],
      profile_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMyProfile(profile);
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-900">Create Profile</h1>
          <span className="text-sm text-gray-500">
            {stepIdx + 1} / {WIZARD_STEPS.length}
          </span>
        </div>
        {/* Step progress dots */}
        <div className="flex gap-1.5">
          {WIZARD_STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= stepIdx ? 'bg-rose-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        {/* Step name */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xl">{STEP_ICONS[step]}</span>
          <span className="font-semibold text-gray-800">{STEP_LABELS[step]}</span>
        </div>
      </div>

      {/* Step content */}
      <div className="p-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          {step === 'basic' && (
            <BasicStep data={data} set={set} />
          )}
          {step === 'appearance' && (
            <AppearanceStep data={data} set={set} />
          )}
          {step === 'career' && (
            <CareerStep data={data} set={set} />
          )}
          {step === 'family' && (
            <FamilyStep data={data} set={set} />
          )}
          {step === 'preferences' && (
            <PreferencesStep data={data} set={set} toggleArr={toggleArr} />
          )}
          {step === 'photos' && (
            <PhotosStep />
          )}
          {step === 'review' && (
            <ReviewStep data={data} />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex gap-3">
        {stepIdx > 0 && (
          <Button variant="secondary" size="lg" onClick={prev} className="w-28">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        )}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={saving}
          onClick={next}
        >
          {step === 'review' ? (
            <><Check className="h-4 w-4 mr-1" /> Submit Profile</>
          ) : (
            <>Next <ChevronRight className="h-4 w-4 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Step components ──────────────────────────────────────

function BasicStep({
  data, set,
}: {
  data: WizardData;
  set: (k: keyof WizardData, v: WizardData[keyof WizardData]) => void;
}) {
  return (
    <>
      <Input
        label="Full Name *"
        value={data.name}
        onChange={(e) => set('name', e.target.value)}
        placeholder="As per official ID"
      />
      <Input
        label="Date of Birth *"
        type="date"
        value={data.dob}
        onChange={(e) => set('dob', e.target.value)}
      />
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Gender *</p>
        <div className="flex gap-3">
          {(['male', 'female', 'other'] as const).map((g) => (
            <button
              key={g}
              onClick={() => set('gender', g)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium capitalize transition-colors ${
                data.gender === g
                  ? 'border-rose-600 bg-rose-50 text-rose-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {g === 'male' ? '♂ Male' : g === 'female' ? '♀ Female' : '⚧ Other'}
            </button>
          ))}
        </div>
      </div>
      <Select
        label="Community"
        options={COMMUNITY_OPTIONS.map((c) => ({ label: c, value: c }))}
        value={data.community}
        onChange={(e) => set('community', e.target.value)}
        placeholder="Select community"
      />
      <Select
        label="Religion"
        options={RELIGION_OPTIONS.map((r) => ({ label: r, value: r }))}
        value={data.religion}
        onChange={(e) => set('religion', e.target.value)}
        placeholder="Select religion"
      />
      <Select
        label="Mother Tongue"
        options={MOTHER_TONGUE_OPTIONS.map((l) => ({ label: l, value: l }))}
        value={data.mother_tongue}
        onChange={(e) => set('mother_tongue', e.target.value)}
        placeholder="Select language"
      />
      <Textarea
        label="About Me"
        value={data.about_me}
        onChange={(e) => set('about_me', e.target.value)}
        placeholder="Tell potential matches about yourself, your interests, and what you're looking for…"
        rows={4}
      />
    </>
  );
}

function AppearanceStep({
  data, set,
}: {
  data: WizardData;
  set: (k: keyof WizardData, v: WizardData[keyof WizardData]) => void;
}) {
  return (
    <>
      <Select
        label="Height"
        options={HEIGHT_OPTIONS.map((h) => ({ label: h.label, value: h.value }))}
        value={data.height_cm}
        onChange={(e) => set('height_cm', e.target.value)}
        placeholder="Select height"
      />
      <p className="text-xs text-gray-500 -mt-2">
        More appearance details (complexion, body type) can be added later in Settings.
      </p>
    </>
  );
}

function CareerStep({
  data, set,
}: {
  data: WizardData;
  set: (k: keyof WizardData, v: WizardData[keyof WizardData]) => void;
}) {
  return (
    <>
      <Select
        label="Highest Education"
        options={EDUCATION_OPTIONS.map((e) => ({ label: e, value: e }))}
        value={data.education}
        onChange={(e) => set('education', e.target.value)}
        placeholder="Select education"
      />
      <Input
        label="Occupation"
        value={data.occupation}
        onChange={(e) => set('occupation', e.target.value)}
        placeholder="e.g. Software Engineer, Doctor"
      />
      <Select
        label="Annual Income"
        options={INCOME_OPTIONS.map((i) => ({ label: i, value: i }))}
        value={data.income_range}
        onChange={(e) => set('income_range', e.target.value)}
        placeholder="Select income range"
      />
      <Input
        label="Current City"
        value={data.city}
        onChange={(e) => set('city', e.target.value)}
        placeholder="e.g. Pune"
      />
      <Input
        label="State"
        value={data.state}
        onChange={(e) => set('state', e.target.value)}
        placeholder="e.g. Maharashtra"
      />
    </>
  );
}

function FamilyStep({
  data, set,
}: {
  data: WizardData;
  set: (k: keyof WizardData, v: WizardData[keyof WizardData]) => void;
}) {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Family Type</p>
        <div className="grid grid-cols-3 gap-2">
          {(['nuclear', 'joint', 'extended'] as const).map((ft) => (
            <button
              key={ft}
              onClick={() => set('family_type', ft)}
              className={`py-2 rounded-xl border-2 text-xs font-medium capitalize ${
                data.family_type === ft
                  ? 'border-rose-600 bg-rose-50 text-rose-700'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {ft}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Family Values</p>
        <div className="grid grid-cols-3 gap-2">
          {(['traditional', 'moderate', 'liberal'] as const).map((fv) => (
            <button
              key={fv}
              onClick={() => set('family_values', fv)}
              className={`py-2 rounded-xl border-2 text-xs font-medium capitalize ${
                data.family_values === fv
                  ? 'border-rose-600 bg-rose-50 text-rose-700'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {fv}
            </button>
          ))}
        </div>
      </div>
      <Input
        label="Father's Occupation"
        value={data.father_occupation}
        onChange={(e) => set('father_occupation', e.target.value)}
        placeholder="e.g. Retired, Business"
      />
      <Input
        label="Mother's Occupation"
        value={data.mother_occupation}
        onChange={(e) => set('mother_occupation', e.target.value)}
        placeholder="e.g. Homemaker, Teacher"
      />
      <Input
        label="Siblings"
        value={data.siblings}
        onChange={(e) => set('siblings', e.target.value)}
        placeholder="e.g. 1 brother, 2 sisters"
      />
      <Input
        label="Native Place"
        value={data.native_place}
        onChange={(e) => set('native_place', e.target.value)}
        placeholder="e.g. Kolhapur, Nashik"
      />
    </>
  );
}

function PreferencesStep({
  data, set, toggleArr,
}: {
  data: WizardData;
  set: (k: keyof WizardData, v: WizardData[keyof WizardData]) => void;
  toggleArr: (k: 'pref_community' | 'pref_religion', v: string) => void;
}) {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          Preferred Age Range: {data.pref_age_min}–{data.pref_age_max} yrs
        </p>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Min age</label>
            <input
              type="range" min={18} max={60}
              value={data.pref_age_min}
              onChange={(e) => set('pref_age_min', e.target.value)}
              className="w-full accent-rose-600 mt-1"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Max age</label>
            <input
              type="range" min={18} max={60}
              value={data.pref_age_max}
              onChange={(e) => set('pref_age_max', e.target.value)}
              className="w-full accent-rose-600 mt-1"
            />
          </div>
        </div>
      </div>

      <ChipFilter
        label="Preferred Community (multi-select)"
        options={COMMUNITY_OPTIONS}
        selected={data.pref_community}
        onToggle={(v) => toggleArr('pref_community', v)}
      />

      <ChipFilter
        label="Preferred Religion (multi-select)"
        options={RELIGION_OPTIONS}
        selected={data.pref_religion}
        onToggle={(v) => toggleArr('pref_religion', v)}
      />

      <Input
        label="Preferred City"
        value={data.pref_city}
        onChange={(e) => set('pref_city', e.target.value)}
        placeholder="e.g. Pune, Mumbai (or Any)"
      />
    </>
  );
}

function ChipFilter({
  label, options, selected, onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              selected.includes(opt)
                ? 'bg-rose-600 text-white border-rose-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-gray-400 mt-1">Leave empty to accept all communities</p>
      )}
    </div>
  );
}

function PhotosStep() {
  return (
    <div className="text-center py-6">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
        <span className="text-3xl">📸</span>
      </div>
      <h3 className="font-semibold text-gray-900">Add your photos</h3>
      <p className="text-sm text-gray-500 mt-1 mb-5">
        Profiles with photos get 10× more interest. Add at least 2.
      </p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-2xl cursor-pointer hover:bg-gray-50"
          >
            +
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">
        Photo upload requires storage configuration (Supabase bucket). Skip for now and add later from your profile settings.
      </p>
    </div>
  );
}

function ReviewStep({ data }: { data: WizardData }) {
  const sections: [string, [string, string][]][] = [
    ['Basic Info', [
      ['Name', data.name],
      ['Date of Birth', data.dob],
      ['Gender', data.gender],
      ['Community', data.community],
      ['Religion', data.religion],
      ['Mother Tongue', data.mother_tongue],
    ]],
    ['Career', [
      ['Education', data.education],
      ['Occupation', data.occupation],
      ['Income', data.income_range],
      ['City', data.city],
      ['State', data.state],
    ]],
    ['Family', [
      ['Family Type', data.family_type],
      ['Family Values', data.family_values],
      ['Native Place', data.native_place],
      ['Siblings', data.siblings],
    ]],
    ['Partner Preferences', [
      ['Age Range', `${data.pref_age_min}–${data.pref_age_max} yrs`],
      ['Community', data.pref_community.join(', ') || 'Any'],
      ['Religion', data.pref_religion.join(', ') || 'Any'],
      ['City', data.pref_city || 'Any'],
    ]],
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Review your profile before submitting. Your profile will be reviewed by our team before going live.
      </p>
      {sections.map(([title, rows]) => (
        <div key={title}>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
          <div className="space-y-1.5">
            {rows.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium text-gray-800 capitalize text-right max-w-[60%]">{v}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {data.about_me && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About Me</h3>
          <p className="text-sm text-gray-700">{data.about_me}</p>
        </div>
      )}
    </div>
  );
}
