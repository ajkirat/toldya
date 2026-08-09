'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useStore } from '@/lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);

    // Demo: simulate registration. Replace with supabase.auth.signUp
    await new Promise((r) => setTimeout(r, 700));
    setAuth('new-user-id', null);
    router.push('/profile/create');
  }

  return (
    <Card className="p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Create your account</h2>
      <p className="text-sm text-gray-500 mb-6">Free to join. Your perfect match awaits.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { icon: User, type: 'text', key: 'name' as const, placeholder: 'Full name' },
          { icon: Mail, type: 'email', key: 'email' as const, placeholder: 'Email address' },
          { icon: Phone, type: 'tel', key: 'phone' as const, placeholder: 'Phone number (optional)' },
          { icon: Lock, type: 'password', key: 'password' as const, placeholder: 'Password (min 8 chars)' },
        ].map(({ icon: Icon, type, key, placeholder }) => (
          <div key={key} className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type={type}
              placeholder={placeholder}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
              {...field(key)}
            />
          </div>
        ))}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <p className="text-xs text-gray-500">
          By registering you agree to our{' '}
          <Link href="#" className="text-rose-600 hover:underline">Terms of Service</Link>{' '}
          and{' '}
          <Link href="#" className="text-rose-600 hover:underline">Privacy Policy</Link>.
        </p>

        <Button type="submit" fullWidth loading={loading} size="lg">
          Create Account & Build Profile →
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-500">
        Already registered?{' '}
        <Link href="/login" className="font-medium text-rose-600 hover:underline">
          Sign in
        </Link>
      </div>
    </Card>
  );
}
