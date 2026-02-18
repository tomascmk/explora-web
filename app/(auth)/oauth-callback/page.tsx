'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/graphql';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  const fetchUserAndLogin = async (token: string) => {
    try {
      // Fetch user data from backend
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: `
            query Me {
              me {
                id
                username
                email
                roles
                fullName
              }
            }
          `
        })
      });

      const { data, errors } = await response.json();

      if (errors) {
        console.error('Error fetching user:', errors);
        router.push('/login?error=oauth_failed');
        return;
      }

      if (data?.me) {
        // Store user and update AuthContext
        localStorage.setItem('user', JSON.stringify(data.me));
        setUser(data.me);
        router.push('/dashboard');
      } else {
        router.push('/login?error=oauth_failed');
      }
    } catch (error) {
      console.error('Error in OAuth callback:', error);
      router.push('/login?error=oauth_failed');
    }
  };

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const error = searchParams.get('error');

    if (error) {
      router.push('/login?error=oauth_failed');
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens with consistent naming (same as login/register)
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Fetch user data and update AuthContext
      fetchUserAndLogin(accessToken);
    } else {
      router.push('/login');
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Procesando autenticación...</h2>
        <p className="mt-2 text-gray-600">Por favor espera un momento.</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Cargando...</h2>
        </div>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}
