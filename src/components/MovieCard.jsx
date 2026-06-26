import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  const posterUrl = movie.poster_path 
    ? `${import.meta.env.VITE_API_URL}/api/tmdb/image/w500${movie.poster_path}` 
    : 'https://picsum.photos/id/1015/500/750';

  const handleImageError = (e) => {
    e.target.src = 'https://picsum.photos/id/1015/500/750';
  };

  return (
    <Link to={`/movie/${movie.id}`} className="group block bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.985]">
      <div className="relative">
        <img 
          src={posterUrl} 
          alt={movie.title} 
          className="w-full aspect-2/3 object-cover group-hover:scale-105 transition-transform duration-500"
          onError={handleImageError}
        />
        {movie.vote_average && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/80 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1 border border-white/10">
            ★ {movie.vote_average.toFixed(1)}
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-base font-semibold line-clamp-2 text-white group-hover:text-red-500 transition-colors mb-1.5">
          {movie.title}
        </h3>
        <div className="flex justify-between text-xs text-zinc-400">
          <span>{movie.release_date ? movie.release_date.substring(0, 4) : '-'}</span>
        </div>
      </div>
    </Link>
  );
}