import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : 'https://via.placeholder.com/500x750/27272a/ffffff?text=Нет+постера';

  return (
    <Link 
      to={`/movie/${movie.id}`} 
      className="group block bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5"
    >
      <div className="relative">
        <img 
          src={posterUrl} 
          alt={movie.title} 
          className="w-full aspect-2/3 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {movie.vote_average && (
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl text-sm font-semibold flex items-center gap-1 border border-white/10">
            ★ {movie.vote_average.toFixed(1)}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base font-semibold line-clamp-2 text-white group-hover:text-red-500 transition-colors mb-1.5">
          {movie.title}
        </h3>
        
        <div className="flex justify-between text-xs text-zinc-400">
          <span>
            {movie.release_date ? movie.release_date.substring(0, 4) : '—'}
          </span>
          {movie.genres && (
            <span className="line-clamp-1">
              {Array.isArray(movie.genres) 
                ? movie.genres.slice(0, 2).join(', ') 
                : ''}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}