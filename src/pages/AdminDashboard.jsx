import { useState, useEffect } from 'react';
import api from '../api/axios';
import Toast from '../components/Toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('popular'); // popular | new | highRated
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [newSession, setNewSession] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '',
    hall: '',
    price: '',
    bookedSeatsList: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Загрузка сеансов
  const loadSessions = async () => {
    try {
      const res = await api.get('/api/sessions');
      setSessions(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Загрузка фильмов через прокси бэкенда
  const loadMovies = async (tab) => {
    setLoading(true);
    try {
      let endpoint = '';
      if (tab === 'popular') endpoint = '/api/tmdb/popular';
      else if (tab === 'new') endpoint = '/api/tmdb/now_playing';
      else if (tab === 'highRated') endpoint = '/api/tmdb/top_rated';

      const res = await api.get(endpoint);
      let results = res.data.results || [];

      if (tab === 'highRated') {
        results = results.filter(m => m.vote_average >= 7.0);
      }

      setMovies(results);
    } catch (err) {
      console.error(err);
      showToast("Ошибка загрузки фильмов", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
    loadMovies(activeTab);
  }, [activeTab]);

  // Добавление / редактирование сеанса
  const addOrUpdateSession = async () => {
    if (!selectedMovie || !newSession.time || !newSession.hall || !newSession.price) {
      return showToast("Заполните все обязательные поля!", "error");
    }

    const bookedList = newSession.bookedSeatsList
      ? newSession.bookedSeatsList.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    setLoading(true);
    try {
      const payload = {
        movieId: selectedMovie.id,
        movieTitle: selectedMovie.title,
        date: newSession.date,
        time: newSession.time,
        hall: newSession.hall,
        price: Number(newSession.price),
        bookedSeatsList: bookedList
      };

      if (editingSession) {
        await api.put(`/api/sessions/${editingSession._id}`, payload);
        showToast("Сеанс успешно обновлён!");
      } else {
        await api.post('/api/sessions', payload);
        showToast(`Сеанс для "${selectedMovie.title}" добавлен!`);
      }

      resetForm();
      loadSessions();
    } catch (err) {
      showToast("Ошибка сохранения сеанса", "error");
    } finally {
      setLoading(false);
    }
  };

  const editSession = (session) => {
    setEditingSession(session);
    setSelectedMovie({ id: session.movieId, title: session.movieTitle });
    setNewSession({
      date: session.date || new Date().toISOString().split('T')[0],
      time: session.time,
      hall: session.hall,
      price: session.price,
      bookedSeatsList: session.bookedSeatsList?.join(', ') || ''
    });
  };

  const deleteSession = async (id) => {
    if (!window.confirm('Удалить этот сеанс?')) return;

    try {
      await api.delete(`/api/sessions/${id}`);
      showToast("Сеанс удалён");
      loadSessions();
    } catch (err) {
      showToast("Ошибка удаления сеанса", "error");
    }
  };

  const resetForm = () => {
    setEditingSession(null);
    setSelectedMovie(null);
    setNewSession({
      date: new Date().toISOString().split('T')[0],
      time: '',
      hall: '',
      price: '',
      bookedSeatsList: ''
    });
  };

  const selectMovie = (movie) => {
    setSelectedMovie(movie);
    setEditingSession(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Админ-панель</h1>

        {/* Табы */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'popular', label: 'Популярные' },
            { key: 'new', label: 'Сейчас в кино' },
            { key: 'highRated', label: 'Высокий рейтинг' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2 rounded-full transition ${
                activeTab === tab.key
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Список фильмов */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {loading ? (
            <div className="col-span-full text-center py-10 text-zinc-400">Загрузка...</div>
          ) : (
            movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => selectMovie(movie)}
                className={`cursor-pointer rounded-2xl overflow-hidden border transition ${
                  selectedMovie?.id === movie.id
                    ? 'border-red-500 ring-2 ring-red-500/50'
                    : 'border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full aspect-2/3 object-cover"
                />
                <div className="p-3">
                  <div className="font-semibold line-clamp-2">{movie.title}</div>
                  <div className="text-sm text-zinc-400 mt-1">
                    {movie.release_date?.slice(0, 4)} • ★ {movie.vote_average?.toFixed(1)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Форма создания/редактирования сеанса */}
        {selectedMovie && (
          <div className="bg-zinc-900 rounded-3xl p-8 mb-10">
            <h2 className="text-2xl font-bold mb-6">
              {editingSession ? 'Редактировать сеанс' : 'Добавить сеанс'} для «{selectedMovie.title}»
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Дата</label>
                <input
                  type="date"
                  value={newSession.date}
                  onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Время</label>
                <input
                  type="time"
                  value={newSession.time}
                  onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Зал</label>
                <input
                  type="text"
                  value={newSession.hall}
                  onChange={(e) => setNewSession({ ...newSession, hall: e.target.value })}
                  placeholder="Зал 1"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Цена (₽)</label>
                <input
                  type="number"
                  value={newSession.price}
                  onChange={(e) => setNewSession({ ...newSession, price: e.target.value })}
                  placeholder="350"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-1">Забронированные места (через запятую)</label>
                <input
                  type="text"
                  value={newSession.bookedSeatsList}
                  onChange={(e) => setNewSession({ ...newSession, bookedSeatsList: e.target.value })}
                  placeholder="5-12, 5-13, 6-8"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={addOrUpdateSession}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {editingSession ? 'Сохранить изменения' : 'Добавить сеанс'}
              </button>
              <button
                onClick={resetForm}
                className="px-8 py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Список всех сеансов */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Все сеансы ({sessions.length})</h2>

          {sessions.length === 0 ? (
            <div className="bg-zinc-900 rounded-2xl p-8 text-center text-zinc-400">
              Сеансов пока нет
            </div>
          ) : (
            <div className="bg-zinc-900 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="text-left p-4">Фильм</th>
                    <th className="text-left p-4">Дата и время</th>
                    <th className="text-left p-4">Зал</th>
                    <th className="text-left p-4">Цена</th>
                    <th className="text-right p-4">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session._id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                      <td className="p-4 font-medium">{session.movieTitle}</td>
                      <td className="p-4 text-zinc-300">
                        {new Date(session.date).toLocaleDateString('ru-RU')} • {session.time}
                      </td>
                      <td className="p-4">{session.hall}</td>
                      <td className="p-4">{session.price} ₽</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => editSession(session)}
                          className="px-4 py-1.5 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-lg"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => deleteSession(session._id)}
                          className="px-4 py-1.5 text-sm bg-red-900/70 hover:bg-red-800 rounded-lg"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}