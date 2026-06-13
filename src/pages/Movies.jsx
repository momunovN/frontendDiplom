import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Маппинг жанров TMDB (можно расширить)
const genreMap = {
  28: "Экшн",
  12: "Приключения",
  16: "Анимация",
  35: "Комедия",
  80: "Криминал",
  99: "Документальный",
  18: "Драма",
  10751: "Семейный",
  14: "Фэнтези",
  36: "Исторический",
  27: "Ужасы",
  10402: "Музыка",
  9648: "Детектив",
  10749: "Мелодрама",
  878: "Фантастика",
  10770: "Телевизионный фильм",
  53: "Триллер",
  10752: "Военный",
  37: "Вестерн"
};

export default function Movies() {
  const [moviesByGenre, setMoviesByGenre] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get('https://api.themoviedb.org/3/movie/now_playing', {
          params: {
            api_key: TMDB_API_KEY,
            language: 'ru-RU',
            page: 1
          }
        });

        const movies = res.data.results || [];

        // Группируем фильмы по жанрам
        const grouped = {};

        movies.forEach(movie => {
          if (!movie.genre_ids || movie.genre_ids.length === 0) return;

          movie.genre_ids.forEach(genreId => {
            const genreName = genreMap[genreId];
            if (!genreName) return;

            if (!grouped[genreName]) {
              grouped[genreName] = [];
            }
            grouped[genreName].push(movie);
          });
        });

        setMoviesByGenre(grouped);
      } catch (error) {
        console.error('Ошибка загрузки фильмов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-2xl">Загрузка фильмов...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-12">Фильмы по жанрам</h1>

      {Object.keys(moviesByGenre).length === 0 ? (
        <p className="text-zinc-400">Фильмы не найдены</p>
      ) : (
        Object.entries(moviesByGenre).map(([genre, movies]) => (
          <div key={genre} className="mb-14">
            <h2 className="text-3xl font-semibold mb-6 text-red-500">{genre}</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {movies.slice(0, 12).map((movie) => (   // ограничиваем до 12 фильмов на жанр
                <div
                  key={movie.id}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform group"
                >
                  <div className="relative">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-70 object-cover group-hover:opacity-90 transition"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-3">
                      <h3 className="font-semibold text-lg line-clamp-2 text-white">{movie.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}