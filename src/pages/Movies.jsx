import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

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

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/500x750/27272a/ffffff?text=Нет+постера';
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get('/api/tmdb/now_playing');
        const movies = res.data.results || [];

        const grouped = {};
        movies.forEach(movie => {
          movie.genre_ids?.forEach(genreId => {
            const genreName = genreMap[genreId];
            if (genreName) {
              if (!grouped[genreName]) grouped[genreName] = [];
              grouped[genreName].push(movie);
            }
          });
        });
        setMoviesByGenre(grouped);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) return <div className="text-center py-20">Загрузка...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-12">Фильмы по жанрам</h1>
      {Object.entries(moviesByGenre).map(([genre, movies]) => (
        <div key={genre} className="mb-14">
          <h2 className="text-3xl font-semibold mb-6 text-red-500">{genre}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {movies.slice(0, 12).map(movie => (
              <div key={movie.id} onClick={() => navigate(`/movie/${movie.id}`)} className="cursor-pointer">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full aspect-2/3 object-cover rounded-2xl"
                  onError={handleImageError}
                />
                <h3 className="mt-2 font-semibold">{movie.title}</h3>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}