'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessage = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use relative path for API calls within the same application
      const response = await fetch('/api/hello');
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
  }, []); // Fetch message on initial component mount

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">API Fetch Example</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Fetching data from a simple Next.js API endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 border rounded-lg bg-muted/50 min-h-[80px] flex items-center justify-center">
            {loading && <Skeleton className="h-6 w-3/4" />}
            {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
            {message && !loading && !error && (
              <p className="text-lg font-semibold text-foreground text-center">{message}</p>
            )}
          </div>
          <Button
            onClick={fetchMessage}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Fetching...' : 'Fetch Message Again'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
