// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importamos TODAS las páginas que vamos a usar
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SubjectPage from './pages/SubjectPage';
import TopicPage from './pages/TopicPage';
import PracticePage from './pages/PracticePage';
import { useAuth } from './contexts/AuthContext';


function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth(); // <-- Escucha el estado del contexto

  // Mientras se verifica el token inicial, no mostramos nada
  if (isLoading) {
    return <div>Verificando sesión...</div>;
  }

  return token ? <>{children}</> : <Navigate to="/" />;
}

export default function App() {
  return (
    <div className="w-full min-h-screen bg-slate-900 text-white">
      <BrowserRouter>
        <Routes>
          {/* La ruta del Login no necesita ser privada */}
          <Route path="/" element={<LoginPage />} />

          {/* Todas las demás rutas están protegidas por PrivateRoute */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/subject/:subjectId" element={<PrivateRoute><SubjectPage /></PrivateRoute>} />
          <Route path="/topic/:topicId" element={<PrivateRoute><TopicPage /></PrivateRoute>} />
          <Route path="/practice/:subtopicId" element={<PrivateRoute><PracticePage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}