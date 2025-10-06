import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
// Asumiremos que crearemos un componente ClassCard en el futuro
// import ClassCard from '../components/ClassCard'; 

interface TeacherClass {
    subject_name: string;
    grade_name: string;
    grade_id: number;
}
interface TeacherData {
    fullName: string;
    classes: TeacherClass[];
}

export default function TeacherDashboardPage() {
    const { token, logout } = useAuth();
    const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        fetch('http://localhost:4000/api/teacher/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => { throw new Error(err.error || 'Error del servidor') });
            }
            return res.json();
        })
        .then(data => {
            setTeacherData(data);
            setIsLoading(false);
        })
        .catch(err => {
            setError(err.message);
            setIsLoading(false);
        });
    }, [token]);

    if (isLoading) return <div className="p-8 text-white">Cargando panel del maestro...</div>;
    if (error) return <div className="p-8 text-red-400">Error: {error}</div>;

    return (
        <div className="p-8 w-full">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-cyan-400">Panel del Maestro</h1>
                    <p className="text-xl text-gray-300">{teacherData?.fullName}</p>
                </div>
                <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                    Salir
                </button>
            </header>

            <main>
                <h2 className="text-3xl font-semibold text-white mb-6">Mis Clases</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teacherData?.classes.map(cls => (
                        // En el futuro, podríamos hacer que esta tarjeta sea un enlace a un resumen de la clase
                        <div key={cls.grade_id} className="bg-gray-700 p-6 rounded-xl shadow-lg">
                            <h3 className="text-2xl font-bold text-white">{cls.subject_name}</h3>
                            <p className="text-lg text-gray-300">{cls.grade_name}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}