import { useEffect, useState, useRef } from 'react';
import { generateExercises, finishPractice } from '../api';
import MultipleChoice from './widgets/MultipleChoice';
import NumberInput from './widgets/NumberInput';
import SpatialRelations from './widgets/SpatialRelations';
import GuidedSteps from './widgets/GuidedSteps';
import type { MixedItem } from '../types';

type AnswerState = { status: 'unanswered' | 'correct' | 'incorrect'; message: string };

type RunnerProps = {
  idSubtopic: number;
  onComplete: (score: number) => void;
};

export default function Runner({ idSubtopic, onComplete }: RunnerProps) {
  const [items, setItems] = useState<MixedItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [answerState, setAnswerState] = useState<AnswerState>({ status: 'unanswered', message: '' });
  const [correct, setCorrect] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [pointsPossible, setPointsPossible] = useState(0);
  const t0 = useRef<number>(0);
  const [pointsPerQuestion, setPointsPerQuestion] = useState(10);
  const [preventiveHint, setPreventiveHint] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    generateExercises(idSubtopic)
      .then((exerciseSet) => {
        setItems(exerciseSet.items);
        setPointsPossible(exerciseSet.perQuestion * exerciseSet.targetCount);
        setPointsPerQuestion(exerciseSet.perQuestion);
        setIdx(0);
        setCorrect(0);
        setPointsEarned(0);
        setAnswerState({ status: 'unanswered', message: '' });
        t0.current = performance.now();
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error al generar ejercicios:", err);
        setIsLoading(false);
      });
  }, [idSubtopic]);

  useEffect(() => {
    // Cuando el ejercicio actual cambie...
    const currentItem = items[idx];
    setPreventiveHint(null); // Limpia cualquier consejo anterior

    // Si es un ejercicio de relaciones espaciales y tiene consejos preventivos...
    if (currentItem?.kind === 'spatial_relations' && currentItem.hints?.preventive?.length > 0) {
      const randomIndex = Math.floor(Math.random() * currentItem.hints.preventive.length);
      const hint = currentItem.hints.preventive[randomIndex];
      // Inicia un temporizador para mostrar el consejo después del tiempo especificado
      const timer = setTimeout(() => {
        setPreventiveHint(hint.text);
      }, (hint.delay_seconds ?? 15) * 1000);

      // Si el componente se "desmonta" (el niño responde antes), limpia el temporizador
      return () => clearTimeout(timer);
    }
}, [idx, items]);

  useEffect(() => {
    if (!isLoading && idx >= items.length && items.length > 0) {
      const t1 = performance.now();
      const elapsedSec = (t1 - t0.current) / 1000;
      const avg = elapsedSec / items.length;
      const score = pointsPossible > 0 ? Math.round((pointsEarned / pointsPossible) * 100) : 0;

      finishPractice({
        id_subtopic: idSubtopic,
        exercises_presented: items.length,
        correct,
        avg_time_sec: Number(avg.toFixed(2)),
        score,
      }).then(() => {
        onComplete(score);
      });
    }
  }, [idx, isLoading, items.length, correct, pointsEarned, pointsPossible, idSubtopic, onComplete]);

  function handleNext() {
    setAnswerState({ status: 'unanswered', message: '' });
    setIdx((i) => i + 1);
  }

  if (isLoading) return <div>Generando ejercicios…</div>;

  if (idx >= items.length) {
    if (items.length === 0) return <div>No se encontraron ejercicios para este tema.</div>;
    return null;
  }

  // 👇 ESTE ES EL BLOQUE DE CÓDIGO QUE FALTABA 👇
  const currentItem = items[idx];

  if (currentItem.kind === 'horizontal-mcq') {
    const prompt = `${currentItem.a} + ${currentItem.b} = ?`;
    return (
      <MultipleChoice
        prompt={prompt}
        options={currentItem.options}
        answerState={answerState}
        onChoice={(i) => {
          if (answerState.status !== 'unanswered') return;
          if (i === currentItem.correctIndex) {
            setPointsEarned(p => p + pointsPerQuestion);
            setAnswerState({ status: 'correct', message: '¡Correcto!' });
          } else {
            setAnswerState({ status: 'incorrect', message: `Incorrecto. La respuesta era ${currentItem.options[currentItem.correctIndex]}` });
          }
        }}
        onNext={handleNext}
      />
    );
  }

  if (currentItem.kind === 'horizontal-input') {
    const prompt = `${currentItem.operands.join(' + ')} = ?`;
    return (
      <NumberInput
        prompt={prompt}
        answerState={answerState}
        onSubmit={(v) => {
          if (answerState.status !== 'unanswered') return;
          if (v === currentItem.answer) {
            setPointsEarned(p => p + pointsPerQuestion);
            setAnswerState({ status: 'correct', message: '¡Muy bien!' });
          } else {
            setAnswerState({ status: 'incorrect', message: `La respuesta correcta es ${currentItem.answer}` });
          }
        }}
        onNext={handleNext}
      />
    );
  }

  if (currentItem.kind === 'column-steps') {
    return (
      <GuidedSteps
        a={currentItem.a}
        b={currentItem.b}
        steps={currentItem.steps}
        onFinish={(earned, _possible, _issues) => {
          setPointsEarned(p => p + earned);
          handleNext();
        }}
      />
    );
  }

    // BLOQUE ACTUALIZADO
if (currentItem.kind === 'spatial_relations') {
    return (
      <SpatialRelations
        item={currentItem}
        answerState={answerState}
        preventiveHint={preventiveHint} // <-- 1. Pasamos el consejo preventivo
        onAnswer={(selectedObjectId) => {
          if (answerState.status !== 'unanswered') return;
          
          setPreventiveHint(null); // <-- 2. Ocultamos el consejo preventivo al responder

          if (selectedObjectId === currentItem.correctObjectId) {
            setCorrect(c => c + 1); // No olvides sumar al contador de correctas
            setPointsEarned(p => p + pointsPerQuestion);
            setAnswerState({ status: 'correct', message: '¡Excelente!' });
          } else {
            // --- 3. Lógica para el consejo correctivo ---
            const correctObject = currentItem.sceneObjects.find(obj => obj.id === currentItem.correctObjectId);
            const errorKey = `${correctObject?.position_key.replace(' ', '_')}_error`; // ej: 'adelante_error'
            const correctiveHints = currentItem.hints.corrective[errorKey];
            const message = correctiveHints?.[0] || 'Inténtalo de nuevo.'; // Mensaje de fallback
            setAnswerState({ status: 'incorrect', message: message });
          }
        }}
        onNext={handleNext}
      />
    );
}

  return <div>Error: Tipo de ejercicio no reconocido.</div>;
}