'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const error = searchParams.get('error');

    if (error) {
      router.push('/login?error=oauth_failed');
      return;
    }

    if (accessToken && refreshToken) {
      // Exchange URL tokens for httpOnly cookies via BFF
      fetch('/api/auth/oauth-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, refreshToken }),
      })
        .then(async (response) => {
          if (!response.ok) {
            router.push('/login?error=oauth_failed');
            return;
          }
          const data = await response.json();
          setUser(data.user);
          router.push('/dashboard');
        })
        .catch(() => {
          router.push('/login?error=oauth_failed');
        });
    } else {
      router.push('/login');
    }
  }, [searchParams, router, setUser]);

  return (
    <div
      className='flex min-h-screen items-center justify-center'
      style={{ background: 'linear-gradient(to bottom right, #0F172A, #134E4A, #0F172A)' }}
    >
      <div className='text-center'>
        <div
          className='w-12 h-12 border-3 rounded-full animate-spin mx-auto mb-6'
          style={{
            borderColor: 'var(--color-card-border)',
            borderTopColor: 'var(--color-primary)',
          }}
        />
        <h2 className='text-2xl font-semibold text-white'>Processing authentication...</h2>
        <p className='mt-2 text-slate-400'>Please wait a moment.</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div
        className='flex min-h-screen items-center justify-center'
        style={{ background: 'linear-gradient(to bottom right, #0F172A, #134E4A, #0F172A)' }}
      >
        <div className='text-center'>
          <div
            className='w-12 h-12 border-3 rounded-full animate-spin mx-auto mb-6'
            style={{
              borderColor: 'var(--color-card-border)',
              borderTopColor: 'var(--color-primary)',
            }}
          />
          <h2 className='text-2xl font-semibold text-white'>Loading...</h2>
        </div>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}
