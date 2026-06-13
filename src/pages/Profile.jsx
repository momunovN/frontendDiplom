import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Profile() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Загружаем пользователя из localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Получаем бронирования текущего пользователя
  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/api/bookings/my', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBookings(res.data || []);
    } catch (err) {
      console.error('Ошибка загрузки бронирований:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Отмена бронирования (пока заглушка)
  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Отменить бронирование?")) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert("Бронирование отменено");
      fetchBookings(); // обновляем список
    } catch (err) {
      console.error(err);
      alert("Ошибка отмены бронирования (функция пока не реализована на бэкенде)");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-10">Мой профиль</h1>

      {/* Информация о пользователе */}
      {user && (
        <div className="bg-zinc-900 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Личные данные</h2>
          <p><span className="text-zinc-400">Имя:</span> {user.name}</p>
          <p><span className="text-zinc-400">Email:</span> {user.email}</p>
          <p><span className="text-zinc-400">Роль:</span> {user.role}</p>
        </div>
      )}

      {/* История бронирований */}
      <div className="bg-zinc-900 rounded-3xl p-8">
        <h2 className="text-2xl font-semibold mb-8">
          История бронирований ({bookings.length})
        </h2>

        {loading ? (
          <p className="text-center py-10">Загрузка...</p>
        ) : bookings.length === 0 ? (
          <p className="text-zinc-400 text-center py-16">
            У вас пока нет бронирований
          </p>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div 
                key={booking._id} 
                className="bg-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between gap-6"
              >
                <div>
                  <h3 className="font-semibold text-xl">{booking.movieTitle}</h3>
                  <p className="text-zinc-400">
                    {booking.sessionTime} • Зал {booking.hall}
                  </p>
                  <p className="text-emerald-400 mt-1">
                    Места: <span className="font-medium">{booking.seats?.join(', ')}</span>
                  </p>
                </div>

                <div className="text-right flex flex-col items-end">
                  <p className="text-2xl font-bold">{booking.totalPrice} ₽</p>
                  <p className="text-sm text-zinc-500">
                    {new Date(booking.createdAt).toLocaleDateString('ru-RU')}
                  </p>

                  <button 
                    onClick={() => cancelBooking(booking._id)}
                    className="mt-4 px-5 py-2 text-red-500 hover:text-red-600 hover:bg-red-950/30 rounded-xl text-sm transition-colors"
                  >
                    Отменить бронь
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}