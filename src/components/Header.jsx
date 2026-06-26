import { Link, useNavigate } from 'react-router-dom';
import { Film, User, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Функция для загрузки пользователя
  const loadUser = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();

    // Слушаем изменения в localStorage (на случай логина из другой вкладки)
    const handleStorageChange = () => loadUser();
    window.addEventListener('storage', handleStorageChange);

    // Кастомное событие для мгновенного обновления после логина
    const handleAuthChange = () => loadUser();
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsMenuOpen(false);
    window.dispatchEvent(new Event('authChange')); // уведомляем все компоненты
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Логотип */}
        <Link to="/" className="flex items-center gap-3 text-2xl sm:text-3xl font-bold hover:text-red-500 transition">
          <Film className="text-red-600" size={32} />
          <span className="hidden sm:inline">KinoBook</span>
        </Link>

        {/* Десктопное меню */}
        <nav className="hidden md:flex items-center gap-8 text-lg font-medium">
          <Link to="/" className="hover:text-red-500 transition-colors">Главная</Link>
          <Link to="/movies" className="hover:text-red-500 transition-colors">Фильмы</Link>
          {user && <Link to="/profile" className="hover:text-red-500 transition-colors">Профиль</Link>}
          {isAdmin && (
            <Link to="/admin" className="text-red-400 hover:text-red-500 font-semibold transition-colors">
              Админ
            </Link>
          )}
        </nav>

        {/* Правая часть */}
        <div className="flex items-center gap-3">
          {/* Десктоп: авторизация */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-400">Привет, {user.name}</span>
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
                <Link to="/login" className="px-6 py-2.5 border border-zinc-700 hover:border-white rounded-xl transition">
                  Войти
                </Link>
                <Link to="/register" className="px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl transition">
                  Регистрация
                </Link>
              </div>
            )}
          </div>

          {/* Мобильное меню (бургер) */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden p-2 text-zinc-400 hover:text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-900 px-4 py-4">
          <nav className="flex flex-col gap-4 text-lg">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-red-500">Главная</Link>
            <Link to="/movies" onClick={() => setIsMenuOpen(false)} className="hover:text-red-500">Фильмы</Link>
            {user && <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="hover:text-red-500">Профиль</Link>}
            {isAdmin && (
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-red-400 hover:text-red-500 font-semibold">
                Админ-панель
              </Link>
            )}

            <div className="pt-4 border-t border-zinc-800">
              {user ? (
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-red-600/20 rounded-xl"
                >
                  <LogOut size={18} /> Выйти
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-center py-3 border border-zinc-700 rounded-xl">Войти</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="text-center py-3 bg-red-600 rounded-xl">Регистрация</Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}