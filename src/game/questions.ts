import {
  decodeMorse,
  encodeCaesarCipher,
  encodeMorse,
  evaluatePolishNotation,
  randomNumbers,
  generateHappyNumbers,
  generateUnhappyNumbers,
} from "./helpers";

// Make an inferred type for the question object
// It can be any thing

export interface Question<T> {
  randomInput: () => T;
  question: (input: T) => string;
  correctAnswer: (answer: string, input: T) => boolean;
  points: number;
  hint?: string;
}

interface RandomWordQuestion extends Question<string> {}

export const uppercase: RandomWordQuestion = {
  randomInput: () =>
    ["cheeseburger", "hotdog", "capitalize", "javascript"].sort(
      () => Math.random() - 0.5
    )[0],
  question: (randomWord: string) => `Capitalize the word: ${randomWord}`,
  correctAnswer: (answer: string, randomWord: string) =>
    randomWord.toUpperCase() === answer,
  points: 2,
  hint: "https://en.wikipedia.org/wiki/Letter_case",
};

export const lowercase: RandomWordQuestion = {
  randomInput: () =>
    ["Cheeseburger", "Hotdog", "Capitalize", "JavaScript"].sort(
      () => Math.random() - 0.5
    )[0],
  question: (randomWord: string) => `Lowercase the word: ${randomWord}`,
  correctAnswer: (answer: string, randomWord: string) =>
    randomWord.toLowerCase() === answer,
  points: 2,
  hint: "https://en.wikipedia.org/wiki/Letter_case",
};

