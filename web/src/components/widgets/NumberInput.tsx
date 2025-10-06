// src/components/widgets/NumberInput.tsx

import { useState } from 'react';

type AnswerState = { status: 'unanswered' | 'correct' | 'incorrect'; message: string };

type Props = {
  prompt: string;
  answerState: AnswerState;
  onSubmit: (val: number) => void; // Especificamos que 'val' es un número
  onNext: () => void;
};

export default function NumberInput({ prompt, answerState, onSubmit, onNext }: Props) {
  const [v, setV] = useState('');
  const isAnswered = answerState.status !== 'unanswered';

  return (
    <div>
      <h3>{prompt}</h3>
      <input
        value={v}
        onChange={e => setV(e.target.value)}
        type="number"
        disabled={isAnswered}
      />
      
      {!isAnswered ? (
        <button onClick={() => onSubmit(Number(v))}>Responder</button>
      ) : (
        <div style={{ marginTop: 20 }}>
          <h4 style={{ color: answerState.status === 'correct' ? 'green' : 'red' }}>
            {answerState.message}
          </h4>
          <button onClick={onNext}>Siguiente →</button>
        </div>
      )}
    </div>
  );
}