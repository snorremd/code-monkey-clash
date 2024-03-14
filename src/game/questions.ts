interface Question {
  question: () => string;
  correctAnswer: (question: string) => string;
  points: number;
}

export const uppercase: Question = {
  question: () =>
    `Capitalize the word: ${
      ["cheeseburger", "hotdog", "capitalize", "javascript"].sort(
        () => Math.random() - 0.5
      )[0]
    }`,
  correctAnswer: (question) => question.split(":").at(1)!.trim().toUpperCase(),
  points: 2,
};

export const lowercase: Question = {
  question: () =>
    `Lowercase the word: ${
      ["CHEESEBURGER", "HOTDOG", "LOWERCASE", "JAVASCRIPT"].sort(
        () => Math.random() - 0.5
      )[0]
    }`,
  correctAnswer: (question) => question.split(":").at(1)!.trim().toLowerCase(),
  points: 2,
};

export const secondWord: Question = {
  question: () =>
    `What is the second word in the sentence: ${
      [
        "The quick brown fox jumps over the lazy dog",
        "The cat in the hat",
        "A bird in the hand is worth two in the bush",
        "A penny for your thoughts",
      ].sort(() => Math.random() - 0.5)[0]
    }`,
  correctAnswer: (question) =>
    question.split(":").at(1)!.trim().split(" ").at(1)!,
  points: 2,
};

export const testQuestions = [uppercase, lowercase, secondWord];
