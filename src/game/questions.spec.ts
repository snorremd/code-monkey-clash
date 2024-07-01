import { describe, expect, test } from "bun:test";

import { encodeCaesarCipher } from "./helpers/game-helpers";
import {
  addTwo,
  binaryToDecimal,
  caesarCipher,
  consonants,
  happyNumber,
  heterograms,
  lowercase,
  maximumProductOfTwoNumbers,
  missingNumber,
  morseCodeDecoder,
  mostCommonLetter,
  multiplyDivideAndAdd,
  multiplyMultipleNumbers,
  numeronym,
  palindromes,
  runLengthEncoding,
  subtractTwo,
  uppercase,
  vowels,
} from "./questions";

describe("uppercase", () => {
  test("randomInput", () => {
    const word = uppercase.randomInput();
    expect(typeof word).toBe("string");
  });

  test("question", () => {
    const word = "test";
    const question = uppercase.questionWithInput("test");
    expect(question).toBe("Capitalize the word: test");
  });

  test("correct answer", () => {
    const word = "test";
    const result = uppercase.answerIsCorrect("TEST", word);
    expect(result).toBeTrue();
  });

  test("incorrect answer", () => {
    const word = "test";
    const result = uppercase.answerIsCorrect("test", word);
    expect(result).toBeFalse();
  });

  test("match", () => {
    const question = uppercase.questionWithInput("test");
    const matches = uppercase.match(question);
    expect(matches).toBeTrue();
  });
});

describe("lowercase", () => {
  test("randomInput", () => {
    const word = lowercase.randomInput();
    expect(typeof word).toBe("string");
  });

  test("question", () => {
    const word = "test";
    const question = lowercase.questionWithInput("test");
    expect(question).toBe("Lowercase the word: test");
  });

  test("correctAnswer", () => {
    const word = "TEST";
    const result = lowercase.answerIsCorrect("test", word);
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const word = "TEST";
    const result = lowercase.answerIsCorrect("TEST", word);
    expect(result).toBeFalse();
  });
});

describe("mostCommonLetter", () => {
  test("randomInput", () => {
    const word = mostCommonLetter.randomInput();
    expect(typeof word).toBe("string");
  });

  test("question", () => {
    const question = mostCommonLetter.questionWithInput("test");
    expect(question).toBe("What is the most common letter in the word: test");
  });

  test("correctAnswer single most frequent", () => {
    const word = "test";
    const result = mostCommonLetter.answerIsCorrect("t", word);
    expect(result).toBeTrue();
  });

  test("correctAnswer multiple most frequent", () => {
    const word = "tests";
    const result = mostCommonLetter.answerIsCorrect("s", word);
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const word = "test";
    const result = mostCommonLetter.answerIsCorrect("e", word);
    expect(result).toBeFalse();
  });
});

describe("vowels", () => {
  test("randomInput", () => {
    const word = vowels.randomInput();
    expect(typeof word).toBe("string");
  });

  test("question", () => {
    const word = "test";
    const question = vowels.questionWithInput("test");
    expect(question).toBe("How many vowels are in the word: test");
  });

  test("correctAnswer", () => {
    const word = "test";
    const result = vowels.answerIsCorrect("1", word);
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const word = "test";
    const result = vowels.answerIsCorrect("2", word);
    expect(result).toBeFalse();
  });
});

describe("consonants", () => {
  test("randomInput", () => {
    const word = consonants.randomInput();
    expect(typeof word).toBe("string");
  });

  test("question", () => {
    const word = "test";
    const question = consonants.questionWithInput("test");
    expect(question).toBe("How many consonants are in the word: test");
  });

  test("correctAnswer", () => {
    const word = "test";
    const result = consonants.answerIsCorrect("3", word);
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const word = "test";
    const result = consonants.answerIsCorrect("2", word);
    expect(result).toBeFalse();
  });
});

