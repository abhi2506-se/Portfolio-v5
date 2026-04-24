'use client';

import { useState, useEffect } from 'react';

export default function VisitorCounter() {
  const [visitors, setVisitors] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setLoading(true);
        // Using a more reliable API
        const response = await fetch('https://api.countapi.xyz/hit/portfolio-website/visitors');
        
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        
        const data = await response.json();
        
        // Check if data has the expected structure
        if (data && data.value !== undefined) {
          setVisitors(data.value);
        } else {
          throw new Error('Invalid API response');
        }
      } catch (err) {
        console.error('Visitor counter error:', err);
        setError('Unable to load visitor count');
      } finally {
        setLoading(false);
      }
    };

    fetchVisitors();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span className="animate-pulse">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span className="text-red-500">●</span>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span>{visitors?.toLocaleString() ?? '0'} visitors</span>
    </div>
  );
}