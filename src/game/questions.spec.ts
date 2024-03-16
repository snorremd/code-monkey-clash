import { describe, expect, test } from "bun:test";

import { lowercase, uppercase, mostCommonLetter, palindromes, isograms } from "./questions";

describe("uppercase", () => {
  test("randomWord", () => {
    const word = uppercase.randomWord();
    expect(typeof word).toBe("string");
  });

  test("question", () => {
    const word = "test";
    const question = uppercase.question('test');
    expect(question).toBe(`Capitalize the word: test`);
  });

  test("correct answer", () => {
    const word = "test";
    const result = uppercase.correctAnswer('TEST', word);
    expect(result).toBeTrue();
  });

  test("incorrect answer", () => {
    const word = "test";
    const result = uppercase.correctAnswer('test', word);
    expect(result).toBeFalse();
  })
})

describe("lowercase", () => {
  test("randomWord", () => {
    const word = lowercase.randomWord();
    expect(typeof word).toBe("string");
  });

  test("question", () => {
    const word = "test";
    const question = lowercase.question('test');
    expect(question).toBe(`Lowercase the word: test`);
  });

  test("correctAnswer", () => {
    const word = "TEST";
    const result = lowercase.correctAnswer('test', word);
    expect(result).toBeTrue();
  })

  test("incorrectAnswer", () => {
    const word = "TEST";
    const result = lowercase.correctAnswer('TEST', word);
    expect(result).toBeFalse();
  })
})

describe("mostCommonLetter", () => {
  test("randomWord", () => {
    const word = mostCommonLetter.randomWord();
    expect(typeof word).toBe("string");
  })

  test("question", () => {
    const word = "test";
    const question = mostCommonLetter.question('test');
    expect(question).toBe(`What is the most common letter in the word: test`);
  })

  test("correctAnswer single most frequent", () => {
    const word = "test";
    const result = mostCommonLetter.correctAnswer('t', word);
    expect(result).toBeTrue();
  })

  test("correctAnswer multiple most frequent", () => {
    const word = "tests";
    const result = mostCommonLetter.correctAnswer('s', word);
    expect(result).toBeTrue()
  })

  test("incorrectAnswer", () => {
    const word = "test";
    const result = mostCommonLetter.correctAnswer('e', word);
    expect(result).toBeFalse();
  })
})

describe("palindromes", () => {
  test("randomList", () => {
    const list = palindromes.randomList();
    expect(Array.isArray(list)).toBeTrue();
  })

  test("question", () => {
    const list = ["test", "racecar", "hello"];
    const question = palindromes.question(list);
    expect(question).toBe("Which of these words are a palindrome (comma separated answer): test, racecar, hello");
  })

  test("correctAnswer", () => {
    const list = ["test", "racecar", "hello"];
    const result = palindromes.correctAnswer('racecar', list);
    expect(result).toBeTrue();
  })

  test("correct answer multiple", () => {
    const list = ["pallap", "racecar", "hello"];
    const result = palindromes.correctAnswer('pallap, racecar', list);
    expect(result).toBeTrue();
  })

  test("accept no spaces", () => {
    const list = ["pallap", "racecar", "hello"];
    const result = palindromes.correctAnswer('pallap,racecar', list);
    expect(result).toBeTrue();
  })

  test("incorrectAnswer", () => {
    const list = ["test", "racecar", "hello"];
    const result = palindromes.correctAnswer('test', list);
    expect(result).toBeFalse();
  })
})

describe("isograms", () => {
  test("randomList", () => {
    const list = isograms.randomList();
    expect(Array.isArray(list)).toBeTrue();
  })

  test("question", () => {
    const list = ["test", "racecar", "hello"];
    const question = isograms.question(list);
    expect(question).toBe("Which of these words are isograms (comma separated answer): test, racecar, hello");
  })

  test("correctAnswer", () => {
    const list = ["test", "racecar", "buck"];
    const result = isograms.correctAnswer('buck', list);
    expect(result).toBeTrue();
  })

  test("correct answer multiple", () => {
    const list = ["buck", "racecar", "blow"];
    const result = isograms.correctAnswer('blow, buck', list);
    expect(result).toBeTrue();
  })
})