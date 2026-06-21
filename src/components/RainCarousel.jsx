import { Link } from 'react-router-dom';

export default function RainCarousel({ movies }) {
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/500x750/27272a/ffffff?text=Нет+постера';
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {movies.map((movie, index) => {
        const posterUrl = movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
          : 'https://via.placeholder.com/500x750/27272a/ffffff?text=Нет+постера';

        return (
          <Link
            to={`/movie/${movie.id}`}
            key={index}
            className="inline-block transition-transform hover:scale-105 group shrink-0"
          >
            <div className="relative w-48 rounded-2xl overflow-hidden shadow-xl">
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-full aspect-2/3 object-cover"
                onError={handleImageError}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-3">
                <h3 className="text-white font-semibold text-sm line-clamp-2">{movie.title}</h3>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}