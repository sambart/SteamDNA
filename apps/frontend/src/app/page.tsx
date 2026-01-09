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

  const quickExamples = [
    { label: 'Gabe Newell', value: 'gaben' },
    { label: 'Sample User', value: 'sambart' },
    { label: 'Try Your ID', value: '' }
  ];

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-8 overflow-hidden bg-gradient-to-br from-steam-darkgray via-steam-blue to-blue-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="z-10 max-w-6xl w-full items-center justify-center text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-6 animate-fadeIn">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 p-6 rounded-2xl shadow-2xl">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white leading-tight">
            당신의 <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">게이밍 DNA</span>를<br />발견하세요
          </h1>
          <p className="text-xl md:text-2xl text-steam-gray max-w-3xl mx-auto leading-relaxed">
            AI 기반 분석으로 당신만의 게이밍 성향을 발견하고<br />
            <span className="text-blue-400 font-semibold">27가지 특성</span>으로 구성된 게이밍 프로필을 확인하세요
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-steam-lightblue/80 backdrop-blur-sm rounded-2xl p-2 border border-blue-500/20 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-steam-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={steamId}
                    onChange={(e) => setSteamId(e.target.value)}
                    placeholder="Steam ID, 사용자명 입력... (예: gaben)"
                    className="w-full pl-12 pr-4 py-4 text-lg rounded-xl bg-steam-blue/50 text-white placeholder-steam-gray border-2 border-transparent focus:border-blue-400 focus:outline-none focus:bg-steam-blue transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="relative group/btn bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  disabled={!steamId}
                >
                  <span>분석하기</span>
                  <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Quick Examples */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="text-steam-gray text-sm self-center">빠른 시작:</span>
            {quickExamples.map((example, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => example.value && setSteamId(example.value)}
                className="px-4 py-2 text-sm bg-steam-blue/50 hover:bg-steam-blue text-steam-gray hover:text-white rounded-full border border-blue-500/30 hover:border-blue-400 transition-all duration-200 hover:scale-105"
              >
                {example.label}
              </button>
            ))}
          </div>
        </form>

        {/* Info Box */}
        <div className="max-w-2xl mx-auto bg-steam-lightblue/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
          <p className="text-steam-gray text-sm mb-3 font-semibold">💡 지원되는 형식:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="text-white font-medium">Steam ID64</div>
                <div className="text-steam-gray text-xs">17자리 숫자</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="text-white font-medium">사용자명</div>
                <div className="text-steam-gray text-xs">예: gaben</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="text-white font-medium">프로필 URL</div>
                <div className="text-steam-gray text-xs">전체 주소</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="group relative bg-gradient-to-br from-steam-lightblue/80 to-steam-blue/50 backdrop-blur-sm p-8 rounded-2xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">데이터 수집</h3>
              <p className="text-steam-gray leading-relaxed">
                Steam API를 통해 게임 라이브러리, 플레이 타임, 업적 등의 데이터를 실시간으로 가져옵니다
              </p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-steam-lightblue/80 to-steam-blue/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">AI 분석</h3>
              <p className="text-steam-gray leading-relaxed">
                27차원 특성 벡터를 추출하여 머신러닝 기반으로 게이밍 성향을 분석합니다
              </p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-steam-lightblue/80 to-steam-blue/50 backdrop-blur-sm p-8 rounded-2xl border border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">게이밍 DNA</h3>
              <p className="text-steam-gray leading-relaxed">
                5가지 페르소나 분류와 심층 인사이트로 당신만의 고유한 게이밍 프로필을 확인하세요
              </p>
            </div>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="mt-16 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">27</div>
              <div className="text-steam-gray">분석 특성</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">5</div>
              <div className="text-steam-gray">게이밍 페르소나</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">∞</div>
              <div className="text-steam-gray">인사이트</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}