import {
  decodeCaesarCipher,
  decodeMorse,
  encodeCaesarCipher,
  encodeMorse,
  evaluatePolishNotation,
  generateHappyNumbers,
  generateUnhappyNumbers,
  isHappy,
  randomNumbers,
} from "./helpers/game-helpers";

// Make an inferred type for the question object
// It can be any thing

export interface Question<T> {
  /** Question formulation to reuse in logic */
  question: string;
  /** Generate some random input to use in question */
  randomInput: () => T;
  /** Generate a question string based on the random input */
  questionWithInput: (input: T) => string;
  /** Check if the answer is correct based on the random input */
  answerIsCorrect: (answer: string, input: T) => boolean;
  /** Points awarded for correct answer */
  points: number;
  /** Hint to help solve the question, possibly a URL */
  hint?: string;
  /** If a question string matches this question type returns true */
  match: (question: string) => boolean;
  /** Given a whole question, solve question and return answer */
  solve: (question: string) => string;
}

interface RandomWordQuestion extends Question<string> {}

function uppercaseAnswer(randomWord: string) {
  return randomWord.toUpperCase();
}

export const uppercase: RandomWordQuestion = {
  question: "Capitalize the word:",
  points: 2,
  hint: "https://en.wikipedia.org/wiki/Letter_case",

  randomInput() {
    return ["cheeseburger", "hotdog", "capitalize", "javascript"].sort(
      () => Math.random() - 0.5
    )[0];
  },
  questionWithInput(randomWord: string) {
    return `${this.question} ${randomWord}`;
  },
  answerIsCorrect(answer: string, randomWord: string) {
    return uppercaseAnswer(randomWord) === answer;
  },
  match(question: string) {
    return question.startsWith(this.question);
  },
  solve(question: string) {
    return uppercaseAnswer(question.split(": ")[1]);
  },
};

function solveLowercase(randomWord: string) {
  return randomWord.toLowerCase();
}

export const lowercase: RandomWordQuestion = {
  question: "Lowercase the word:",
  points: 2,
  hint: "https://en.wikipedia.org/wiki/Letter_case",

  randomInput() {
    return ["Cheeseburger", "Hotdog", "Capitalize", "JavaScript"].sort(
      () => Math.random() - 0.5
    )[0];
  },
  questionWithInput(randomWord: string) {
    return `${this.question} ${randomWord}`;
  },
  answerIsCorrect(answer: string, randomWord: string) {
    return solveLowercase(randomWord) === answer;
  },
  match(question: string) {
    return question.startsWith(this.question);
  },
  solve(question: string) {
    return solveLowercase(question.split(": ")[1]);
  },
};

