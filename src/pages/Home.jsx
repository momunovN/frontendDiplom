import { useEffect, useState } from 'react';
import api from '../api/axios';
import RainCarousel from '../components/RainCarousel';

export default function Home() {
  const [sessions, setSessions] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const sessionsRes = await api.get('/api/sessions');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const futureSessions = sessionsRes.data
        .filter(s => new Date(s.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time));

      setSessions(futureSessions);

      const tmdbRes = await api.get('/api/tmdb/popular');
      const popular = tmdbRes.data.results?.slice(0, 18) || [];
      setPopularMovies(popular);

    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-2xl">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center px-6">
        <p className="text-red-400 text-xl mb-6">{error}</p>
        <button onClick={fetchData} className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-2xl font-semibold">Попробовать снова</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <div className="relative h-[65vh] sm:h-[70vh] lg:h-[72vh] flex items-center justify-center overflow-hidden bg-black">
        {popularMovies.length > 0 && popularMovies[0].backdrop_path && (
          <img
            src={`${import.meta.env.VITE_API_URL}/api/tmdb/image/original${popularMovies[0].backdrop_path}`}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tighter">KinoBook</h1>
          <p className="text-lg sm:text-xl md:text-2xl text-zinc-200 mb-8 sm:mb-10">
            Новинки кино • Удобное бронирование • Лучшие места
          </p>
          <a href="#sessions" className="bg-red-600 hover:bg-red-700 px-10 sm:px-12 py-3.5 sm:py-4 rounded-full text-base sm:text-lg font-semibold inline-block transition">
            Смотреть сеансы
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {/* Популярные */}
        {popularMovies.length > 0 && (
          <section className="mb-16 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 px-1">Популярное сейчас</h2>
            <RainCarousel movies={popularMovies} />
          </section>
        )}

        {/* Сеансы */}
        <section id="sessions">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Ближайшие сеансы</h2>
          {sessions.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-zinc-900 rounded-3xl">
              <p className="text-lg sm:text-xl text-zinc-400">Сеансов пока нет</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sessions.map(session => (
                <div key={session._id} className="bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-zinc-800 hover:border-red-500/30 transition-all flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 line-clamp-2">{session.movieTitle}</h3>
                    <div className="space-y-1 text-sm text-zinc-400">
                      <p>{new Date(session.date).toLocaleDateString('ru-RU')}</p>
                      <p>{session.time} • {session.hall}</p>
                    </div>
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold">{session.price}</span>
                      <span className="text-zinc-400 ml-1">₽</span>
                    </div>
                    <a href={`/movie/${session.movieId}`} className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-semibold transition">
                      Выбрать места
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}