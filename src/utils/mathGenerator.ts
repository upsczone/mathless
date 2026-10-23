import { MathProblem } from '../types/game';

// Helper to generate a random integer between min and max (inclusive)
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMathProblem(level: number): MathProblem {
  const id = `prob_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let equation = '';
  let targetAnswer = 0;
  let operation: MathProblem['operation'] = '+';
  let hint = '';

  // Tier 1: Levels 1 - 2 (Simple Addition)
  if (level <= 2) {
    const a = randomInt(2, 12);
    const b = randomInt(2, 12);
    equation = `${a} + ${b} = ?`;
    targetAnswer = a + b;
    operation = '+';
    hint = 'Sum the two numbers';
  }
  // Tier 2: Levels 3 - 5 (Addition & Subtraction)
  else if (level <= 5) {
    const isSub = Math.random() > 0.5;
    if (isSub) {
      const a = randomInt(15, 50);
      const b = randomInt(3, a - 2);
      equation = `${a} - ${b} = ?`;
      targetAnswer = a - b;
      operation = '-';
      hint = 'Subtract the smaller number';
    } else {
      const a = randomInt(12, 35);
      const b = randomInt(8, 25);
      equation = `${a} + ${b} = ?`;
      targetAnswer = a + b;
      operation = '+';
      hint = 'Combine both values';
    }
  }
  // Tier 3: Levels 6 - 9 (Multiplication & Division)
  else if (level <= 9) {
    const isDiv = Math.random() > 0.5;
    if (isDiv) {
      const divisor = randomInt(2, 10);
      const quotient = randomInt(3, 12);
      const dividend = divisor * quotient;
      equation = `${dividend} ÷ ${divisor} = ?`;
      targetAnswer = quotient;
      operation = '÷';
      hint = `${dividend} shared into ${divisor} groups`;
    } else {
      const a = randomInt(3, 12);
      const b = randomInt(3, 12);
      equation = `${a} × ${b} = ?`;
      targetAnswer = a * b;
      operation = '×';
      hint = `Multiply ${a} by ${b}`;
    }
  }
  // Tier 4: Levels 10 - 14 (Mixed Operations / Order of Ops)
  else if (level <= 14) {
    const style = randomInt(1, 3);
    if (style === 1) {
      // a * b + c
      const a = randomInt(2, 9);
      const b = randomInt(2, 9);
      const c = randomInt(2, 15);
      equation = `${a} × ${b} + ${c} = ?`;
      targetAnswer = a * b + c;
      operation = 'mixed';
      hint = `Multiply first: ${a}×${b}=${a * b}, then add ${c}`;
    } else if (style === 2) {
      // a * b - c
      const a = randomInt(3, 9);
      const b = randomInt(3, 8);
      const c = randomInt(2, a * b - 3);
      equation = `${a} × ${b} - ${c} = ?`;
      targetAnswer = a * b - c;
      operation = 'mixed';
      hint = `Multiply first: ${a}×${b}=${a * b}, then subtract ${c}`;
    } else {
      // c + a * b
      const a = randomInt(2, 8);
      const b = randomInt(2, 8);
      const c = randomInt(5, 20);
      equation = `${c} + ${a} × ${b} = ?`;
      targetAnswer = c + a * b;
      operation = 'mixed';
      hint = `Remember PEMDAS: do multiplication before addition!`;
    }
  }
  // Tier 5: Levels 15 - 20 (Missing Operand Algebra)
  else if (level <= 20) {
    const isMult = Math.random() > 0.4;
    if (isMult) {
      const a = randomInt(4, 12);
      const b = randomInt(3, 12);
      const product = a * b;
      const hideFirst = Math.random() > 0.5;
      equation = hideFirst ? `? × ${b} = ${product}` : `${a} × ? = ${product}`;
      targetAnswer = hideFirst ? a : b;
      operation = '×';
      hint = `What times ${hideFirst ? b : a} equals ${product}?`;
    } else {
      const a = randomInt(20, 80);
      const b = randomInt(5, 30);
      const sum = a + b;
      const hideFirst = Math.random() > 0.5;
      equation = hideFirst ? `? + ${b} = ${sum}` : `${a} + ? = ${sum}`;
      targetAnswer = hideFirst ? a : b;
      operation = '+';
      hint = `Subtract from ${sum} to find the missing part`;
    }
  }
  // Tier 6: Levels 21 - 30 (Exponents, Powers & Larger Mental Math)
  else if (level <= 30) {
    const style = randomInt(1, 3);
    if (style === 1) {
      // Squares
      const n = randomInt(4, 16);
      equation = `${n}² = ?`;
      targetAnswer = n * n;
      operation = '×';
      hint = `${n} multiplied by itself`;
    } else if (style === 2) {
      // Two double digits mental addition
      const a = randomInt(25, 89);
      const b = randomInt(18, 79);
      equation = `${a} + ${b} = ?`;
      targetAnswer = a + b;
      operation = '+';
      hint = 'Break into tens and ones';
    } else {
      // Double digit multiplication
      const a = randomInt(11, 19);
      const b = randomInt(4, 8);
      equation = `${a} × ${b} = ?`;
      targetAnswer = a * b;
      operation = '×';
      hint = `(${a - a % 10} × ${b}) + (${a % 10} × ${b})`;
    }
  }
  // Tier 7: Level 31+ (Mastery / Speed Challenge)
  else {
    const a = randomInt(12, 25);
    const b = randomInt(6, 15);
    const c = randomInt(10, 50);
    equation = `${a} × ${b} - ${c} = ?`;
    targetAnswer = a * b - c;
    operation = 'mixed';
    hint = 'Rapid master computation!';
  }

  // Generate distinct distractors
  const optionSet = new Set<number>([targetAnswer]);
  // Total bubbles scales from 5 on early levels up to 7-8 on high levels
  const targetCount = Math.min(5 + Math.floor(level / 5), 8);

  // Plausible distractors
  const distractorsCandidates: number[] = [
    targetAnswer + 1,
    targetAnswer - 1,
    targetAnswer + 2,
    targetAnswer - 2,
    targetAnswer + 10,
    targetAnswer - 10,
    targetAnswer + 5,
    targetAnswer - 5,
  ];

  // Reversed digits if 2 digits (e.g. 54 -> 45)
  if (targetAnswer > 12 && targetAnswer < 100) {
    const tens = Math.floor(targetAnswer / 10);
    const ones = targetAnswer % 10;
    if (tens !== ones && ones !== 0) {
      distractorsCandidates.push(ones * 10 + tens);
    }
  }

  // Shuffle candidate distractors
  distractorsCandidates.sort(() => Math.random() - 0.5);

  for (const cand of distractorsCandidates) {
    if (cand > 0 && cand !== targetAnswer) {
      optionSet.add(cand);
      if (optionSet.size >= targetCount) break;
    }
  }

  // Fill remaining if needed
  let attempts = 0;
  while (optionSet.size < targetCount && attempts < 50) {
    attempts++;
    const delta = randomInt(-12, 12);
    const val = targetAnswer + delta;
    if (val > 0 && val !== targetAnswer) {
      optionSet.add(val);
    }
  }

  const options = Array.from(optionSet).sort(() => Math.random() - 0.5);

  return {
    id,
    equation,
    targetAnswer,
    options,
    operation,
    hint,
  };
}
