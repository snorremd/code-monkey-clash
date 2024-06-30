interface Solution {
  match: (question: string) => boolean;
  solve: (question: string) => string;
}

const capitalizeSolution = {
  // If the
  match: (question: string) => question.startsWith("Capitalize the word:"),
  solve: (question: string) => question.split(": ")[1].toUpperCase(),
};

const lowercaseSolution = {
  match: (question: string) => question.startsWith("Lowercase the word:"),
  solve: (question: string) => question.split(": ")[1].toLowerCase(),
};

const mostCommonLetterSolution = {
  match: (question: string) =>
    question.startsWith("What is the most common letter in the word:"),
  solve: (question: string) => {
    const word = question.split(": ")[1];
    const letters = word.split("");
    const letterCounts = letters.reduce((acc, letter) => {
      acc[letter] = acc[letter] ? acc[letter] + 1 : 1;
      return acc;
    }, {} as Record<string, number>);
    const maxLetter = Object.entries(letterCounts).reduce(
      (acc, [letter, count]) => {
        return count > acc[1] ? [letter, count] : acc;
      },
      ["", 0]
    );
    return maxLetter[0];
  },
};

const howManyVowelsSolution = {
  match: (question: string) =>
    question.startsWith("How many vowels are in the word:"),
  solve: (question: string) => {
    const word = question.split(": ")[1];
    const vowels = "aeiou";
    return word.split("").reduce((acc, letter) => {
      return vowels.includes(letter) ? acc + 1 : acc;
    }, 0);
  },
};

const howManyConsonantsSolution = {
  match: (question: string) =>
    question.startsWith("How many consonants are in the word:"),
  solve: (question: string) => {
    const word = question.split(": ")[1];
    const vowels = "aeiou";
    return word.split("").reduce((acc, letter) => {
      return !vowels.includes(letter) ? acc + 1 : acc;
    }, 0);
  },
};

const numeronymContractionSolution = {
  match: (question: string) =>
    question.startsWith(
      "What is the numerical contraction numeronym (e.g. accessibility -> a11y) for:"
    ),
  solve: (question: string) => {
    const word = question.split(": ")[1];
    return `${word[0]}${word.length - 2}${word[word.length - 1]}`;
  },
};

const binaryToDecimalSolution = {
  match: (question: string) =>
    question.startsWith("What is the decimal value of the binary number:"),
  solve: (question: string) => {
    const binary = question.split(": ")[1];
    return Number.parseInt(binary, 2).toString();
  },
};

const palindromeSolution = {
  match: (question: string) =>
    question.startsWith(
      "Which of these words are a palindrome (comma separated answer):"
    ),
  solve: (question: string) => {
    const words = question.split(": ")[1].split(", ");
    return words
      .filter((word) => word === word.trim().split("").reverse().join(""))
      .join(", ");
  },
};

export const solutions = [
  capitalizeSolution,
  lowercaseSolution,
  mostCommonLetterSolution,
  howManyVowelsSolution,
  howManyConsonantsSolution,
  numeronymContractionSolution,
  binaryToDecimalSolution,
  palindromeSolution,
];

export const someSolutions = [
  capitalizeSolution,
  howManyVowelsSolution,
  howManyConsonantsSolution,
  numeronymContractionSolution,
  palindromeSolution,
];
