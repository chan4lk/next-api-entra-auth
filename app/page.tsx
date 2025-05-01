'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Helper hook for fetching API messages
function useApiMessage(endpoint: string) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessage = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessage(data.message);
    } catch (e: any) {
      setError(`Failed to fetch message: ${e.message}`);
      setMessage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  return { message, loading, error, fetchMessage };
}

async function getAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/.auth/me');
    if (!response.ok) throw new Error('Failed to fetch auth info');
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0 && data[0].access_token) {
      return data[0].access_token;
    }
    // Some providers nest tokens deeper
    if (data?.access_token) return data.access_token;
    if (data?.[0]?.access_token) return data[0].access_token;
    return null;
  } catch {
    return null;
  }
}

export default function Home() {
  const helloApi = useApiMessage('/api/hello');
  // World API states
  const [worldMessage, setWorldMessage] = useState<string | null>(null);
  const [worldLoading, setWorldLoading] = useState<boolean>(false);
  const [worldError, setWorldError] = useState<string | null>(null);
  const [worldMessageAuth, setWorldMessageAuth] = useState<string | null>(null);
  const [worldLoadingAuth, setWorldLoadingAuth] = useState<boolean>(false);
  const [worldErrorAuth, setWorldErrorAuth] = useState<string | null>(null);

  // Fetch /api/world WITHOUT Authorization header
  const fetchWorld = async () => {
    setWorldLoading(true);
    setWorldError(null);
    setWorldMessage(null);
    try {
      const response = await fetch('/api/world');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setWorldMessage(data.message);
    } catch (e: any) {
      setWorldError(`Failed to fetch world: ${e.message}`);
    } finally {
      setWorldLoading(false);
    }
  };

  // Fetch /.auth/me, then /api/world WITH Authorization header
  const fetchWorldWithAuth = async () => {
    setWorldLoadingAuth(true);
    setWorldErrorAuth(null);
    setWorldMessageAuth(null);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error('No access token found');
      const response = await fetch('/api/world', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setWorldMessageAuth(data.message);
    } catch (e: any) {
      setWorldErrorAuth(`Failed to fetch world with auth: ${e.message}`);
    } finally {
      setWorldLoadingAuth(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 space-y-8">
      {/* Hello API Card */}
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">API Fetch Example</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Fetching data from a simple Next.js API endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 border rounded-lg bg-muted/50 min-h-[80px] flex items-center justify-center">
            {helloApi.loading && <Skeleton className="h-6 w-3/4" />}
            {helloApi.error && <p className="text-sm font-medium text-destructive text-center">{helloApi.error}</p>}
            {helloApi.message && !helloApi.loading && !helloApi.error && (
              <p className="text-lg font-semibold text-foreground text-center">{helloApi.message}</p>
            )}
          </div>
          <Button
            onClick={helloApi.fetchMessage}
            disabled={helloApi.loading}
            className="w-full"
          >
            {helloApi.loading ? 'Fetching...' : 'Fetch Message Again'}
          </Button>
        </CardContent>
      </Card>

      {/* World API Card */}
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">World API Fetch Example</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Fetching data from the /api/world endpoint, with and without Authorization header.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 border rounded-lg bg-muted/50 min-h-[80px] flex flex-col items-center justify-center gap-2">
            {/* No Auth Result */}
            {worldLoading && <Skeleton className="h-6 w-3/4" />}
            {worldError && <p className="text-sm font-medium text-destructive text-center">{worldError}</p>}
            {worldMessage && !worldLoading && !worldError && (
              <p className="text-lg font-semibold text-foreground text-center">{worldMessage}</p>
            )}
            {/* With Auth Result */}
            {worldLoadingAuth && <Skeleton className="h-6 w-3/4" />}
            {worldErrorAuth && <p className="text-sm font-medium text-destructive text-center">{worldErrorAuth}</p>}
            {worldMessageAuth && !worldLoadingAuth && !worldErrorAuth && (
              <p className="text-lg font-semibold text-foreground text-center">{worldMessageAuth}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchWorld}
              disabled={worldLoading}
              className="w-1/2"
            >
              {worldLoading ? 'Fetching...' : 'Fetch World (No Auth)'}
            </Button>
            <Button
              onClick={fetchWorldWithAuth}
              disabled={worldLoadingAuth}
              className="w-1/2"
            >
              {worldLoadingAuth ? 'Fetching...' : 'Fetch World (With Auth)'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
