import { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
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
      setPopularMovies(tmdbRes.data.results?.slice(0, 18) || []);

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
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={fetchData} className="px-6 py-3 bg-red-600 rounded-xl">Попробовать снова</button>
      </div>
    );
  }

  // Hero background с fallback
  const heroBackground = popularMovies.length > 0 
    ? `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('https://image.tmdb.org/t/p/original${popularMovies[0].backdrop_path}')`
    : 'linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.95))';

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <div 
        className="relative h-[72vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: heroBackground }}
      >
        <div className="text-center z-10 px-6 max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tighter">KinoBook</h1>
          <p className="text-xl md:text-2xl text-zinc-200 mb-10">
            Новинки кино • Удобное бронирование • Лучшие места
          </p>
          <a href="#sessions" className="bg-red-600 hover:bg-red-700 px-12 py-4 rounded-full text-lg font-semibold inline-block transition">
            Смотреть сеансы
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Популярное */}
        {popularMovies.length > 0 && (
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8 px-2">Популярное сейчас</h2>
            <RainCarousel movies={popularMovies} />
          </section>
        )}

        {/* Сеансы */}
        <section id="sessions">
          <h2 className="text-3xl font-bold mb-8">Ближайшие сеансы</h2>
          {sessions.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900 rounded-3xl">
              <p className="text-xl text-zinc-400">Сеансов пока нет</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map(session => (
                <div key={session._id} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                  <h3 className="text-xl font-semibold mb-2">{session.movieTitle}</h3>
                  <p className="text-zinc-400">{new Date(session.date).toLocaleDateString('ru-RU')} • {session.time}</p>
                  <p className="text-zinc-400">{session.hall} • {session.price} ₽</p>
                  <a href={`/movie/${session.movieId}`} className="mt-4 inline-block bg-zinc-800 hover:bg-red-600 px-6 py-2 rounded-xl">
                    Выбрать места
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}