import { useMemo, useState } from 'react';

type StepId = 'units'|'tens'|'hunds'|'thous'|'tenThous'|'hundThous'|'millions';
type Step = { id: StepId; expected: number };

const niceLabel: Record<StepId,string> = {
  units: 'Unidades',
  tens: 'Decenas',
  hunds: 'Centenas',
  thous: 'Unidades de millar',
  tenThous: 'Decenas de millar',
  hundThous: 'Centenas de millar',
  millions: 'Millones',
};

export default function GuidedSteps({
  a, b, steps,
  perStepScore = { units:3, tens:3, hunds:4, thous:2, tenThous:2, hundThous:2, millions:2 },
  onFinish
}: {
  a: number; b: number; steps: Step[];
  perStepScore?: Partial<Record<StepId, number>>;
  onFinish: (earned: number, possible: number, issues: {issue_key:string, attempts:number, errors:number}[]) => void;
}) {
  // make a stable list of visible columns (solo las que vienen en steps)
  const cols = useMemo(() => steps.map(s => s.id), [steps]);
  const [values, setValues] = useState<Record<StepId, string>>({} as any);
  const [attempts, setAttempts] = useState(0);

  const possible = cols.reduce((acc, id) => acc + (perStepScore[id] ?? 0), 0);

  function submit() {
    let earned = 0;
    let errors = 0;
    const issues: {issue_key:string, attempts:number, errors:number}[] = [];

    for (const s of steps) {
      const raw = values[s.id];
      const num = Number(raw);
      const ok = Number.isFinite(num) && num === s.expected;
      if (ok) {
        earned += (perStepScore[s.id] ?? 0);
      } else {
        errors++;
        // mapeo simple de issue por columna
        const issueKey =
          s.id === 'units' ? 'units_sum' :
          s.id === 'tens'  ? 'tens_sum'  :
          s.id === 'hunds' ? 'hundreds_sum' :
          s.id === 'thous' ? 'thousands_sum' : 'higher_col_sum';
        issues.push({ issue_key: issueKey, attempts: attempts + 1, errors: 1 });
      }
    }

    setAttempts(attempts + 1);
    onFinish(earned, possible, issues);
  }

  return (
    <div>
      <h3>{a} + {b} (suma en columnas)</h3>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: 12, maxWidth: 600 }}>
        {steps.map((s) => (
          <div key={s.id} style={{ display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
            <label style={{ fontSize: 12, opacity: .8 }}>{niceLabel[s.id] ?? s.id}</label>
            <input
              type="number"
              inputMode="numeric"
              value={values[s.id] ?? ''}
              onChange={e => setValues(v => ({ ...v, [s.id]: e.target.value }))}
              style={{ width: 80 }}
              placeholder="?"
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={submit}>Validar todos los pasos</button>
      </div>
    </div>
  );
}
