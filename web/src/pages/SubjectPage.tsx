import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Topic { id_topic: number; name: string; }

export default function SubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    fetch(`http://localhost:4000/api/student/subject/${subjectId}/topics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setTopics(data));
  }, [subjectId, token]);

  return (
    <div className="p-8 w-full">
      <header className="flex items-center mb-10">
        <button onClick={() => navigate(-1)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg mr-6">
          ← Volver
        </button>
        <h1 className="text-4xl font-bold text-white">Temas</h1>
      </header>
      <div className="space-y-4">
        {topics.map(topic => (
          <Link key={topic.id_topic} to={`/topic/${topic.id_topic}`} className="block">
            <div className="bg-gray-700 p-5 rounded-lg text-white text-xl hover:bg-gray-600 transition-colors">
              {topic.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}