describe("palindromes", () => {
  test("randomInput", () => {
    const list = palindromes.randomInput();
    expect(Array.isArray(list)).toBeTrue();
  });

  test("question", () => {
    const list = ["test", "racecar", "hello"];
    const question = palindromes.questionWithInput(list);
    expect(question).toBe(
      "Which of these words are a palindrome (comma separated answer): test, racecar, hello"
    );
  });

  test("correctAnswer", () => {
    const list = ["test", "racecar", "hello"];
    const result = palindromes.answerIsCorrect("racecar", list);
    expect(result).toBeTrue();
  });

  test("correct answer multiple", () => {
    const list = ["pallap", "racecar", "hello"];
    const result = palindromes.answerIsCorrect("pallap, racecar", list);
    expect(result).toBeTrue();
  });

  test("accept no spaces", () => {
    const list = ["pallap", "racecar", "hello"];
    const result = palindromes.answerIsCorrect("pallap,racecar", list);
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const list = ["test", "racecar", "hello"];
    const result = palindromes.answerIsCorrect("test", list);
    expect(result).toBeFalse();
  });
});

describe("heterograms", () => {
  test("randomInput", () => {
    const list = heterograms.randomInput();
    expect(Array.isArray(list)).toBeTrue();
  });

  test("question", () => {
    const list = ["test", "racecar", "hello"];
    const question = heterograms.questionWithInput(list);
    expect(question).toBe(
      "Which of these words are heterograms (comma separated answer): test, racecar, hello"
    );
  });

  test("correctAnswer", () => {
    const list = ["test", "racecar", "buck"];
    const result = heterograms.answerIsCorrect("buck", list);
    expect(result).toBeTrue();
  });

  test("correct answer multiple", () => {
    const list = ["buck", "racecar", "blow"];
    const result = heterograms.answerIsCorrect("blow, buck", list);
    expect(result).toBeTrue();
  });
});

describe("addTwo", () => {
  test("randomInput", () => {
    const numbers = addTwo.randomInput();
    expect(typeof numbers).toBe("object");
    expect(numbers.length).toBe(2);
  });

  test("question", () => {
    const number = 2;
    const question = addTwo.questionWithInput([1, 2]);
    expect(question).toBe("Calculate the sum of: + 1 2");
  });

  test("correctAnswer", () => {
    const result = addTwo.answerIsCorrect("5", [2, 3]);
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const result = addTwo.answerIsCorrect("5", [2, 2]);
    expect(result).toBeFalse();
  });
});

describe("subtractTwo", () => {
  test("randomInput", () => {
    const numbers = subtractTwo.randomInput();
    expect(typeof numbers).toBe("object");
    expect(numbers.length).toBe(2);
  });

  test("question", () => {
    const number = 2;
    const question = subtractTwo.questionWithInput([1, 2]);
    expect(question).toBe(
      "Calculate the difference (prefix polish notation) of: - 1 2"
    );
  });

  test("correctAnswer", () => {
    const result = subtractTwo.answerIsCorrect("1", [2, 1]);
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const result = subtractTwo.answerIsCorrect("5", [2, 2]);
    expect(result).toBeFalse();
  });
});

describe("multiplyMultipleNumbers", () => {
  test("randomInput", () => {
    const numbers = multiplyMultipleNumbers.randomInput();
    expect(Array.isArray(numbers)).toBeTrue();
  });

  test("question", () => {
    const numbers = [2, 3, 4];
    const question = multiplyMultipleNumbers.questionWithInput(numbers);
    expect(question).toBe(
      "Calculate the product (prefix polish notation) of: * * 2 3 4"
    );
  });

  test("correctAnswer", () => {
    const result = multiplyMultipleNumbers.answerIsCorrect("24", [2, 3, 4]);
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const result = multiplyMultipleNumbers.answerIsCorrect("5", [2, 2]);
    expect(result).toBeFalse();
  });
});