export const mostCommonLetter: RandomWordQuestion = {
  randomInput: () =>
    ["cheeseburger", "hotdog", "capitalize", "javascript"].sort(
      () => Math.random() - 0.5
    )[0],
  question: (randomWord: string) =>
    `What is the most common letter in the word: ${randomWord}`,
  correctAnswer: (answer: string, randomWord: string) => {
    // Could be multiple correct answers if there are multiple letters with the same frequency
    const letters = randomWord.split("");
    const frequencies = letters.reduce((acc, letter) => {
      acc[letter] = (acc[letter] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostCommon = Object.entries(frequencies).sort(
      ([, a], [, b]) => b - a
    );
    const mostCommonLetters = mostCommon.filter(
      ([, frequency]) => frequency === mostCommon[0][1]
    );

    return mostCommonLetters.map(([letter]) => letter).includes(answer);
  },
  points: 4,
};

export const vowels: RandomWordQuestion = {
  randomInput: () =>
    ["cheeseburger", "hotdog", "capitalize", "javascript"].sort(
      () => Math.random() - 0.5
    )[0],
  question: (randomWord) => `How many vowels are in the word: ${randomWord}`,
  correctAnswer: (answer, randomWord) => {
    const vowels = randomWord.match(/[aeiou]/gi);
    return vowels?.length.toString() === answer;
  },
  points: 4,
  hint: "a e i o u y",
};

export const consonants: RandomWordQuestion = {
  randomInput: () =>
    ["cheeseburger", "hotdog", "capitalize", "javascript"].sort(
      () => Math.random() - 0.5
    )[0],
  question: (randomWord) =>
    `How many consonants are in the word: ${randomWord}`,
  correctAnswer: (answer, randomWord) => {
    const consonants = randomWord.match(/[^aeiou]/gi);
    return consonants?.length.toString() === answer;
  },
  points: 4,
  hint: "b c d f g h j k l m n p q r s t v w x z",
};

export const numeronym: RandomWordQuestion = {
  randomInput: () =>
    [
      "accessibility",
      "javascript",
      "internationalization",
      "hyperlink",
      "webpage",
      "kubernetes",
      "pseudopseudohypoparathyroidism",
    ].sort(() => Math.random() - 0.5)[0],
  question: (randomWord) =>
    `What is the numerical contraction numeronym (e.g. accessibility -> a11y) for: ${randomWord}`,
  correctAnswer: (answer, randomWord) => {
    const abbreviation =
      randomWord[0] + (randomWord.length - 2) + randomWord.slice(-1);
    return abbreviation === answer;
  },
  points: 4,
  hint: "https://en.wikipedia.org/wiki/Numeronym#Numerical_contractions",
};

export const binaryToDecimal: RandomWordQuestion = {
  randomInput: () => {
    const binary = Math.floor(Math.random() * 256).toString(2);
    return binary;
  },
  question: (binary) =>
    `What is the decimal value of the binary number: ${binary}`,
  correctAnswer: (answer, binary) => {
    return Number.parseInt(binary, 2).toString() === answer;
  },
  points: 2,
  hint: "https://en.wikipedia.org/wiki/Binary_number",
};

interface WordListQuestion extends Question<string[]> {}

export const palindromes: WordListQuestion = {
  randomInput: () => {
    return [
      [
        "racecar",
        "quizzify",
        "kayak",
        "flibbertigibbet",
        "rotator",
        "gobbledygook",
      ],
      ["madam", "snollygoster", "civic", "bamboozle", "level", "kerfuffle"],
      ["deified", "hullabaloo", "bob", "whippersnapper", "refer", "flummox"],
    ].sort(() => Math.random() - 0.5)[0];
  },
  question: (wordList: string[]) =>
    `Which of these words are a palindrome (comma separated answer): ${wordList.join(
      ", "
    )}`,
  correctAnswer: (answer: string, wordList: string[]) => {
    const answers = answer.split(",").map((word) => word.trim());
    const palindomes = wordList.filter(
      (word) => word === word.split("").reverse().join("")
    );
    // All answers must be in the list of palindromes, and all palindromes must be in the list of answers
    return (
      answers.every((word) => palindomes.includes(word)) &&
      palindomes.every((word) => answers.includes(word))
    );
  },
  points: 5,
  hint: "https://en.wikipedia.org/wiki/Palindrome",
};

export const heterograms: WordListQuestion = {
  randomInput: () => {
    return [
      [
        "background",
        "palindrome",
        "cipher",
        "repeater",
        "juxtapose",
        "assessment",
      ],
      [
        "authorizes",
        "moonwalker",
        "brightside",
        "bookkeeper",
        "mystique",
        "subdermatoglyphic",
      ],
      [
        "computing",
        "rendezvous",
        "fjord",
        "encyclopedia",
        "sphinx",
        "mississippi",
      ],
      [
        "puzzling",
        "algorithm",
        "vortex",
        "philosopher",
        "gymnast",
        "parallelogram",
      ],
    ].sort(() => Math.random() - 0.5)[0];
  },
  question: (wordList: string[]) =>
    `Which of these words are heterograms (comma separated answer): ${wordList.join(
      ", "
    )}`,
  correctAnswer: (answer: string, wordList: string[]) => {
    const answers = answer.split(",").map((word) => word.trim());
    const heterograms = wordList.filter(
      (word) => new Set(word).size === word.length
    );
    return (
      answers.every((word) => heterograms.includes(word)) &&
      heterograms.every((word) => answers.includes(word))
    );
  },
  points: 5,
  hint: "https://en.wikipedia.org/wiki/Heterogram_(literature)",
};

interface MissingNumberQuestion extends Question<[number[], number]> {}

export const missingNumber: MissingNumberQuestion = {
  // Random between 1 and 100
  randomInput: () => {
    // Generate a sequence of 9 consecutive numbers, remove one and return the sequence and the missing number
    const missing = Math.floor(Math.random() * 9) + 1;
    const numbers = Array.from({ length: 9 }, (_, i) => i + 1).filter(
      (number) => number !== missing
    );
    return [numbers, missing];
  },
  question: ([numbers, missing]: [number[], number]) => {
    const question = numbers
      .map((number) => (number === missing ? "?" : number))
      .join(", ");
    return `What number is missing from the sequence: ${question}`;
  },
  correctAnswer: (answer: string, [numbers, missing]: [number[], number]) => {
    return answer === missing.toString();
  },
  points: 5,
};

interface TwoNumberQuestion extends Question<[number, number]> {}

export const addTwo: TwoNumberQuestion = {
  // Random between 1 and 100
  randomInput: () => [
    Math.floor(Math.random() * 100) + 1,
    Math.floor(Math.random() * 100) + 1,
  ],
  question: ([a, b]: [number, number]) => `Calculate the sum of: + ${a} ${b}`,
  correctAnswer: (answer: string, [a, b]: [number, number]) => {
    return answer === (a + b).toString();
  },
  points: 5,
  hint: "https://en.wikipedia.org/wiki/Polish_notation",
};

export const subtractTwo: TwoNumberQuestion = {
  // Random between 1 and 100
  randomInput: () => [
    Math.floor(Math.random() * 100) + 1,
    Math.floor(Math.random() * 100) + 1,
  ],
  question: ([a, b]: [number, number]) =>
    `Calculate the difference (prefix polish notation) of: - ${a} ${b}`,
  correctAnswer: (answer: string, [a, b]: [number, number]) => {
    return answer === (a - b).toString();
  },
  points: 5,
  hint: "https://en.wikipedia.org/wiki/Polish_notation",
};

export const runLengthEncoding: RandomWordQuestion = {
  randomInput: () =>
    [
      "aaaaabbbbccccddddeee",
      "ssssuuuuuuppppppeeeerrrrr",
      "lllliiiiinnnneeee",
      "ttttrrrraaaaiiiinnnn",
      "pppaaappppeeerrrr",
      "mmmmooooonnnnlllliiiggghhhtttt",
      "fffflllliiiigggghhhtttt",
      "ccccoooommmpppuuutttteeerrr",
      "ppprrrooogggrrraaammmmmiiinnngggg",
      "bbbbbaaaallllllooooonnnn",
    ].sort(() => Math.random() - 0.5)[0],
  question: (randomWord) =>
    `What is the run length encoding (e.g. aabbc -> a2b2c1) of: ${randomWord}`,
  correctAnswer: (answer, randomWord) => {
    // Match single characters not followed by the same character and count them as 1
    const encoded = randomWord.replace(/(.)\1*/g, (match, char) => {
      return `${char}${match.length}`;
    });
    return encoded === answer;
  },
  points: 10,
  hint: "https://en.wikipedia.org/wiki/Run-length_encoding",
};

export const morseCodeDecoder: RandomWordQuestion = {
  randomInput: () =>
    encodeMorse(
      [
        "debug the code",
        "commit the changes",
        "push to repository",
        "pull request review",
        "merge conflict resolution",
        "deploy to production",
        "roll back deployment",
        "continuous integration pipeline",
        "write unit tests",
        "refactor the legacy",
      ].sort(() => Math.random() - 0.5)[0]
    ),
  question: (randomMorseCode) =>
    `What is the decoded message from morse code (3 spaces = space): ${randomMorseCode}`,
  correctAnswer: (answer, randomMorseCode) => {
    return answer === decodeMorse(randomMorseCode);
  },
  points: 10,
  hint: "https://en.wikipedia.org/wiki/Morse_code",
};

interface MultiplyMultipleNumbersQuestion extends Question<number[]> {}

export const multiplyMultipleNumbers: MultiplyMultipleNumbersQuestion = {
  // Random between 1 and 10
  randomInput: () => randomNumbers(Math.floor(Math.random() * 5) + 1),
  question: (numbers: number[]) =>
    `Calculate the product (prefix polish notation) of: ${"* "
      .repeat(numbers.length - 1)
      .trim()} ${numbers.join(" ")}`,
  correctAnswer: (answer: string, numbers: number[]) => {
    return answer === numbers.reduce((acc, num) => acc * num, 1).toString();
  },
  points: 10,
  hint: "https://en.wikipedia.org/wiki/Polish_notation",
};

export const maximumProductOfTwoNumbers: MultiplyMultipleNumbersQuestion = {
  // Random between 1 and 10
  randomInput: () => randomNumbers(4),
  question: (numbers: number[]) =>
    `What is the maximum product of two numbers from the list: ${numbers.join(
      ", "
    )}`,
  correctAnswer: (answer: string, numbers: number[]) => {
    const sorted = numbers.sort((a, b) => b - a);
    return answer === (sorted[0] * sorted[1]).toString();
  },
  points: 10,
  hint: "https://en.wikipedia.org/wiki/Product_(mathematics)",
};

interface MathQuestion {
  expression: string;
  numbers: number[];
}

interface MultipleExpressionsQuestion extends Question<MathQuestion> {}

export const multiplyDivideAndAdd: MultipleExpressionsQuestion = {
  // Random between 1 and 10
  randomInput: () =>
    [
      { expression: "* + $ $ - $ $", numbers: randomNumbers(4) },
      { expression: "* - $ $ + $ $", numbers: randomNumbers(4) },
      { expression: "/ * $ $ + $ $", numbers: randomNumbers(4) },
    ].sort(() => Math.random() - 0.5)[0],
  question: ({ expression, numbers }) => {
    const replaced = expression.replace(
      /\$/g,
      () => numbers.shift()?.toString() ?? ""
    );
    return `Calculate the result (prefix polish notation) of: ${replaced}`;
  },
  correctAnswer: (answer: string, { expression, numbers }) => {
    const replaced = expression.replace(
      /\$/g,
      () => numbers.shift()?.toString() ?? ""
    );
    // Compare number with delta to account for floating point errors
    return (
      Math.abs(evaluatePolishNotation(replaced) - Number.parseFloat(answer)) <
      0.001
    );
  },
  points: 20,
  hint: "https://en.wikipedia.org/wiki/Polish_notation",
};

interface HappyNumber {
  number: number;
  randomNumbers: number[];
}

interface HappyNumberQuestion extends Question<HappyNumber> {}

const happyNumbers = generateHappyNumbers(50);
const unhappyNumbers = generateUnhappyNumbers(350);

console.log(happyNumbers);

export const happyNumber: HappyNumberQuestion = {
  randomInput: () => {
    const happyNumber =
      happyNumbers[Math.floor(Math.random() * happyNumbers.length)];
    const randomNumbers = unhappyNumbers
      .sort(() => Math.random() - 0.5)
      .slice(0, 9);
    // Insert the happy number at a random position in randomNumbers
    randomNumbers.splice(
      Math.floor(Math.random() * randomNumbers.length),
      0,
      happyNumber
    );
    return {
      number: happyNumber,
      randomNumbers,
    };
  },
  question: ({ number: happyNumber, randomNumbers }) =>
    `Which of these numbers is a happy number: ${randomNumbers.join(", ")}`,
  correctAnswer: (answer: string, { number: happyNumber }) => {
    return answer === happyNumber.toString();
  },
  points: 20,
  hint: "https://en.wikipedia.org/wiki/Happy_number",
};

interface CaesarCipher {
  sentence: string;
  shift: number;
}

interface CaesarCipherQuestion extends Question<CaesarCipher> {}

export const caesarCipher: CaesarCipherQuestion = {
  randomInput: () => {
    return {
      sentence: [
        "Programming: where 'It works on my machine' is enough.",
        "Debugging: seeking a needle that turns out to be hay.",
        "In programming, cache invalidation and naming are the hardest.",
        "Wanted to improve the world, but source code is classified.",
        "Programmers' favorite place? Loops. No exit in sight.",
        "Programmers like dark mode to keep the bugs away.",
        "Documentation is as real as unicorns in our world.",
        "Programming is magic. Just don't summon any demons.",
        "Weekends for programmers? Just code without meetings.",
        "It's not a bug; it's a feature yet to be documented.",
      ].sort(() => Math.random() - 0.5)[0],
      shift: Math.floor(Math.random() * 26),
    };
  },
  question: ({ sentence, shift }) =>
    `Decode sentence with a caesar cipher shift of ${shift}, preserve casing and punctuation: ${encodeCaesarCipher(
      sentence,
      shift
    )}`,
  correctAnswer: (answer: string, { sentence }) => {
    return sentence === answer;
  },
  points: 20,
  hint: "https://en.wikipedia.org/wiki/Caesar_cipher",
};

export const testQuestions = [uppercase, lowercase, vowels];

export const gameQuestions = [
  consonants,
  binaryToDecimal,
  mostCommonLetter,
  palindromes,
  heterograms,
  numeronym,
  missingNumber,
  addTwo,
  subtractTwo,
  multiplyMultipleNumbers,
  maximumProductOfTwoNumbers,
  runLengthEncoding,
  morseCodeDecoder,
  multiplyDivideAndAdd,
  caesarCipher,
  happyNumber,
];
