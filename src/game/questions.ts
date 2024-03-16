interface Question {
  type: string;
  question: Function;
  correctAnswer: Function;
  points: number;
}

interface RandomWordQuestion extends Question {
  type: "randomWord";
  randomWord: () => string;
  question: (randomWord: string) => string;
  correctAnswer: (answer: string, randomWord: string) => boolean;
}

export const uppercase: RandomWordQuestion = {
  type: "randomWord",
  randomWord: () =>
    ["cheeseburger", "hotdog", "capitalize", "javascript"].sort(
      () => Math.random() - 0.5
    )[0],
  question: (randomWord: string) => `Capitalize the word: ${randomWord}`,
  correctAnswer: (answer: string, randomWord: string) =>
    randomWord.toUpperCase() === answer,
  points: 2,
};

export const lowercase: RandomWordQuestion = {
  type: "randomWord",
  randomWord: () =>
    ["Cheeseburger", "Hotdog", "Capitalize", "JavaScript"].sort(
      () => Math.random() - 0.5
    )[0],
  question: (randomWord: string) => `Lowercase the word: ${randomWord}`,
  correctAnswer: (answer: string, randomWord: string) =>
    randomWord.toLowerCase() === answer,
  points: 2,
};

export const mostCommonLetter: RandomWordQuestion = {
  type: "randomWord",
  randomWord: () =>
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

interface WordListQuestion extends Question {
  type: "wordList";
  randomList: () => string[];
  question: (wordList: string[]) => string;
  correctAnswer: (answer: string, wordList: string[]) => boolean;
}

export const palindromes: WordListQuestion = {
  type: "wordList",
  randomList: () => {
    // Return a list of words where some are anagrams of each other
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
    `Which of these words are a palindrome (comma separated answer): ${wordList.join(", ")}`,
  correctAnswer: (answer: string, wordList: string[]) => {
    const answers = answer.split(",").map((word) => word.trim());
    const palindomes = wordList.filter((word) => word === word.split("").reverse().join(""))
    // All answers must be in the list of palindromes, and all palindromes must be in the list of answers
    return answers.every((word) => palindomes.includes(word)) && palindomes.every((word) => answers.includes(word))
  },
  points: 5,
};

export const isograms: WordListQuestion = {
  type: "wordList",
  randomList: () => {
    return [
      [
        "background",
        "palindrome",
        "cipher",
        "repeater",
        "juxtapose",
        "assessment"
      ],
      [
        "authorizes",
        "moonwalker",
        "brightside",
        "bookkeeper",
        "mystique",
        "subdermatoglyphic"
      ],
      [
        "computing",
        "rendezvous",
        "fjord",
        "encyclopedia",
        "sphinx",
        "mississippi"
      ],
      [
        "puzzling",
        "algorithm",
        "vortex",
        "philosopher",
        "gymnast",
        "parallelogram"
      ]
    ].sort(() => Math.random() - 0.5)[0];
  },
  question: (wordList: string[]) =>
    `Which of these words are isograms (comma separated answer): ${wordList.join(", ")}`,
  correctAnswer: (answer: string, wordList: string[]) => {
    const answers = answer.split(",").map((word) => word.trim());
    const isograms = wordList.filter((word) => new Set(word).size === word.length)
    return answers.every((word) => isograms.includes(word)) && isograms.every((word) => answers.includes(word))
  }
}

export const testQuestions = [uppercase, lowercase, mostCommonLetter];

export const gameQuestions = [palindromes, isograms]
