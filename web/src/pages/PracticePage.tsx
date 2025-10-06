import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Runner from '../components/Runner';

export default function PracticePage() {
  const { subtopicId } = useParams();
  const navigate = useNavigate();

  // 👇 NUEVO estado para saber si la práctica ha terminado
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  if (!subtopicId) return <div>Subtema no especificado.</div>;

  const handleGoBack = () => {
    navigate(-1); // Navega a la página anterior
  };

  // 👇 Si la práctica está completada, mostramos el mensaje final
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-4 w-full">
        <div className="bg-gray-700 p-8 rounded-lg shadow-xl text-center">
          <h1 className="text-4xl font-bold text-green-400 mb-4">¡Práctica completada!</h1>
          <p className="text-xl mb-6">Tu puntuación fue: <span className="font-bold">{finalScore}/100</span></p>
          <button 
            onClick={handleGoBack}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Volver a los temas
          </button>
        </div>
      </div>
    );
  }

  // 👇 Si no, mostramos el Runner
  return (
    // 👇 Y también aquí
    <div className="flex flex-col items-center min-h-screen bg-gray-800 text-white p-8 w-full">
      <h1 className="text-5xl font-bold mb-8">Práctica</h1>
      <Runner
        idSubtopic={Number(subtopicId)}
        onComplete={(score) => {
          setFinalScore(score);
          setIsCompleted(true);
        }}
      />
    </div>
  );
}