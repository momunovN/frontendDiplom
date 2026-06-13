import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children, adminOnly = false }) {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);

  if (adminOnly && user.role !== 'admin') {
    alert("У вас нет прав доступа к админ-панели");
    return <Navigate to="/profile" replace />;
  }

  return children;
}