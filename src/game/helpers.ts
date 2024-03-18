export const randomNumbers = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10) + 1);

export const evaluatePolishNotation = (expression: string) => {
  const tokens: string[] =
    expression.match(/\(|\)|\+|\-|\*|\/|\d+/g)?.reverse() ?? [];

  const parse = (): number => {
    const token = tokens.pop() ?? "";
    switch (token) {
      case "+":
        return parse() + parse();
      case "-":
        return parse() - parse();
      case "*":
        return parse() * parse();
      case "/":
        return parse() / parse();
      default:
        return Number.parseInt(token, 10);
    }
  };

  return parse();
};

export const encodeCaesarCipher = (text: string, shift: number) => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const shifted = alphabet.slice(shift) + alphabet.slice(0, shift);
  const cipher = (char: string) => {
    const isUpper = char.match(/[A-Z]/);
    const index = alphabet.indexOf(char.toLowerCase());
    if (index === -1) {
      return char;
    }
    return isUpper ? shifted[index].toUpperCase() : shifted[index];
  };
  return text.split("").map(cipher).join("");
};

export const decodeCaesarCipher = (text: string, shift: number) => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const shifted = alphabet.slice(shift) + alphabet.slice(0, shift);
  const cipher = (char: string) => {
    const isUpper = char.match(/[A-Z]/);
    const index = shifted.indexOf(char.toLowerCase());
    if (index === -1) {
      return char;
    }
    return isUpper ? alphabet[index].toUpperCase() : alphabet[index];
  };
  return text.split("").map(cipher).join("");
};

const morseSymbols = {
  ".-": "a",
  "-...": "b",
  "-.-.": "c",
  "-..": "d",
  ".": "e",
  "..-.": "f",
  "--.": "g",
  "....": "h",
  "..": "i",
  ".---": "j",
  "-.-": "k",
  ".-..": "l",
  "--": "m",
  "-.": "n",
  "---": "o",
  ".--.": "p",
  "--.-": "q",
  ".-.": "r",
  "...": "s",
  "-": "t",
  "..-": "u",
  "...-": "v",
  ".--": "w",
  "-..-": "x",
  "-.--": "y",
  "--..": "z",
  "   ": " ",
};

type MorseSymbols = keyof typeof morseSymbols;

const morseSymbolsReversed = Object.fromEntries(
  Object.entries(morseSymbols).map(([key, value]) => [value, key])
);

export const decodeMorse = (morseText: string) => {
  const decoded = morseText.replace(/([.-]+|\s+)/g, (match) => {
    return match === " " ? "" : morseSymbols?.[match as MorseSymbols] || match;
  });
  return decoded;
};

export const encodeMorse = (text: string) => {
  const encoded = text.replace(/[a-z]|\s+/gi, (char) => {
    return char === " "
      ? "  "
      : `${morseSymbolsReversed[char.toLowerCase()] || char} `;
  });

  return encoded.trim();
};

const sumOfSquares = (number: number): number => {
  let sum = 0;
  let next = number;
  while (next > 0) {
    const digit = next % 10; // Extract the last digit
    sum += digit * digit; // Add the square of the digit to the sum
    next = Math.floor(next / 10); // Remove the last digit from n
  }
  return sum;
};

export const isHappy = (n: number): boolean => {
  let slow = n;
  let fast = sumOfSquares(n);

  while (fast !== 1 && slow !== fast) {
    slow = sumOfSquares(slow); // Move slow pointer one step
    fast = sumOfSquares(sumOfSquares(fast)); // Move fast pointer two steps
  }

  return fast === 1; // If fast pointer reaches 1, the number is happy
};

export const generateHappyNumbers = (count: number): number[] => {
  const happyNumbers = [];
  let number = 1;
  while (happyNumbers.length < count) {
    if (isHappy(number)) {
      happyNumbers.push(number);
    }
    number++;
  }
  return happyNumbers;
};

export const generateUnhappyNumbers = (count: number): number[] => {
  const unhappyNumbers = [];
  let number = 1;
  while (unhappyNumbers.length < count) {
    if (!isHappy(number)) {
      unhappyNumbers.push(number);
    }
    number++;
  }
  return unhappyNumbers;
};
