import { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';


import api from '../api/axios';
import tmdbApi from '../api/tmdb';


import RainCarousel from '../components/RainCarousel';

export default function Home() {
  const [sessions, setSessions] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);   // Для карусели и секции "В прокате"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
console.log('API URL:', import.meta.env.VITE_API_URL);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Сеансы (только будущие)
        const sessionsRes = await api.get('/api/sessions');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const futureSessions = sessionsRes.data
          .filter(s => new Date(s.date) >= today)
          .sort((a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time));

        setSessions(futureSessions);

        // 2. Популярные фильмы из TMDB
        const tmdbRes = await tmdbApi.get('https://api.themoviedb.org/3/movie/popular', {
          params: {
            api_key: import.meta.env.VITE_TMDB_API_KEY,
            language: 'ru-RU',
            page: 1
          }
        });

        const popular = tmdbRes.data.results.slice(0, 18); // берём побольше
        setPopularMovies(popular);

      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-2xl text-zinc-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Section - самый популярный фильм */}
      <div 
        className="relative h-[72vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: popularMovies.length > 0 
            ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url('https://image.tmdb.org/t/p/original${popularMovies[0].backdrop_path}')`
            : 'linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.95))'
        }}
      >
        <div className="text-center z-10 px-6 max-w-3xl">
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
        
        {/* Красивая карусель */}
        {popularMovies.length > 0 && (
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8 px-2">Популярное сейчас</h2>
            <RainCarousel movies={popularMovies} />
          </section>
        )}

        {/* Ближайшие сеансы */}
        <section id="sessions" className="mb-20">
          <h2 className="text-3xl font-bold mb-8">Ближайшие сеансы</h2>
          
          {sessions.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900 rounded-3xl">
              <p className="text-xl text-zinc-400">Сеансов на ближайшие дни пока нет</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map(session => (
                <div key={session._id} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-red-500/30 transition-all h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className="text-xl font-semibold line-clamp-2">{session.movieTitle}</h3>
                      <p className="text-zinc-400 mt-2">
                        {new Date(session.date).toLocaleDateString('ru-RU')} • {session.time}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-red-500">{session.price} ₽</div>
                      <div className="text-xs text-zinc-500">Зал {session.hall}</div>
                    </div>
                  </div>

                  <div className="mt-auto text-sm text-zinc-400">
                    Свободно: <span className="text-white font-medium">
                      {session.totalSeats - (session.bookedSeats || 0)}
                    </span> / {session.totalSeats}
                  </div>

                  <a 
                    href={`/movie/${session.movieId}?sessionId=${session._id}`}
                    className="mt-6 block w-full bg-red-600 hover:bg-red-700 text-center py-3.5 rounded-xl font-medium transition"
                  >
                    Выбрать места
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Фильмы в прокате — популярные из TMDB */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Фильмы в прокате</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {popularMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}