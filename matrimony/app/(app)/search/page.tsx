'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/lib/store';
import { MOCK_PROFILES } from '@/lib/mock-data';
import { calcAge } from '@/lib/utils';
import {
  COMMUNITY_OPTIONS,
  RELIGION_OPTIONS,
  EDUCATION_OPTIONS,
  INCOME_OPTIONS,
  type Gender,
} from '@/lib/types';

interface Filters {
  q: string;
  gender: Gender | '';
  ageMin: number;
  ageMax: number;
  community: string[];
  religion: string[];
  education: string[];
  city: string;
}

const DEFAULT_FILTERS: Filters = {
  q: '',
  gender: '',
  ageMin: 21,
  ageMax: 45,
  community: [],
  religion: [],
  education: [],
  city: '',
};

export default function SearchPage() {
  const sentInterestIds = useStore((s) => s.sentInterestIds);
  const mutualIds = useStore((s) => s.mutualIds);
  const sendInterest = useStore((s) => s.sendInterest);
  const myProfile = useStore((s) => s.myProfile);

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    return MOCK_PROFILES.filter((p) => {
      if (p.id === myProfile?.id) return false;
      if (p.profile_status !== 'active') return false;

      const age = calcAge(p.dob);
      if (age < filters.ageMin || age > filters.ageMax) return false;
      if (filters.gender && p.gender !== filters.gender) return false;
      if (filters.community.length && !filters.community.includes(p.community ?? '')) return false;
      if (filters.religion.length && !filters.religion.includes(p.religion ?? '')) return false;
      if (filters.education.length && !filters.education.includes(p.education ?? '')) return false;
      if (filters.city && !p.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters.q) {
        const q = filters.q.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.occupation?.toLowerCase().includes(q) &&
          !p.city?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [filters, myProfile?.id]);

  function toggleArr<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

  const activeFilterCount = [
    filters.gender,
    ...filters.community,
    ...filters.religion,
    ...filters.education,
    filters.city,
  ].filter(Boolean).length;

  return (
    <div>
      {/* Sticky search header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pt-10 pb-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              placeholder="Name, city, occupation…"
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Result count */}
        <p className="text-xs text-gray-500">
          {results.length} profile{results.length !== 1 ? 's' : ''} found
          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="ml-2 text-rose-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </p>
      </div>

      {/* Filter drawer */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-4 py-4 space-y-4">
          {/* Gender */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Looking for</p>
            <div className="flex gap-2">
              {(['male', 'female', ''] as const).map((g) => (
                <button
                  key={g || 'all'}
                  onClick={() => setFilters((f) => ({ ...f, gender: g }))}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    filters.gender === g
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {g === 'male' ? '♂ Groom' : g === 'female' ? '♀ Bride' : 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Age range */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Age Range: {filters.ageMin}–{filters.ageMax} yrs
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500">Min</label>
                <input
                  type="range"
                  min={18} max={60}
                  value={filters.ageMin}
                  onChange={(e) => setFilters((f) => ({ ...f, ageMin: +e.target.value }))}
                  className="w-full accent-rose-600"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">Max</label>
                <input
                  type="range"
                  min={18} max={60}
                  value={filters.ageMax}
                  onChange={(e) => setFilters((f) => ({ ...f, ageMax: +e.target.value }))}
                  className="w-full accent-rose-600"
                />
              </div>
            </div>
          </div>

          {/* City */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">City</p>
            <input
              value={filters.city}
              onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
              placeholder="e.g. Pune, Mumbai"
              className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm placeholder-gray-400 focus:border-rose-500 focus:outline-none"
            />
          </div>

          {/* Community */}
          <FilterChips
            label="Community"
            options={COMMUNITY_OPTIONS}
            selected={filters.community}
            onToggle={(v) => setFilters((f) => ({ ...f, community: toggleArr(f.community, v) }))}
          />

          {/* Religion */}
          <FilterChips
            label="Religion"
            options={RELIGION_OPTIONS}
            selected={filters.religion}
            onToggle={(v) => setFilters((f) => ({ ...f, religion: toggleArr(f.religion, v) }))}
          />

          {/* Education */}
          <FilterChips
            label="Education"
            options={EDUCATION_OPTIONS}
            selected={filters.education}
            onToggle={(v) => setFilters((f) => ({ ...f, education: toggleArr(f.education, v) }))}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(false)}
            fullWidth
          >
            <X className="h-4 w-4 mr-1" /> Close Filters
          </Button>
        </div>
      )}

      {/* Results grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {results.map((p) => (
          <ProfileCard
            key={p.id}
            profile={p}
            sent={sentInterestIds.has(p.id)}
            mutual={mutualIds.has(p.id)}
            onInterest={sentInterestIds.has(p.id) ? undefined : sendInterest}
          />
        ))}
        {results.length === 0 && (
          <div className="col-span-2 py-16 text-center text-gray-400">
            <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No profiles match your filters.</p>
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="mt-2 text-sm text-rose-600 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChips({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
              selected.includes(opt)
                ? 'bg-rose-600 text-white border-rose-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
