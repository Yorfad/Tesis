import { useState, useEffect } from 'react';
import type { SpatialItem } from '../../types';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import Sprite from './Sprite';
import { useResponsiveScale } from '../../hooks/useResponsiveScale';

type AnswerState = { status: 'unanswered' | 'correct' | 'incorrect'; message: string };
type Props = {
  item: SpatialItem;
  answerState: AnswerState;
  onAnswer: (objectId: string) => void;
  onNext: () => void;
  preventiveHint: string | null;
};

export default function SpatialRelations({ item, answerState, onAnswer, onNext, preventiveHint }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isAnswered = answerState.status !== 'unanswered';
  const speak = useSpeechSynthesis();
  const scale = useResponsiveScale();
  // 👇 HEMOS ELIMINADO LOS DOS useEffect QUE REPRODUCÍAN EL AUDIO AUTOMÁTICAMENTE

    useEffect(() => {
    // Limpiamos la selección anterior para empezar el nuevo ejercicio de cero.
    setSelectedId(null);
  }, [item]);
  
  return (
    <div className="flex flex-col items-center w-full max-w-2xl relative">
      {/* Consejo Preventivo (ahora con su propio botón de audio) */}
      {preventiveHint && (
        <div className="absolute -top-20 bg-yellow-200 text-yellow-800 p-3 rounded-lg shadow-lg flex items-center">
          <p className="font-semibold mr-2">{preventiveHint}</p>
          <button onClick={() => speak(preventiveHint)} className="text-xl">🔊</button>
        </div>
      )}
      
      {/* Pregunta */}
      <div className="flex items-center mb-8">
        <h3 className="text-3xl font-semibold text-center">{item.prompt}</h3>
        <button onClick={() => speak(item.prompt)} className="ml-4 text-3xl">🔊</button>
      </div>

      {/* Escenario */}
      <div className="flex justify-center items-center gap-5 my-5 p-5 bg-gray-700 rounded-2xl w-full">
        {item.sceneObjects.map(obj => (
          <div
            key={obj.id}
            onClick={() => !isAnswered && setSelectedId(obj.id)}
            className={`p-3 rounded-lg transition-all duration-300 ${!isAnswered ? 'cursor-pointer hover:bg-cyan-600' : ''} ${selectedId === obj.id ? 'bg-cyan-600' : ''} ${isAnswered && obj.id === item.correctObjectId ? 'bg-green-500' : ''}`}
          >
            <Sprite name={obj.sprite_name}   
            scale={scale} 
            className="transform -scale-x-100"/>
          </div>
        ))}
      </div>

      {/* Botón de Respuesta y Feedback */}
      <div className="mt-6 h-24">
        {!isAnswered ? (
          <button onClick={() => onAnswer(selectedId || '')} disabled={!selectedId} className="px-10 py-4 text-xl font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed">
            Responder
          </button>
        ) : (
          <div className="text-center">
            <h4 className={`text-2xl font-bold mb-4 flex items-center ${answerState.status === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
              {answerState.message}
              <button onClick={() => speak(answerState.message)} className="ml-3 text-2xl">🔊</button>
            </h4>
            <button onClick={onNext} className="px-10 py-4 text-xl font-bold text-white bg-gray-600 rounded-lg hover:bg-gray-500">
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}