describe("multiplyDivideAndAdd", () => {
  test("randomInput", () => {
    const question = multiplyDivideAndAdd.randomInput();
    expect(question).toBeObject();
  });

  test("question", () => {
    const question = multiplyDivideAndAdd.questionWithInput({
      expression: "* + $ $ - $ $",
      numbers: [1, 2, 3, 4],
    });
    expect(question).toBe(
      "Calculate the result (prefix polish notation) of: * + 1 2 - 3 4"
    );
  });

  test("correctAnswer", () => {
    const result = multiplyDivideAndAdd.answerIsCorrect("10", {
      expression: "* + $ $ - $ $",
      numbers: [2, 3, 4, 2],
    });
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const result = multiplyDivideAndAdd.answerIsCorrect("5", {
      expression: "* + $ $ - $ $",
      numbers: [2, 3, 4, 2],
    });
    expect(result).toBeFalse();
  });
});

describe("caesarCipher", () => {
  test("randomInput", () => {
    const question = caesarCipher.randomInput();
    expect(question).toBeObject();
    expect(question.shift).toBeNumber();
    expect(question.sentence).toBeString();
  });

  test("question", () => {
    const sentence = "Programming: where 'It works on my machine' is enough.";
    const shift = 3;
    const question = caesarCipher.questionWithInput({
      shift,
      sentence,
    });
    expect(question).toBe(
      `Decode caesar-encoded sentence (preserve casing and punctuation): shift 3 sentence ${encodeCaesarCipher(
        sentence,
        shift
      )}`
    );
  });

  test("correctAnswer", () => {
    const result = caesarCipher.answerIsCorrect("hello", {
      shift: 3,
      sentence: "hello",
    });
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const result = caesarCipher.answerIsCorrect("foo", {
      shift: 3,
      sentence: "hello",
    });
    expect(result).toBeFalse();
  });
});

describe("missingNumber", () => {
  test("randomInput", () => {
    const list = missingNumber.randomInput();
    expect(Array.isArray(list)).toBeTrue();
  });

  test("question", () => {
    const list = [[1, 2, 3, 5], 4] as [number[], number];
    const question = missingNumber.questionWithInput(list);
    expect(question).toBe(
      "What number is missing from the sequence: 1, 2, 3, 5"
    );
  });

  test("correctAnswer", () => {
    const result = missingNumber.answerIsCorrect("4", [[1, 2, 3, 5], 4]);
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const result = missingNumber.answerIsCorrect("5", [[1, 2, 3, 5], 4]);
    expect(result).toBeFalse();
  });

  test("solve", () => {
    const answer = missingNumber.solve(
      "What number is missing from the sequence: 1, 2, 3, 5"
    );
    expect(answer).toBe("4");

    const answer2 = missingNumber.solve(
      "What number is missing from the sequence: 1, 3, 4, 5"
    );

    expect(answer2).toBe("2");
  });
});

describe("maximumProductOfTwoNumbers", () => {
  test("randomInput", () => {
    const list = maximumProductOfTwoNumbers.randomInput();
    expect(Array.isArray(list)).toBeTrue();
  });

  test("question", () => {
    const list = [1, 2, 3, 4, 5];
    const question = maximumProductOfTwoNumbers.questionWithInput(list);
    expect(question).toBe(
      "What is the maximum product of two numbers from the list: 1, 2, 3, 4, 5"
    );
  });

  test("correctAnswer", () => {
    const result = maximumProductOfTwoNumbers.answerIsCorrect(
      "20",
      [1, 2, 3, 4, 5]
    );
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const result = maximumProductOfTwoNumbers.answerIsCorrect(
      "10",
      [1, 2, 3, 4, 5]
    );
    expect(result).toBeFalse();
  });

  test("correctAnswer unsorted list", () => {
    const result = maximumProductOfTwoNumbers.answerIsCorrect(
      "20",
      [5, 4, 3, 2, 1]
    );
    expect(result).toBeTrue();
  });
});

