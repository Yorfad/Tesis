import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Subject { id_subject: number; name: string; }
interface DashboardData { fullName: string; gradeName: string; subjects: Subject[]; }

export default function DashboardPage() {
  const { token, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/student/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setDashboardData(data))
      .catch(async err => setError(await err.text() || 'Error al cargar datos'));
  }, [token]);

  if (error) return <div className="text-red-400 p-8">{error}</div>;
  if (!dashboardData) return <div className="text-white p-8">Cargando dashboard...</div>;

  return (
    <div className="p-8 w-full">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-cyan-400">¡Hola, {dashboardData.fullName}!</h1>
          <p className="text-xl text-gray-300">{dashboardData.gradeName}</p>
        </div>
        <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
          Salir
        </button>
      </header>
      
      <main>
        <h2 className="text-3xl font-semibold text-white mb-6">Mis Materias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardData.subjects.map((subject) => (
            <Link key={subject.id_subject} to={`/subject/${subject.id_subject}`} className="block">
              <div className="bg-gray-700 p-6 rounded-xl shadow-lg hover:bg-gray-600 hover:scale-105 transition-transform duration-300">
                <h3 className="text-2xl font-bold text-white">{subject.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}