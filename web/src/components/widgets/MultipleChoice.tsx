// src/components/widgets/MultipleChoice.tsx

type AnswerState = { status: 'unanswered' | 'correct' | 'incorrect'; message: string };

type Props = {
  prompt: string;
  options: number[];
  answerState: AnswerState;
  onChoice: (index: number) => void;
  onNext: () => void;
};

export default function MultipleChoice({ prompt, options, answerState, onChoice, onNext }: Props) {
  const isAnswered = answerState.status !== 'unanswered';

  return (
    <div>
      <h3>{prompt}</h3>
      <div style={{ display: 'grid', gap: 8, maxWidth: 300 }}>
        {options.map((op, i) => (
          <button
            key={i}
            onClick={() => onChoice(i)}
            disabled={isAnswered}
          >
            {op}
          </button>
        ))}
      </div>

      {isAnswered && (
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