import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


import api from '../api/axios';
import tmdbApi from '../api/tmdb';


import SeatMap from '../components/SeatMap';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSession, setSelectedSession] = useState(null);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Фильм из TMDB
        const movieRes = await tmdbApi.get(`https://api.themoviedb.org/3/movie/${id}`, {
          params: { api_key: TMDB_API_KEY, language: 'ru-RU' }
        });
        setMovie(movieRes.data);

        // Сеансы только для этого фильма
        const sessionsRes = await api.get(`/api/sessions?movieId=${id}`);
        setSessions(sessionsRes.data || []);
      } catch (err) {
        console.error(err);
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

  const token = localStorage.getItem('token'); // ← достаём токен
  if (!token) {
    alert("Войдите в аккаунт");
    navigate('/login');
    return;
  }

  try {
    await api.post('/api/bookings', {
      sessionId: selectedSession._id,
      seats: selectedSeats,                    // массив строк, например ["5-12", "5-13"]
      totalPrice: selectedSeats.length * selectedSession.price
    }, {
      headers: {
        Authorization: `Bearer ${token}`       // ← обязательно отправляем токен
      }
    });

    alert(`✅ Забронировано ${selectedSeats.length} мест!`);
    setSelectedSeats([]);
    setShowSeatMap(false);
    setSelectedSession(null);

    // Можно обновить список сеансов, чтобы показать актуальное количество свободных мест
    // window.location.reload(); // или перезапросить сеансы

  } catch (error) {
    console.error(error);
    if (error.response?.status === 401) {
      alert("Сессия истекла. Пожалуйста, войдите заново.");
      navigate('/login');
    } else {
      alert(error.response?.data?.message || "Ошибка бронирования");
    }
  }
};

  if (loading) return <div className="text-center py-20 text-2xl">Загрузка...</div>;
  if (!movie) return <div>Фильм не найден</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-white">
        ← Назад
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <img 
            src={`https://image.tmdb.org/t/p/w780${movie.backdrop_path || movie.poster_path}`} 
            alt={movie.title}
            className="rounded-3xl w-full shadow-2xl"
          />
        </div>

        <div>
          <h1 className="text-5xl font-bold mb-4">{movie.title}</h1>
          <p className="text-zinc-400 mb-6">
            {movie.release_date?.substring(0,4)} • {movie.runtime} мин
          </p>
          <p className="text-zinc-300 mb-10">{movie.overview}</p>

          <h3 className="text-2xl font-semibold mb-6">Сеансы</h3>

          <div className="space-y-4">
            {sessions.length > 0 ? sessions.map(session => (
              <button
                key={session._id}
                onClick={() => {
                  setSelectedSession(session);
                  setShowSeatMap(false);
                  setSelectedSeats([]);
                }}
                className={`w-full p-6 rounded-3xl border-2 text-left transition-all ${
                  selectedSession?._id === session._id ? 'border-red-600 bg-red-950/30' : 'border-zinc-700 hover:border-zinc-500'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-3xl font-bold">{session.time}</div>
                    <div className="text-zinc-400">{session.hall}</div>
                    {session.date && <div className="text-sm text-zinc-500">{session.date}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold">{session.price} ₽</div>
                    <div className="text-emerald-400 text-sm">
                      Свободно: {session.totalSeats - (session.bookedSeats || 0)}
                    </div>
                  </div>
                </div>
              </button>
            )) : (
              <p className="text-zinc-400 py-10">Для этого фильма пока нет сеансов</p>
            )}
          </div>

          {selectedSession && (
            <div className="mt-10">
              <button
                onClick={() => setShowSeatMap(!showSeatMap)}
                className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-2xl text-xl font-semibold mb-6"
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
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 py-5 rounded-2xl text-xl font-bold"
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