import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', formData);

      // Сохраняем данные
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Уведомляем Header, что произошёл вход
      window.dispatchEvent(new Event('authChange'));

      // Редирект
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Вход в аккаунт</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
              placeholder="example@mail.com"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 py-3.5 rounded-xl font-semibold text-lg disabled:opacity-50 transition"
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <p className="text-center text-zinc-400 mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-red-500 hover:underline">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}