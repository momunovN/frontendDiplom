import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import SeatMap from "../components/SeatMap";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSession, setSelectedSession] = useState(null);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const handleImageError = (e) => {
    e.target.src = 'https://picsum.photos/id/1015/780/439';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const movieRes = await api.get(`/api/tmdb/movie/${id}`);
        setMovie(movieRes.data);

        const sessionsRes = await api.get('/api/sessions');
        const movieSessions = sessionsRes.data.filter(s => String(s.movieId) === String(id));
        setSessions(movieSessions);

      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить информацию о фильме");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBookSeats = async () => {
    if (!selectedSession || selectedSeats.length === 0) {
      return alert("Выберите места!");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Войдите в аккаунт");
      navigate("/login");
      return;
    }

    try {
      await api.post("/api/bookings", {
        sessionId: selectedSession._id,
        seats: selectedSeats,
        totalPrice: selectedSeats.length * selectedSession.price,
      });

      alert(`Забронировано ${selectedSeats.length} мест!`);
      setSelectedSeats([]);
      setShowSeatMap(false);
      setSelectedSession(null);

      const sessionsRes = await api.get('/api/sessions');
      const movieSessions = sessionsRes.data.filter(s => String(s.movieId) === String(id));
      setSessions(movieSessions);

    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        alert("Сессия истекла. Пожалуйста, войдите заново.");
        navigate("/login");
      } else {
        alert(error.response?.data?.message || "Ошибка бронирования");
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-2xl">Загрузка...</div>;
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-center px-6">
        <div>
          <p className="text-red-400 mb-4">{error || "Фильм не найден"}</p>
          <button onClick={() => navigate(-1)} className="text-red-500 hover:underline">Вернуться назад</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white text-sm sm:text-base">
        ← Назад
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Изображение */}
        <div className="order-1 lg:order-1">
          <img
            src={`${import.meta.env.VITE_API_URL}/api/tmdb/image/w780${movie.backdrop_path || movie.poster_path}`}
            alt={movie.title}
            className="rounded-2xl sm:rounded-3xl w-full shadow-2xl"
            onError={handleImageError}
          />
        </div>

        {/* Информация */}
        <div className="order-2 lg:order-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{movie.title}</h1>
          <p className="text-zinc-400 mb-4 sm:mb-6 text-sm sm:text-base">
            {movie.release_date?.substring(0, 4)} • {movie.runtime || '?'} мин
          </p>
          <p className="text-zinc-300 mb-8 sm:mb-10 text-sm sm:text-base">{movie.overview}</p>

          <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Сеансы</h3>

          <div className="space-y-3 sm:space-y-4">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <button
                  key={session._id}
                  onClick={() => {
                    setSelectedSession(session);
                    setShowSeatMap(false);
                    setSelectedSeats([]);
                  }}
                  className={`w-full p-4 sm:p-6 rounded-2xl border-2 text-left transition-all ${selectedSession?._id === session._id ? 'border-red-600 bg-red-950/30' : 'border-zinc-700 hover:border-zinc-500'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold">{session.time}</div>
                      <div className="text-zinc-400 text-sm sm:text-base">{session.hall}</div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xl sm:text-2xl font-semibold">{session.price} ₽</div>
                      <div className="text-emerald-400 text-xs sm:text-sm">
                        Свободно: {session.totalSeats - (session.bookedSeats || 0)}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-zinc-400 py-8">Для этого фильма пока нет сеансов</p>
            )}
          </div>

          {/* Бронирование */}
          {selectedSession && (
            <div className="mt-8 sm:mt-10">
              <button
                onClick={() => setShowSeatMap(!showSeatMap)}
                className="w-full bg-red-600 hover:bg-red-700 py-3.5 sm:py-4 rounded-2xl text-lg sm:text-xl font-semibold mb-6 transition"
              >
                {showSeatMap ? "Скрыть схему зала" : "Выбрать места"}
              </button>

              {showSeatMap && (
                <SeatMap
                  selectedSeats={selectedSeats}
                  setSelectedSeats={setSelectedSeats}
                  price={selectedSession.price}
                  bookedSeatsList={selectedSession.bookedSeatsList || []}
                />
              )}

              {selectedSeats.length > 0 && (
                <button
                  onClick={handleBookSeats}
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold transition"
                >
                  Забронировать ({selectedSeats.length} мест) — {selectedSeats.length * selectedSession.price} ₽
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}