import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Subtopic { id_subtopic: number; name: string; }

export default function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);

  useEffect(() => {
    fetch(`http://localhost:4000/api/student/topic/${topicId}/subtopics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setSubtopics(data));
  }, [topicId, token]);

  return (
    <div className="p-8 w-full">
      <header className="flex items-center mb-10">
        <button onClick={() => navigate(-1)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg mr-6">
          ← Volver
        </button>
        <h1 className="text-4xl font-bold text-white">Subtemas</h1>
      </header>
      <div className="space-y-4">
        {subtopics.map(subtopic => (
          <Link key={subtopic.id_subtopic} to={`/practice/${subtopic.id_subtopic}`} className="block">
            <div className="bg-gray-700 p-5 rounded-lg text-white text-xl hover:bg-gray-600 transition-colors">
              {subtopic.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}