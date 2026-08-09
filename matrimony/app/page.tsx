import { redirect } from 'next/navigation';

// Root redirect — in production this checks auth and sends to /dashboard or /login
export default function RootPage() {
  redirect('/login');
}
