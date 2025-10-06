import { randInt, shuffle } from '../rng';

export type StepId =
  | 'units' | 'tens' | 'hunds'
  | 'thous' | 'tenThous' | 'hundThous'
  | 'millions';

export type MixedItem =
  | { kind: 'horizontal-mcq'; a: number; b: number; options: number[]; correctIndex: number; difficulty?: string }
  | { kind: 'horizontal-input'; operands: number[]; answer: number; difficulty?: string }
  | {
      kind: 'column-steps';
      a: number;
      b: number;
      steps: Array<{ id: StepId; expected: number }>;
      result: number;
      difficulty?: string;
    };


export function buildSumMixed(outline: any): { items: MixedItem[]; targetCount: number; perQuestion: number } {
  const targetCount: number = outline?.scoring?.target_count ?? 10;
  const perQuestion: number = outline?.scoring?.per_question ?? 10;

  const plan = outline.block_plan as any[];
  const order: any[] = [];
  for (const blk of plan) {
    for (let i = 0; i < (blk.count ?? 1); i++) order.push(blk);
  }
  if (outline?.ui_hints?.shuffle_order) shuffle(order);

  const items: MixedItem[] = order.slice(0, targetCount).map((blk) => genFromBlock(blk));
  return { items, targetCount, perQuestion };
}

function genFromBlock(blk: any): MixedItem {
  const c = blk.constraints ?? {};
  const ops = c.operands ?? 2;
  const min = c.min_value ?? 0;
  const max = c.max_value ?? 20;
  const allowCarry = !!c.allow_carry;

  if (blk.type_code === 'multiple_choice') {
    // 2 operandos (o más) pero mostramos a+b para lo básico
    let operands = new Array(ops).fill(0).map(() => randInt(min, max));
    // si no se permiten llevadas, fuerza unidades sin carry
    if (!allowCarry && ops === 2) {
      while ((operands[0] % 10) + (operands[1] % 10) >= 10) {
        operands = [randInt(min, max), randInt(min, max)];
      }
    }
    const answer = operands.reduce((a: number, b: number) => a + b, 0);
    const distract = blk.distractors ?? { count: 3, range: 3 };
    const set = new Set<number>([answer]);
    while (set.size < (distract.count + 1)) set.add(answer + randInt(-distract.range, distract.range));
    const options = shuffle(Array.from(set));
    return {
      kind: 'horizontal-mcq',
      a: operands[0],
      b: operands[1],
      options,
      correctIndex: options.indexOf(answer),
      difficulty: blk.difficulty,
    };
  }

  if (blk.type_code === 'number_input') {
    const operands = new Array(ops).fill(0).map(() => randInt(min, max));
    const answer = operands.reduce((a: number, b: number) => a + b, 0);
    return { kind: 'horizontal-input', operands, answer, difficulty: blk.difficulty };
  }

  // guided_steps (suma en columna 2 operandos, con pasos)
  const a = randInt(min, max);
  const b = randInt(min, max);
  const { result, steps } = sumColumnSteps(a, b);
  return {
    kind: 'column-steps',
    a,
    b,
    steps,
    result,
    difficulty: blk.difficulty,
  };
}

function sumColumnSteps(a: number, b: number) {
  const names: StepId[] = ['units','tens','hunds','thous','tenThous','hundThous','millions'];
  const maxDigits = Math.max(a.toString().length, b.toString().length);

  const steps: Array<{ id: StepId; expected: number }> = [];
  let carry = 0;
  let factor = 1;
  let result = 0;

  for (let i = 0; i < maxDigits; i++) {
    const id = names[i];
    const da = Math.floor(a / factor) % 10;
    const db = Math.floor(b / factor) % 10;
    const sum = da + db + carry;
    const digit = sum % 10;
    carry = Math.floor(sum / 10);
    steps.push({ id, expected: digit });
    result += digit * factor;
    factor *= 10;
  }

  if (carry > 0) {
    steps.push({ id: names[maxDigits], expected: carry }); // p. ej. 'thous' = 1
    result += carry * factor;
  }

  return { result, steps };
}

