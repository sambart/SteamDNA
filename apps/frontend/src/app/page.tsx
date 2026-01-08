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
      setError('Steam ID 또는 사용자 이름을 입력해주세요');
      return;
    }

    // Navigate to results page with the identifier (can be Steam ID64, vanity name, or URL)
    router.push(`/analysis/${encodeURIComponent(steamId.trim())}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-gradient-to-b from-steam-darkgray to-steam-blue">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
          당신의 게이밍 DNA를 발견하세요
        </h1>
        <p className="text-lg md:text-xl mb-8 text-steam-gray">
          Steam ID, 사용자명 또는 프로필 URL을 입력하여 게이밍 프로필을 분석하세요
        </p>

        <form onSubmit={handleSubmit} className="mb-8 max-w-2xl mx-auto">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              placeholder="Steam ID, 사용자명, 또는 프로필 URL (예: gaben, 76561197960287930)"
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
              프로필 분석하기
            </button>
          </div>
        </form>

        <div className="text-sm text-steam-gray mb-8">
          <p className="mb-2">다음 중 하나를 사용할 수 있습니다:</p>
          <ul className="list-disc list-inside text-left max-w-md mx-auto">
            <li>Steam ID64 (7656119로 시작하는 17자리 숫자)</li>
            <li>사용자 지정 URL / 사용자명 (예: "gaben")</li>
            <li>전체 프로필 URL (예: steamcommunity.com/id/gaben)</li>
          </ul>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-steam-lightblue rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-white">🎮 데이터 수집</h3>
            <p className="text-steam-gray">
              Steam ID 또는 사용자명을 입력하면 게임 라이브러리 데이터를 가져옵니다
            </p>
          </div>
          <div className="p-6 bg-steam-lightblue rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-white">📊 분석</h3>
            <p className="text-steam-gray">
              게임 선호도와 플레이 패턴에 대한 인사이트를 제공합니다
            </p>
          </div>
          <div className="p-6 bg-steam-lightblue rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-white">🎯 당신의 DNA</h3>
            <p className="text-steam-gray">
              고유한 게이밍 성향과 상세한 통계를 확인하세요
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