const solveMostCommonLetter = (randomWord: string) => {
  const letters = randomWord.split("");
  const frequencies = letters.reduce((acc, letter) => {
    acc[letter] = (acc[letter] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostCommon = Object.entries(frequencies).sort(([, a], [, b]) => b - a);
  const mostCommonLetters = mostCommon.filter(
    ([, frequency]) => frequency === mostCommon[0][1]
  );

  return mostCommonLetters.map(([letter]) => letter);
};

export const mostCommonLetter: RandomWordQuestion = {
  question: "What is the most common letter in the word:",
  points: 4,
  hint: "https://en.wikipedia.org/wiki/Letter_frequency",

  randomInput() {
    return ["cheeseburger", "hotdog", "capitalize", "javascript"].sort(
      () => Math.random() - 0.5
    )[0];
  },
  questionWithInput(randomWord: string) {
    return `${this.question} ${randomWord}`;
  },
  answerIsCorrect: (answer: string, randomWord: string) => {
    // Could be multiple correct answers if there are multiple letters with the same frequency
    return solveMostCommonLetter(randomWord).includes(answer);
  },
  match(question: string) {
    return question.startsWith(this.question);
  },
  solve(question: string) {
    return solveMostCommonLetter(question.split(": ")[1])[0];
  },
};

function solveVowels(randomWord: string) {
  const vowels = randomWord.match(/[aeiou]/gi);
  return (vowels?.length ?? 0).toString();
}

export const vowels: RandomWordQuestion = {
  question: "How many vowels are in the word:",
  points: 4,
  hint: "a e i o u y",

  randomInput() {
    return ["cheeseburger", "hotdog", "capitalize", "javascript"].sort(
      () => Math.random() - 0.5
    )[0];
  },
  questionWithInput(randomWord) {
    return `${this.question} ${randomWord}`;
  },
  answerIsCorrect(answer, randomWord) {
    return solveVowels(randomWord) === answer;
  },
  match(question) {
    return question.startsWith(this.question);
  },
  solve(question) {
    return solveVowels(question.split(": ")[1]);
  },
};

const solveConsonants = (randomWord: string) => {
  const consonants = randomWord.match(/[^aeiou]/gi);
  return (consonants?.length ?? 0).toString();
};

export const consonants: RandomWordQuestion = {
  question: "How many consonants are in the word:",
  points: 4,
  hint: "b c d f g h j k l m n p q r s t v w x z",

  randomInput() {
    return ["cheeseburger", "hotdog", "capitalize", "javascript"].sort(
      () => Math.random() - 0.5
    )[0];
  },
  questionWithInput(randomWord) {
    return `${this.question} ${randomWord}`;
  },
  answerIsCorrect(answer, randomWord) {
    return solveConsonants(randomWord) === answer;
  },
  match(question) {
    return question.startsWith(this.question);
  },
  solve(question) {
    return solveConsonants(question.split(": ")[1]);
  },
};

function solveNumeronym(randomWord: string) {
  return randomWord[0] + (randomWord.length - 2) + randomWord.slice(-1);
}

export const numeronym: RandomWordQuestion = {
  question:
    "What is the numerical contraction numeronym (e.g. accessibility -> a11y) for:",
  points: 4,
  hint: "https://en.wikipedia.org/wiki/Numeronym#Numerical_contractions",

  randomInput() {
    return [
      "accessibility",
      "javascript",
      "internationalization",
      "hyperlink",
      "webpage",
      "kubernetes",
      "pseudopseudohypoparathyroidism",
    ].sort(() => Math.random() - 0.5)[0];
  },
  questionWithInput(randomWord) {
    return `${this.question} ${randomWord}`;
  },
  answerIsCorrect(answer, randomWord) {
    return solveNumeronym(randomWord) === answer;
  },
  match(question) {
    return question.startsWith(this.question);
  },
  solve(question) {
    return solveNumeronym(question.split(": ")[1]);
  },
};

function solveBinaryToDecimal(binary: string) {
  return Number.parseInt(binary, 2).toString();
}

export const binaryToDecimal: RandomWordQuestion = {
  question: "What is the decimal value of the binary number:",
  points: 2,
  hint: "https://en.wikipedia.org/wiki/Binary_number",

  randomInput() {
    const binary = Math.floor(Math.random() * 256).toString(2);
    return binary;
  },
  questionWithInput(binary) {
    return `${this.question} ${binary}`;
  },
  answerIsCorrect(answer, binary) {
    return solveBinaryToDecimal(binary) === answer;
  },
  match(question) {
    return question.startsWith(this.question);
  },
  solve(question) {
    return solveBinaryToDecimal(question.split(": ")[1]);
  },
};

interface WordListQuestion extends Question<string[]> {}

function solvePalindromes(wordList: string[]) {
  return wordList.filter((word) => word === word.split("").reverse().join(""));
}

export const palindromes: WordListQuestion = {
  question: "Which of these words are a palindrome (comma separated answer):",
  points: 5,
  hint: "https://en.wikipedia.org/wiki/Palindrome",

  randomInput() {
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
  questionWithInput(wordList: string[]) {
    return `${this.question} ${wordList.join(", ")}`;
  },
  answerIsCorrect(answer: string, wordList: string[]) {
    const answers = answer.split(",").map((word) => word.trim());
    const palindomes = solvePalindromes(wordList);
    // All answers must be in the list of palindromes, and all palindromes must be in the list of answers
    return (
      answers.every((word) => palindomes.includes(word)) &&
      palindomes.every((word) => answers.includes(word))
    );
  },
  match(question) {
    return question.startsWith(this.question);
  },
  solve(question) {
    return solvePalindromes(question.split(": ")[1].split(", ")).join(", ");
  },
};

function solveHeterograms(wordList: string[]) {
  return wordList.filter((word) => new Set(word).size === word.length);
}

export const heterograms: WordListQuestion = {
  question: "Which of these words are heterograms (comma separated answer):",
  points: 5,
  hint: "https://en.wikipedia.org/wiki/Heterogram_(literature)",

  randomInput() {
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
  questionWithInput(wordList: string[]) {
    return `${this.question} ${wordList.join(", ")}`;
  },
  answerIsCorrect: (answer: string, wordList: string[]) => {
    const answers = answer.split(",").map((word) => word.trim());
    const heterograms = solveHeterograms(wordList);
    return (
      answers.every((word) => heterograms.includes(word)) &&
      heterograms.every((word) => answers.includes(word))
    );
  },
  match(question) {
    return question.startsWith(this.question);
  },
  solve(question) {
    return solveHeterograms(question.split(": ")[1].split(", ")).join(", ");
  },
};

interface MissingNumberQuestion extends Question<[number[], number]> {}

export const missingNumber: MissingNumberQuestion = {
  question: "What number is missing from the sequence:",
  points: 5,

  // Random between 1 and 100
  randomInput() {
    // Generate a sequence of 9 consecutive numbers, remove one and return the sequence and the missing number
    const missing = Math.floor(Math.random() * 9) + 1;
    const numbers = Array.from({ length: 9 }, (_, i) => i + 1).filter(
      (number) => number !== missing
    );
    return [numbers, missing];
  },
  questionWithInput([numbers, missing]: [number[], number]) {
    const question = numbers
      .map((number) => (number === missing ? "?" : number))
      .join(", ");
    return `${this.question} ${question}`;
  },
  answerIsCorrect(answer: string, [_, missing]: [number[], number]) {
    // Here we use the fact that we already know the missing number
    return answer === missing.toString();
  },
  match(question) {
    return question.startsWith(this.question);
  },
  solve(question) {
    const numbers = question
      .split(": ")[1]
      .split(", ")
      .map((n) => Number.parseInt(n));

    // Compare two and two numbers, if the difference is not 1, the missing number is between them
    for (let i = 0; i < numbers.length - 1; i++) {
      if (numbers[i + 1] - numbers[i] !== 1) {
        return (numbers[i] + 1).toString();
      }
    }
    return "";
  },
};

interface TwoNumberQuestion extends Question<[number, number]> {}

function solveTwoNumbers([a, b]: [number, number]) {
  return (a + b).toString();
}

export const addTwo: TwoNumberQuestion = {
  question: "Calculate the sum of:",
  points: 5,
  hint: "https://en.wikipedia.org/wiki/Polish_notation",

  // Random between 1 and 100
  randomInput() {
    return [
      Math.floor(Math.random() * 100) + 1,
      Math.floor(Math.random() * 100) + 1,
    ];
  },
  questionWithInput([a, b]: [number, number]) {
    return `${this.question} + ${a} ${b}`;
  },
  answerIsCorrect(answer: string, [a, b]: [number, number]) {
    return answer === (a + b).toString();
  },
  match(question) {
    return question.startsWith(this.question);
  },
  solve(question) {
    const [a, b] = question
      .split(": ")[1]
      .split(" + ")
      .map((n) => Number(n));
    return solveTwoNumbers([a, b]);
  },
};

function solveSubtractTwo([a, b]: [number, number]) {
  return (a - b).toString();
}

export const subtractTwo: TwoNumberQuestion = {
  question: "Calculate the difference (prefix polish notation) of:",
  points: 5,
  hint: "https://en.wikipedia.org/wiki/Polish_notation",

  // Random between 1 and 100
  randomInput() {
    return [
      Math.floor(Math.random() * 100) + 1,
      Math.floor(Math.random() * 100) + 1,
    ];
  },
  questionWithInput([a, b]: [number, number]) {
    return `${this.question} - ${a} ${b}`;
  },
  answerIsCorrect(answer: string, [a, b]: [number, number]) {
    return answer === (a - b).toString();
  },
  match(question) {
    return question.startsWith(this.question);
  },
  solve(question) {
    const [a, b] = question
      .split(": ")[1]
      .split(" - ")
      .map((n) => Number(n));
    return solveSubtractTwo([a, b]);
  },
};

function solveRunLengthEncoding(randomWord: string) {
  // Match single characters not followed by the same character and count them as 1
  return randomWord.replace(/(.)\1*/g, (match, char) => {
    return `${char}${match.length}`;
  });
}

export const runLengthEncoding: RandomWordQuestion = {
  question: "What is the run length encoding (e.g. aabbc -> a2b2c1) of:",
  points: 10,
  hint: "https://en.wikipedia.org/wiki/Run-length_encoding",

  randomInput() {
    return [
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
    ].sort(() => Math.random() - 0.5)[0];
  },
  questionWithInput(randomWord) {
    return `${this.question} ${randomWord}`;
  },
  answerIsCorrect(answer, randomWord) {
    // Match single characters not followed by the same character and count them as 1
    const encoded = solveRunLengthEncoding(randomWord);
    return encoded === answer;
  },
  match(question) {
    return question.startsWith(this.question);
  },
  solve(question) {
    return solveRunLengthEncoding(question.split(": ")[1]);
  },
};

export const morseCodeDecoder: RandomWordQuestion = {
  question: "What is the decoded message from morse code (3 spaces = space):",
  points: 10,
  hint: "https://en.wikipedia.org/wiki/Morse_code",

  randomInput() {
    return encodeMorse(
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
    );
  },
  questionWithInput(randomMorseCode) {
    return `${this.question} ${randomMorseCode}`;
  },
  answerIsCorrect(answer, randomMorseCode) {
    return answer === decodeMorse(randomMorseCode);
  },
  match(question) {
    return question.startsWith(this.question);
  },
  solve(question) {
    return decodeMorse(question.split(": ")[1]);
  },
};

interface MultiplyMultipleNumbersQuestion extends Question<number[]> {}

function solveMultiplyMultipleNumbers(numbers: number[]) {
  return numbers.reduce((acc, num) => acc * num, 1).toString();
}

export const multiplyMultipleNumbers: MultiplyMultipleNumbersQuestion = {
  question: "Calculate the product (prefix polish notation) of:",
  points: 10,
  hint: "https://en.wikipedia.org/wiki/Polish_notation",

  // Random between 1 and 10
  randomInput() {
    return randomNumbers(Math.floor(Math.random() * 5) + 1);
  },
  questionWithInput(numbers: number[]) {
    return `${this.question} ${"* "
      .repeat(numbers.length - 1)
      .trim()} ${numbers.join(" ")}`;
  },
  answerIsCorrect(answer: string, numbers: number[]) {
    return answer === numbers.reduce((acc, num) => acc * num, 1).toString();
  },
  match(question) {
    return question.startsWith(this.question);
  },
  solve(question) {
    const numbers = question.split(": ")[1].split(" ");
    return solveMultiplyMultipleNumbers(numbers.map((n) => Number(n)));
  },
};

function solveMaximumProductOfTwoNumbers(numbers: number[]) {
  const sorted = numbers.sort((a, b) => b - a);
  return (sorted[0] * sorted[1]).toString();
}

export const maximumProductOfTwoNumbers: MultiplyMultipleNumbersQuestion = {
  question: "What is the maximum product of two numbers from the list:",
  points: 10,
  hint: "https://en.wikipedia.org/wiki/Product_(mathematics)",
  // Random between 1 and 10
  randomInput() {
    return randomNumbers(4);
  },
  questionWithInput(numbers: number[]) {
    return `${this.question} ${numbers.join(", ")}`;
  },
  answerIsCorrect(answer: string, numbers: number[]) {
    const sorted = numbers.sort((a, b) => b - a);
    return answer === (sorted[0] * sorted[1]).toString();
  },
  match(question) {
    return question.startsWith(this.question);
  },
  solve(question) {
    const numbers = question.split(": ")[1].split(", ");
    return solveMaximumProductOfTwoNumbers(numbers.map((n) => Number(n)));
  },
};

interface MathQuestion {
  expression: string;
  numbers: number[];
}

interface MultipleExpressionsQuestion extends Question<MathQuestion> {}

export const multiplyDivideAndAdd: MultipleExpressionsQuestion = {
  question: "Calculate the result (prefix polish notation) of:",
  points: 20,
  hint: "https://en.wikipedia.org/wiki/Polish_notation",
  // Random between 1 and 10
  randomInput() {
    return [
      { expression: "* + $ $ - $ $", numbers: randomNumbers(4) },
      { expression: "* - $ $ + $ $", numbers: randomNumbers(4) },
      { expression: "/ * $ $ + $ $", numbers: randomNumbers(4) },
    ].sort(() => Math.random() - 0.5)[0];
  },
  questionWithInput({ expression, numbers }) {
    const replaced = expression.replace(
      /\$/g,
      () => numbers.shift()?.toString() ?? ""
    );
    return `${this.question} ${replaced}`;
  },
  answerIsCorrect(answer: string, { expression, numbers }) {
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
  match(question) {
    return question.startsWith(this.question);
  },
  solve(question) {
    const [expression, ...numbers] = question.split(": ")[1].split(" ");
    return evaluatePolishNotation(
      expression.replace(/\$/g, () => numbers.shift()?.toString() ?? "")
    ).toString();
  },
};

interface HappyNumber {
  number: number;
  randomNumbers: number[];
}

interface HappyNumberQuestion extends Question<HappyNumber> {}

const happyNumbers = generateHappyNumbers(50);
const unhappyNumbers = generateUnhappyNumbers(350);

function solveHappyNumbers(numbers: string) {
  return numbers
    .split(", ")
    .map((n) => Number.parseInt(n))
    .filter(isHappy)
    .join(", ");
}

export const happyNumber: HappyNumberQuestion = {
  question: "Which of these numbers is a happy number:",
  points: 20,
  hint: "https://en.wikipedia.org/wiki/Happy_number",

  randomInput() {
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
  questionWithInput({ randomNumbers }) {
    return `${this.question} ${randomNumbers.join(", ")}`;
  },
  answerIsCorrect(answer: string, { number: happyNumber }) {
    return answer === happyNumber.toString();
  },
  match(question) {
    return question.startsWith(this.question);
  },
  solve(question) {
    return solveHappyNumbers(question.split(": ")[1]);
  },
};

interface CaesarCipher {
  sentence: string;
  shift: number;
}

interface CaesarCipherQuestion extends Question<CaesarCipher> {}

export const caesarCipher: CaesarCipherQuestion = {
  question: "Decode caesar-encoded sentence (preserve casing and punctuation):",
  points: 20,
  hint: "https://en.wikipedia.org/wiki/Caesar_cipher",

  randomInput() {
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
  questionWithInput({ sentence, shift }) {
    return `${this.question} shift ${shift} sentence ${encodeCaesarCipher(
      sentence,
      shift
    )}`;
  },
  answerIsCorrect(answer: string, { sentence }) {
    return sentence === answer;
  },
  match(question) {
    return question.startsWith(this.question);
  },
  solve(question) {
    const [shift, sentence] = question.split("shift ")[1].split(" sentence ");
    return decodeCaesarCipher(sentence, Number.parseInt(shift ?? "0"));
  },
};

export const testQuestions = [uppercase, lowercase, vowels];

export const gameQuestions = [
  uppercase,
  lowercase,
  vowels,
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
