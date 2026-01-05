'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [steamId, setSteamId] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!steamId.trim()) {
      setError('Please enter a Steam ID or username');
      return;
    }

    // Navigate to results page with the identifier (can be Steam ID64, vanity name, or URL)
    router.push(`/analysis/${encodeURIComponent(steamId.trim())}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-gradient-to-b from-steam-darkgray to-steam-blue">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
          Discover Your Gaming DNA
        </h1>
        <p className="text-lg md:text-xl mb-8 text-steam-gray">
          Enter your Steam ID, username, or profile URL to analyze your gaming profile
        </p>

        <form onSubmit={handleSubmit} className="mb-8 max-w-2xl mx-auto">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              placeholder="Steam ID, username, or profile URL (e.g., gaben, 76561197960287930)"
              className="px-6 py-4 text-lg rounded-lg bg-steam-lightblue text-white placeholder-steam-gray border-2 border-transparent focus:border-blue-500 focus:outline-none"
            />
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!steamId}
            >
              Analyze My Profile
            </button>
          </div>
        </form>

        <div className="text-sm text-steam-gray mb-8">
          <p className="mb-2">You can use any of the following:</p>
          <ul className="list-disc list-inside text-left max-w-md mx-auto">
            <li>Steam ID64 (17 digits starting with 7656119)</li>
            <li>Custom URL / Username (e.g., "gaben")</li>
            <li>Full profile URL (e.g., steamcommunity.com/id/gaben)</li>
          </ul>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-steam-lightblue rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-white">🎮 Data Collection</h3>
            <p className="text-steam-gray">
              Enter your Steam ID or username and we'll fetch your gaming library data
            </p>
          </div>
          <div className="p-6 bg-steam-lightblue rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-white">📊 Analysis</h3>
            <p className="text-steam-gray">
              Get insights into your gaming preferences and playing patterns
            </p>
          </div>
          <div className="p-6 bg-steam-lightblue rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-white">🎯 Your DNA</h3>
            <p className="text-steam-gray">
              Discover your unique gaming personality and detailed statistics
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