describe("numeronym", () => {
  test("randomInput", () => {
    const word = numeronym.randomInput();
    expect(word).toBeString();
  });

  test("question", () => {
    const word = "accessibility";
    const question = numeronym.questionWithInput(word);
    expect(question).toBe(
      "What is the numerical contraction numeronym (e.g. accessibility -> a11y) for: accessibility"
    );
  });

  test("correctAnswer", () => {
    const result = numeronym.answerIsCorrect("a11y", "accessibility");
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const result = numeronym.answerIsCorrect("a12y", "accessibility");
    expect(result).toBeFalse();
  });
});

describe("runLengthEncoding", () => {
  test("randomInput", () => {
    const word = runLengthEncoding.randomInput();
    expect(word).toBeString();
  });

  test("question", () => {
    const word = "aaabcc";
    const question = runLengthEncoding.questionWithInput(word);
    expect(question).toBe(
      "What is the run length encoding (e.g. aabbc -> a2b2c1) of: aaabcc"
    );
  });

  test("correctAnswer", () => {
    const result = runLengthEncoding.answerIsCorrect("a3b1c2", "aaabcc");
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const result = runLengthEncoding.answerIsCorrect("a1b2", "aaabcc");
    expect(result).toBeFalse();
  });
});

describe("binaryToDecimal", () => {
  test("randomInput", () => {
    const number = binaryToDecimal.randomInput();
    expect(number).toBeString();
  });

  test("question", () => {
    const number = "101";
    const question = binaryToDecimal.questionWithInput(number);
    expect(question).toBe(
      "What is the decimal value of the binary number: 101"
    );
  });

  test("correctAnswer", () => {
    const result = binaryToDecimal.answerIsCorrect("5", "101");
    expect(result).toBeTrue();
  });

  test("correctAnswer zero", () => {
    const result = binaryToDecimal.answerIsCorrect("0", "0");
    expect(result).toBeTrue();
  });

  test("correctAnswer 10111001101101", () => {
    const result = binaryToDecimal.answerIsCorrect("11885", "10111001101101");
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const result = binaryToDecimal.answerIsCorrect("6", "101");
    expect(result).toBeFalse();
  });
});

describe("morseCodeDecoder", () => {
  test("randomInput", () => {
    const sentence = morseCodeDecoder.randomInput();
    expect(sentence).toBeString();
  });

  test("question", () => {
    const sentence = ".... . .-.. .-.. ---";
    const question = morseCodeDecoder.questionWithInput(sentence);
    expect(question).toBe(
      "What is the decoded message from morse code (3 spaces = space): .... . .-.. .-.. ---"
    );
  });

  test("correctAnswer", () => {
    const result = morseCodeDecoder.answerIsCorrect(
      "hello",
      ".... . .-.. .-.. ---"
    );
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const result = morseCodeDecoder.answerIsCorrect(
      "world",
      ".... . .-.. .-.. ---"
    );
    expect(result).toBeFalse();
  });
});

describe("happyNumber", () => {
  test("randomInput", () => {
    const { number, randomNumbers } = happyNumber.randomInput();
    expect(number).toBeNumber();
    expect(randomNumbers).toBeArray();
    expect(randomNumbers.some((n) => n === number)).toBeTrue();
  });

  test("question", () => {
    const number = 19;
    const randomNumbers = [1, 2, 3, number, 4, 5];
    const question = happyNumber.questionWithInput({
      number,
      randomNumbers,
    });
    expect(question).toBe(
      "Which of these numbers is a happy number: 1, 2, 3, 19, 4, 5"
    );
  });

  test("correctAnswer", () => {
    const result = happyNumber.answerIsCorrect("19", {
      number: 19,
      randomNumbers: [1, 2, 3, 19, 4, 5],
    });
    expect(result).toBeTrue();
  });

  test("incorrectAnswer", () => {
    const result = happyNumber.answerIsCorrect("23", {
      number: 19,
      randomNumbers: [1, 2, 3, 19, 4, 5],
    });
    expect(result).toBeFalse();
  });
});
