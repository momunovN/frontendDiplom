import { Link } from 'react-router-dom';
import { Film, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-3xl font-bold hover:text-red-500 transition">
          <Film className="text-red-600" size={38} />
          KinoBook
        </Link>

        <nav className="flex items-center gap-10 text-lg font-medium">
          <Link to="/" className="hover:text-red-500 transition-colors">Главная</Link>
          <Link to="/movies" className="hover:text-red-500 transition-colors">Фильмы</Link>
          {user && <Link to="/profile" className="hover:text-red-500 transition-colors">Профиль</Link>}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">👤 {user.name}</span>
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-5 py-2 bg-zinc-800 hover:bg-red-600/20 hover:text-red-500 rounded-xl transition"
              >
                <LogOut size={18} />
                Выйти
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link 
                to="/login"
                className="px-6 py-2.5 border border-zinc-700 hover:border-white rounded-xl transition"
              >
                Войти
              </Link>
              <Link 
                to="/register"
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl transition"
              >
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}