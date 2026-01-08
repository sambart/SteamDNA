'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';

interface Summary {
  steamId: string;
  displayName: string;
  avatar: string;
  summary: string;
  gamingPersona: string;
  totalGames: number;
  totalPlaytime: number;
  avgPlaytimePerGame: number;
  topGames: Array<{ name: string; playtime: number }>;
  recentActivity: number;
  mlInsights?: {
    confidence: number;
    traits: string[];
    insights: string[];
    topGenres: string[];
    featureDetails?: {
      playtime_features: any;
      genre_features: any;
      diversity_features: any;
      achievement_features: any;
      temporal_features: any;
    };
  };
}

interface Dashboard {
  charts: {
    playtimeDistribution: Array<{ name: string; value: number }>;
    topGames: Array<{ name: string; playtime: number }>;
  };
  stats: {
    totalGames: number;
    totalPlaytime: number;
    gamesNeverPlayed: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const steamId = params.steamId as string;

  const [summary, setSummary] = useState<Summary | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);

  const loadingSteps = [
    'Steam 프로필 데이터를 가져오는 중...',
    '게임 라이브러리를 분석하는 중...',
    '플레이 패턴을 추출하는 중...',
    '게이밍 페르소나를 판단하는 중...',
    '분석 완료!'
  ];

  useEffect(() => {
    fetchAnalysis();
  }, [steamId]);

