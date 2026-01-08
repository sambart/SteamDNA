'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  const [error, setError] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [steamId]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError('');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const summaryRes = await fetch(`${apiUrl}/analysis/summary/${steamId}`);

      if (!summaryRes.ok) {
        const errorData = await summaryRes.json();
        throw new Error(errorData.message || '분석을 가져오는데 실패했습니다');
      }

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
        <div className="text-white text-2xl">게이밍 DNA를 분석하고 있습니다...</div>
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

        {/* Top Games */}
        <div className="bg-steam-lightblue rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-white mb-4">가장 많이 플레이한 게임 Top 5</h3>
          <div className="space-y-3">
            {summary.topGames.map((game, index) => (
              <div key={index} className="bg-steam-blue p-4 rounded-lg flex justify-between items-center">
                <span className="text-white font-semibold">{game.name}</span>
                <span className="text-blue-400">{Math.round(game.playtime / 60)} 시간</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Toggle */}
        {!showDashboard ? (
          <div className="text-center">
            <button
              onClick={fetchDashboard}
              className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              상세 대시보드 보기
            </button>
          </div>
        ) : dashboard && (
          <>
            {/* Playtime Distribution Chart */}
            <div className="bg-steam-lightblue rounded-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">플레이타임 분포</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboard.charts.playtimeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dashboard.charts.playtimeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top 10 Games Chart */}
            <div className="bg-steam-lightblue rounded-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">플레이타임 기준 Top 10 게임</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dashboard.charts.topGames} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" stroke="#c7d5e0" />
                  <YAxis dataKey="name" type="category" width={150} stroke="#c7d5e0" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="playtime" fill="#0088FE" name="플레이 시간 (시간)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Additional Stats */}
            <div className="bg-steam-lightblue rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-4">통계</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-steam-blue p-6 rounded-lg">
                  <div className="text-4xl font-bold text-white mb-2">{dashboard.stats.totalGames}</div>
                  <div className="text-steam-gray">보유 게임 총 개수</div>
                </div>
                <div className="bg-steam-blue p-6 rounded-lg">
                  <div className="text-4xl font-bold text-white mb-2">{dashboard.stats.totalPlaytime.toLocaleString()}</div>
                  <div className="text-steam-gray">총 플레이 시간</div>
                </div>
                <div className="bg-steam-blue p-6 rounded-lg">
                  <div className="text-4xl font-bold text-white mb-2">{dashboard.stats.gamesNeverPlayed}</div>
                  <div className="text-steam-gray">한번도 플레이하지 않은 게임</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
