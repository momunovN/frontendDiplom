import { Link } from 'react-router-dom';

export default function RainCarousel({ movies = [] }) {
  const handleImageError = (e) => {
    e.target.src = 'https://picsum.photos/id/1015/500/750';
  };

  if (!movies.length) return null;

  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
      {movies.map((movie, index) => {
        const posterUrl = movie.poster_path 
          ? `${import.meta.env.VITE_API_URL}/api/tmdb/image/w500${movie.poster_path}` 
          : 'https://picsum.photos/id/1015/500/750';

        return (
          <Link
            to={`/movie/${movie.id}`}
            key={index}
            className="inline-block shrink-0 snap-start group w-35 sm:w-40 md:w-45"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-full aspect-2/3 object-cover group-hover:scale-105 transition-transform duration-500"
                onError={handleImageError}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/70 to-transparent p-2.5 sm:p-3">
                <h3 className="text-white text-xs sm:text-sm font-semibold line-clamp-2 drop-shadow">
                  {movie.title}
                </h3>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}