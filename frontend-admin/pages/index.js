import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (session) {
      // User is authenticated, redirect to admin dashboard
      router.replace('/admin');
    } else {
      // User is not authenticated, redirect to login
      router.replace('/auth/login');
    }
  }, [session, status, router]);

  // Show loading while redirecting
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div>
        <h2>Tamil Language Society - Admin</h2>
        <p>Loading...</p>
      </div>
    </div>
  );
}