  useEffect(() => {
    if (loading && loadingStep < loadingSteps.length - 1) {
      const timer = setTimeout(() => {
        setLoadingStep(prev => Math.min(prev + 1, loadingSteps.length - 2));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [loading, loadingStep]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setLoadingStep(0);
      setError('');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

      setLoadingStep(1);
      const summaryRes = await fetch(`${apiUrl}/analysis/summary/${steamId}`);

      if (!summaryRes.ok) {
        const errorData = await summaryRes.json();
        throw new Error(errorData.message || '분석을 가져오는데 실패했습니다');
      }

      setLoadingStep(4);
      const summaryData = await summaryRes.json();
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.message || '분석을 불러오는데 실패했습니다. Steam ID가 유효한지, 프로필이 공개되어 있는지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const dashboardRes = await fetch(`${apiUrl}/analysis/dashboard/${steamId}`);

      if (!dashboardRes.ok) {
        throw new Error('대시보드를 가져오는데 실패했습니다');
      }

      const dashboardData = await dashboardRes.json();
      setDashboard(dashboardData);
      setShowDashboard(true);
    } catch (err: any) {
      setError(err.message || '대시보드를 불러오는데 실패했습니다');
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-steam-darkgray to-steam-blue">
        <div className="max-w-md w-full">
          {/* Title */}
          <h2 className="text-white text-3xl font-bold mb-8 text-center">
            게이밍 DNA 분석 중
          </h2>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-steam-lightblue rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Loading Steps */}
          <div className="space-y-3 mb-8">
            {loadingSteps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  index <= loadingStep ? 'opacity-100' : 'opacity-40'
                }`}
              >
                {index < loadingStep ? (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : index === loadingStep ? (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                ) : (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-steam-gray" />
                )}
                <span className={`text-lg ${index <= loadingStep ? 'text-white font-medium' : 'text-steam-gray'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          {/* Loading Animation */}
          <div className="flex justify-center">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-steam-darkgray to-steam-blue">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">오류</h1>
          <p className="text-red-400 mb-8">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            다른 ID로 시도하기
          </button>
        </div>
      </main>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-steam-darkgray to-steam-blue p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="mb-4 text-blue-400 hover:text-blue-300 underline"
          >
            ← 홈으로 돌아가기
          </button>
          <h1 className="text-5xl font-bold text-white mb-4">당신의 게이밍 DNA</h1>
        </div>

        {/* Profile Summary */}
        <div className="bg-steam-lightblue rounded-lg p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <img src={summary.avatar} alt={summary.displayName} className="w-24 h-24 rounded-full" />
            <div>
              <h2 className="text-3xl font-bold text-white">{summary.displayName}</h2>
              <p className="text-xl text-blue-400 mt-2">{summary.gamingPersona}</p>
            </div>
          </div>
          <p className="text-lg text-steam-gray mb-6">{summary.summary}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-steam-blue p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-white">{summary.totalGames}</div>
              <div className="text-sm text-steam-gray">보유 게임 수</div>
            </div>
            <div className="bg-steam-blue p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-white">{summary.totalPlaytime.toLocaleString()}</div>
              <div className="text-sm text-steam-gray">플레이 시간 (시간)</div>
            </div>
            <div className="bg-steam-blue p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-white">{summary.avgPlaytimePerGame}</div>
              <div className="text-sm text-steam-gray">게임당 평균 시간</div>
            </div>
            <div className="bg-steam-blue p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-white">{summary.recentActivity}</div>
              <div className="text-sm text-steam-gray">최근 플레이 게임</div>
            </div>
          </div>
        </div>

        {/* ML Insights - Traits and Insights */}
        {summary.mlInsights && (
          <div className="bg-steam-lightblue rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">게이밍 성향 분석</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-steam-gray">신뢰도</span>
                <div className="bg-steam-blue px-3 py-1 rounded-full">
                  <span className="text-white font-bold">{Math.round(summary.mlInsights.confidence * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Traits */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">주요 특성</h4>
              <div className="flex flex-wrap gap-2">
                {summary.mlInsights.traits.map((trait, index) => (
                  <span
                    key={index}
                    className="bg-blue-600/30 text-blue-300 px-4 py-2 rounded-full border border-blue-500/50"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Insights */}
            {summary.mlInsights.insights.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">상세 인사이트</h4>
                <div className="space-y-2">
                  {summary.mlInsights.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 text-steam-gray">
                      <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Genres */}
            {summary.mlInsights.topGenres.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">선호 장르</h4>
                <div className="flex flex-wrap gap-2">
                  {summary.mlInsights.topGenres.slice(0, 5).map((genre, index) => (
                    <span
                      key={index}
                      className="bg-steam-blue text-white px-4 py-2 rounded-lg font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advanced Analytics Charts */}
        {summary.mlInsights?.featureDetails && (
          <>
            {/* Gaming Pattern Radar Chart */}
            <div className="bg-steam-lightblue rounded-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">게이밍 패턴 분석</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Genre Preference Radar */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 text-center">장르 선호도</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={[
                      { subject: '스토리/RPG', value: (summary.mlInsights.featureDetails.genre_features.story_rpg_ratio || 0) * 100 },
                      { subject: '전략/시뮬', value: (summary.mlInsights.featureDetails.genre_features.strategy_simulation_ratio || 0) * 100 },
                      { subject: '경쟁/PvP', value: (summary.mlInsights.featureDetails.genre_features.competitive_pvp_ratio || 0) * 100 },
                      { subject: '멀티/협동', value: (summary.mlInsights.featureDetails.genre_features.multiplayer_coop_ratio || 0) * 100 },
                      { subject: '캐주얼/인디', value: (summary.mlInsights.featureDetails.temporal_features.casual_indie_ratio || 0) * 100 },
                      { subject: '싱글플레이', value: (summary.mlInsights.featureDetails.temporal_features.single_player_ratio || 0) * 100 },
                    ]}>
                      <PolarGrid stroke="#4a5568" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#c7d5e0', fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#c7d5e0' }} />
                      <Radar name="선호도 (%)" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Playtime Pattern Stats */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">플레이 패턴</h4>
                  <div className="space-y-4">
                    <div className="bg-steam-blue p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-steam-gray text-sm">평균 세션 길이</span>
                        <span className="text-white font-bold">{(summary.mlInsights.featureDetails.playtime_features.avg_session_length || 0).toFixed(1)}시간</span>
                      </div>
                      <div className="w-full bg-steam-darkgray rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min((summary.mlInsights.featureDetails.playtime_features.avg_session_length || 0) / 10 * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-steam-blue p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-steam-gray text-sm">100시간 이상 게임</span>
                        <span className="text-white font-bold">{Math.round(summary.mlInsights.featureDetails.playtime_features.deep_dive_game_count || 0)}개</span>
                      </div>
                      <div className="w-full bg-steam-darkgray rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                          style={{ width: `${Math.min((summary.mlInsights.featureDetails.playtime_features.deep_dive_game_count || 0) / 20 * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-steam-blue p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-steam-gray text-sm">상위 게임 집중도</span>
                        <span className="text-white font-bold">{((summary.mlInsights.featureDetails.playtime_features.top_game_concentration || 0) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-steam-darkgray rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${(summary.mlInsights.featureDetails.playtime_features.top_game_concentration || 0) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-steam-blue p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-steam-gray text-sm">반복 플레이 강도</span>
                        <span className="text-white font-bold">{((summary.mlInsights.featureDetails.playtime_features.repeat_play_intensity || 0) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-steam-darkgray rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                          style={{ width: `${(summary.mlInsights.featureDetails.playtime_features.repeat_play_intensity || 0) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Diversity & Achievement Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Game Diversity */}
              <div className="bg-steam-lightblue rounded-lg p-8">
                <h3 className="text-2xl font-bold text-white mb-6">게임 다양성</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-steam-blue rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-600/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-steam-gray text-sm">장르 다양성</div>
                        <div className="text-white text-xl font-bold">{(summary.mlInsights.featureDetails.genre_features.genre_diversity || 0).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-steam-blue rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-600/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-steam-gray text-sm">고유 장르 수</div>
                        <div className="text-white text-xl font-bold">{Math.round(summary.mlInsights.featureDetails.genre_features.unique_genres || 0)}개</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-steam-blue rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-600/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-steam-gray text-sm">신작 구매율</div>
                        <div className="text-white text-xl font-bold">{((summary.mlInsights.featureDetails.diversity_features.new_release_purchase_rate || 0) * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievement Stats */}
              <div className="bg-steam-lightblue rounded-lg p-8">
                <h3 className="text-2xl font-bold text-white mb-6">업적 달성</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-steam-blue rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-yellow-600/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-steam-gray text-sm">평균 업적 달성률</div>
                        <div className="text-white text-xl font-bold">{(summary.mlInsights.featureDetails.achievement_features.avg_achievement_rate || 0).toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-steam-blue rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-orange-600/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-steam-gray text-sm">해금한 업적 수</div>
                        <div className="text-white text-xl font-bold">{Math.round(summary.mlInsights.featureDetails.achievement_features.total_achievements_unlocked || 0).toLocaleString()}개</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-steam-blue rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-red-600/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-steam-gray text-sm">업적 사냥꾼 점수</div>
                        <div className="text-white text-xl font-bold">{(summary.mlInsights.featureDetails.achievement_features.achievement_hunter_score || 0).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Top Games */}
        <div className="bg-steam-lightblue rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">가장 많이 플레이한 게임 Top 5</h3>
          <div className="space-y-3">
            {summary.topGames.map((game, index) => {
              const maxPlaytime = summary.topGames[0].playtime;
              const percentage = (game.playtime / maxPlaytime) * 100;
              return (
                <div key={index} className="bg-steam-blue p-4 rounded-lg transition-all hover:bg-steam-blue/80 hover:scale-[1.02] duration-200">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-white font-semibold">{game.name}</span>
                    </div>
                    <span className="text-blue-400 font-bold">{Math.round(game.playtime / 60).toLocaleString()} 시간</span>
                  </div>
                  <div className="w-full bg-steam-darkgray rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dashboard Toggle */}
        {!showDashboard ? (
          <div className="text-center">
            <button
              onClick={fetchDashboard}
              className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              상세 대시보드 보기
            </button>
          </div>
        ) : dashboard && (
          <div className="space-y-8 animate-fadeIn">
            {/* Dashboard Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">상세 대시보드</h2>
              <p className="text-steam-gray">게임 라이브러리 심층 분석</p>
            </div>

            {/* Playtime Distribution Chart */}
            <div className="bg-steam-lightblue rounded-lg p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                플레이타임 분포
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={dashboard.charts.playtimeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value, percent }) => `${name}: ${value}개 (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {dashboard.charts.playtimeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1b2838', border: '1px solid #2a475e', borderRadius: '8px' }}
                    labelStyle={{ color: '#c7d5e0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top 10 Games Chart */}
            <div className="bg-steam-lightblue rounded-lg p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                플레이타임 기준 Top 10 게임
              </h3>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={dashboard.charts.topGames} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a475e" />
                  <XAxis type="number" stroke="#c7d5e0" />
                  <YAxis dataKey="name" type="category" width={180} stroke="#c7d5e0" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1b2838', border: '1px solid #2a475e', borderRadius: '8px' }}
                    labelStyle={{ color: '#c7d5e0' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="playtime"
                    fill="url(#colorGradient)"
                    name="플레이 시간 (시간)"
                    animationBegin={0}
                    animationDuration={800}
                    radius={[0, 8, 8, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Additional Stats */}
            <div className="bg-steam-lightblue rounded-lg p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                종합 통계
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-6 rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 hover:scale-105">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-600/30 flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-white mb-1">{dashboard.stats.totalGames}</div>
                      <div className="text-steam-gray text-sm">보유 게임 총 개수</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 p-6 rounded-lg border border-green-500/30 hover:border-green-400/50 transition-all duration-200 hover:scale-105">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-600/30 flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-white mb-1">{dashboard.stats.totalPlaytime.toLocaleString()}</div>
                      <div className="text-steam-gray text-sm">총 플레이 시간 (시간)</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 p-6 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all duration-200 hover:scale-105">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-purple-600/30 flex items-center justify-center">
                      <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-white mb-1">{dashboard.stats.gamesNeverPlayed}</div>
                      <div className="text-steam-gray text-sm">한번도 플레이하지 않은 게임</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
