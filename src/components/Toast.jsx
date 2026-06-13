import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl text-white flex items-center gap-3 z-50
      ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-xl leading-none">×</button>
    </div>
  );
}