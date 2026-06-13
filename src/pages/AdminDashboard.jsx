import { useState, useEffect } from 'react';
import api from '../api/axios';
import Toast from '../components/Toast';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('popular'); // popular, new, highRated
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [newSession, setNewSession] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '',
    hall: '',
    price: '',
    bookedSeatsList: ''
  });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadSessions = async () => {
    try {
      const res = await api.get('/api/sessions');
      setSessions(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMovies = async (tab) => {
    setLoading(true);
    try {
      let url = '';
      if (tab === 'popular') url = 'https://api.themoviedb.org/3/movie/popular';
      else if (tab === 'new') url = 'https://api.themoviedb.org/3/movie/now_playing';
      else if (tab === 'highRated') url = 'https://api.themoviedb.org/3/movie/top_rated';

      const res = await api.get(url, {
        params: { api_key: TMDB_API_KEY, language: 'ru-RU', page: 1 }
      });

      let results = res.data.results;
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

  const addOrUpdateSession = async () => {
    if (!selectedMovie || !newSession.time || !newSession.hall || !newSession.price) {
      return showToast("Заполните все обязательные поля!", "error");
    }

    const bookedList = newSession.bookedSeatsList
      ? newSession.bookedSeatsList.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    setLoading(true);
    try {
      if (editingSession) {
        await api.put(`/api/sessions/${editingSession._id}`, {
          date: newSession.date,
          time: newSession.time,
          hall: newSession.hall,
          price: Number(newSession.price),
          bookedSeatsList: bookedList
        });
        showToast("Сеанс успешно обновлён!");
      } else {
        await api.post('/api/sessions', {
          movieId: selectedMovie.id,
          movieTitle: selectedMovie.title,
          date: newSession.date,
          time: newSession.time,
          hall: newSession.hall,
          price: Number(newSession.price),
          bookedSeatsList: bookedList
        });
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
      bookedSeatsList: session.bookedSeatsList ? session.bookedSeatsList.join(', ') : ''
    });
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

  const deleteSession = async (id, movieTitle) => {
    if (!window.confirm(`Удалить сеанс "${movieTitle}"?`)) return;
    try {
      await api.delete(`/api/sessions/${id}`);
      showToast("Сеанс удалён");
      loadSessions();
    } catch (err) {
      showToast("Ошибка удаления", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-10">Административная панель</h1>

      {/* Вкладки */}
      <div className="flex gap-2 mb-8 border-b border-zinc-800 pb-1">
        {[
          { id: 'popular', label: '🔥 Популярные' },
          { id: 'new', label: '🆕 Новинки' },
          { id: 'highRated', label: '⭐ Рейтинг ≥ 7.0' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-3 rounded-t-2xl font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-red-600 text-white' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Список фильмов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {movies.map(movie => (
          <div 
            key={movie.id}
            onClick={() => setSelectedMovie(movie)}
            className={`bg-zinc-900 rounded-3xl overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 ${
              selectedMovie?.id === movie.id ? 'border-red-600' : 'border-transparent'
            }`}
          >
            <img 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              alt={movie.title}
              className="w-full h-80 object-cover"
            />
            <div className="p-5">
              <h3 className="font-semibold text-lg leading-tight">{movie.title}</h3>
              <div className="flex justify-between text-sm text-zinc-400 mt-2">
                <span>{movie.release_date?.substring(0,4)}</span>
                <span>⭐ {movie.vote_average?.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Форма добавления / редактирования */}
      {selectedMovie && (
        <div className="bg-zinc-800 p-8 rounded-3xl">
          <h3 className="font-semibold text-xl mb-6">
            {editingSession ? "Редактировать сеанс" : "Добавить сеанс"} для: 
            <span className="text-red-500"> {selectedMovie.title}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="date" value={newSession.date} onChange={e => setNewSession({...newSession, date: e.target.value})} className="bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4" />
            <input type="text" placeholder="Время (15:30)" value={newSession.time} onChange={e => setNewSession({...newSession, time: e.target.value})} className="bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4" />
            <input type="text" placeholder="Зал" value={newSession.hall} onChange={e => setNewSession({...newSession, hall: e.target.value})} className="bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4" />
            <input type="number" placeholder="Цена" value={newSession.price} onChange={e => setNewSession({...newSession, price: e.target.value})} className="bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4" />
          </div>

          <input 
            type="text" 
            placeholder="Занятые места (через запятую): A-1,A-2,B-5" 
            value={newSession.bookedSeatsList} 
            onChange={e => setNewSession({...newSession, bookedSeatsList: e.target.value})} 
            className="w-full mt-6 bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4" 
          />

          <div className="flex gap-4 mt-8">
            <button onClick={addOrUpdateSession} className="flex-1 bg-red-600 hover:bg-red-700 py-4 rounded-2xl font-semibold">
              {editingSession ? "Сохранить изменения" : "Добавить сеанс"}
            </button>
            {editingSession && (
              <button onClick={resetForm} className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-4 rounded-2xl font-semibold">
                Отмена
              </button>
            )}
          </div>
        </div>
      )}

      {/* Список сеансов */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-6">Текущие сеансы ({sessions.length})</h2>
        {sessions.length === 0 ? (
          <p className="text-zinc-400 py-10">Пока нет сеансов</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map(s => (
              <div key={s._id} className="bg-zinc-900 p-6 rounded-3xl flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{s.movieTitle}</h3>
                  <p className="text-xl mt-2">{s.date} • {s.time}</p>
                  <p className="text-zinc-400">{s.hall} • {s.price} ₽</p>
                  <p className="text-red-400 mt-1">Занято: {s.bookedSeatsList?.length || 0} мест</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => editSession(s)} className="text-blue-400 hover:text-blue-500">Редактировать</button>
                  <button onClick={() => deleteSession(s._id, s.movieTitle)} className="text-red-500 hover:text-red-600">Удалить</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}