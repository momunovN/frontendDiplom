import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function RainCarousel({ movies }) {
  const carouselRef = useRef(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || movies.length === 0) return;

    let position = 0;
    const speed = 0.4; // скорость движения

    const animate = () => {
      position += speed;
      carousel.scrollLeft = position;

      // Бесконечная прокрутка
      if (position >= carousel.scrollWidth / 2) {
        position = 0;
      }

      requestAnimationFrame(animate);
    };

    const rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [movies]);

  if (!movies || movies.length === 0) {
    return <div className="text-zinc-500 py-8">Нет фильмов для карусели</div>;
  }

  return (
    <div className="relative overflow-hidden py-8">
      <div
        ref={carouselRef}
        className="flex gap-8 overflow-x-hidden pb-4"
        style={{ scrollbarWidth: 'none' }}
      >
        {[...movies, ...movies, ...movies].map((movie, index) => {
          const randomTop = (index % 6) * 14 - 25;   // разброс по высоте
          const randomRotate = (index % 9) - 4;      // поворот

          return (
            <Link
              to={`/movie/${movie.id}`}
              key={index}
              className="inline-block transition-transform hover:scale-105 group shrink-0"
              style={{
                marginTop: `${randomTop}px`,
                transform: `rotate(${randomRotate}deg)`,
              }}
            >
              <div className="w-52 bg-zinc-900 rounded-3xl overflow-hidden shadow-xl border border-zinc-800 group-hover:border-red-500/50 transition-all">
                <div className="relative">
                  <img
                    src={movie.poster_path 
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                      : 'https://via.placeholder.com/500x750/27272a/ffffff?text=Нет+постера'}
                    alt={movie.title}
                    className="w-full aspect-2/3 object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-2xl text-sm font-bold">
                    ★ {movie.vote_average ? movie.vote_average.toFixed(1) : '—'}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-[15px] line-clamp-2 group-hover:text-red-400 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1.5">
                    {movie.release_date ? movie.release_date.substring(0, 4) : ''}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Градиенты по бокам */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-linear-to-r from-zinc-950 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-zinc-950 to-transparent z-10 pointer-events-none"></div>
    </div>
  );
}