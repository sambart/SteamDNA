export default function Home() {
  const handleSteamLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    window.location.href = `${apiUrl}/auth/steam`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-steam-darkgray to-steam-blue">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-6xl font-bold mb-4 text-white">
          Discover Your Gaming DNA
        </h1>
        <p className="text-xl mb-8 text-steam-gray">
          Analyze your Steam gaming profile and uncover your unique gaming personality
        </p>

        <button
          onClick={handleSteamLogin}
          className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Sign in with Steam
        </button>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-steam-lightblue rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-white">🎮 Data Collection</h3>
            <p className="text-steam-gray">
              Securely connect your Steam account and we'll analyze your gaming library
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
