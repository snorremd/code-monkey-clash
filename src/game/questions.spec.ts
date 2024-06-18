import { describe, expect, test } from "bun:test";

import { encodeCaesarCipher } from "./helpers";
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
		const question = uppercase.question("test");
		expect(question).toBe("Capitalize the word: test");
	});

	test("correct answer", () => {
		const word = "test";
		const result = uppercase.correctAnswer("TEST", word);
		expect(result).toBeTrue();
	});

	test("incorrect answer", () => {
		const word = "test";
		const result = uppercase.correctAnswer("test", word);
		expect(result).toBeFalse();
	});
});

describe("lowercase", () => {
	test("randomInput", () => {
		const word = lowercase.randomInput();
		expect(typeof word).toBe("string");
	});

	test("question", () => {
		const word = "test";
		const question = lowercase.question("test");
		expect(question).toBe("Lowercase the word: test");
	});

	test("correctAnswer", () => {
		const word = "TEST";
		const result = lowercase.correctAnswer("test", word);
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const word = "TEST";
		const result = lowercase.correctAnswer("TEST", word);
		expect(result).toBeFalse();
	});
});

describe("mostCommonLetter", () => {
	test("randomInput", () => {
		const word = mostCommonLetter.randomInput();
		expect(typeof word).toBe("string");
	});

	test("question", () => {
		const word = "test";
		const question = mostCommonLetter.question("test");
		expect(question).toBe("What is the most common letter in the word: test");
	});

	test("correctAnswer single most frequent", () => {
		const word = "test";
		const result = mostCommonLetter.correctAnswer("t", word);
		expect(result).toBeTrue();
	});

	test("correctAnswer multiple most frequent", () => {
		const word = "tests";
		const result = mostCommonLetter.correctAnswer("s", word);
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const word = "test";
		const result = mostCommonLetter.correctAnswer("e", word);
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
		const question = vowels.question("test");
		expect(question).toBe("How many vowels are in the word: test");
	});

	test("correctAnswer", () => {
		const word = "test";
		const result = vowels.correctAnswer("1", word);
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const word = "test";
		const result = vowels.correctAnswer("2", word);
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
		const question = consonants.question("test");
		expect(question).toBe("How many consonants are in the word: test");
	});

	test("correctAnswer", () => {
		const word = "test";
		const result = consonants.correctAnswer("3", word);
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const word = "test";
		const result = consonants.correctAnswer("2", word);
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
		const question = palindromes.question(list);
		expect(question).toBe(
			"Which of these words are a palindrome (comma separated answer): test, racecar, hello",
		);
	});

	test("correctAnswer", () => {
		const list = ["test", "racecar", "hello"];
		const result = palindromes.correctAnswer("racecar", list);
		expect(result).toBeTrue();
	});

	test("correct answer multiple", () => {
		const list = ["pallap", "racecar", "hello"];
		const result = palindromes.correctAnswer("pallap, racecar", list);
		expect(result).toBeTrue();
	});

	test("accept no spaces", () => {
		const list = ["pallap", "racecar", "hello"];
		const result = palindromes.correctAnswer("pallap,racecar", list);
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const list = ["test", "racecar", "hello"];
		const result = palindromes.correctAnswer("test", list);
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
		const question = heterograms.question(list);
		expect(question).toBe(
			"Which of these words are heterograms (comma separated answer): test, racecar, hello",
		);
	});

	test("correctAnswer", () => {
		const list = ["test", "racecar", "buck"];
		const result = heterograms.correctAnswer("buck", list);
		expect(result).toBeTrue();
	});

	test("correct answer multiple", () => {
		const list = ["buck", "racecar", "blow"];
		const result = heterograms.correctAnswer("blow, buck", list);
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
		const question = addTwo.question([1, 2]);
		expect(question).toBe("Calculate the sum of: + 1 2");
	});

	test("correctAnswer", () => {
		const result = addTwo.correctAnswer("5", [2, 3]);
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const result = addTwo.correctAnswer("5", [2, 2]);
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
		const question = subtractTwo.question([1, 2]);
		expect(question).toBe(
			"Calculate the difference (prefix polish notation) of: - 1 2",
		);
	});

	test("correctAnswer", () => {
		const result = subtractTwo.correctAnswer("1", [2, 1]);
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const result = subtractTwo.correctAnswer("5", [2, 2]);
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
		const question = multiplyMultipleNumbers.question(numbers);
		expect(question).toBe(
			"Calculate the product (prefix polish notation) of: * * 2 3 4",
		);
	});

	test("correctAnswer", () => {
		const result = multiplyMultipleNumbers.correctAnswer("24", [2, 3, 4]);
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const result = multiplyMultipleNumbers.correctAnswer("5", [2, 2]);
		expect(result).toBeFalse();
	});
});

describe("multiplyDivideAndAdd", () => {
	test("randomInput", () => {
		const question = multiplyDivideAndAdd.randomInput();
		expect(question).toBeObject();
	});

	test("question", () => {
		const question = multiplyDivideAndAdd.question({
			expression: "* + $ $ - $ $",
			numbers: [1, 2, 3, 4],
		});
		expect(question).toBe(
			"Calculate the result (prefix polish notation) of: * + 1 2 - 3 4",
		);
	});

	test("correctAnswer", () => {
		const result = multiplyDivideAndAdd.correctAnswer("10", {
			expression: "* + $ $ - $ $",
			numbers: [2, 3, 4, 2],
		});
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const result = multiplyDivideAndAdd.correctAnswer("5", {
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
		const question = caesarCipher.question({
			shift,
			sentence,
		});
		expect(question).toBe(
			`Decode sentence with a caesar cipher shift of 3, preserve casing and punctuation: ${encodeCaesarCipher(
				sentence,
				shift,
			)}`,
		);
	});

	test("correctAnswer", () => {
		const result = caesarCipher.correctAnswer("hello", {
			shift: 3,
			sentence: "hello",
		});
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const result = caesarCipher.correctAnswer("foo", {
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
		const question = missingNumber.question(list);
		expect(question).toBe(
			"What number is missing from the sequence: 1, 2, 3, 5",
		);
	});

	test("correctAnswer", () => {
		const result = missingNumber.correctAnswer("4", [[1, 2, 3, 5], 4]);
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const result = missingNumber.correctAnswer("5", [[1, 2, 3, 5], 4]);
		expect(result).toBeFalse();
	});
});

describe("maximumProductOfTwoNumbers", () => {
	test("randomInput", () => {
		const list = maximumProductOfTwoNumbers.randomInput();
		expect(Array.isArray(list)).toBeTrue();
	});

	test("question", () => {
		const list = [1, 2, 3, 4, 5];
		const question = maximumProductOfTwoNumbers.question(list);
		expect(question).toBe(
			"What is the maximum product of two numbers from the list: 1, 2, 3, 4, 5",
		);
	});

	test("correctAnswer", () => {
		const result = maximumProductOfTwoNumbers.correctAnswer(
			"20",
			[1, 2, 3, 4, 5],
		);
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const result = maximumProductOfTwoNumbers.correctAnswer(
			"10",
			[1, 2, 3, 4, 5],
		);
		expect(result).toBeFalse();
	});

	test("correctAnswer unsorted list", () => {
		const result = maximumProductOfTwoNumbers.correctAnswer(
			"20",
			[5, 4, 3, 2, 1],
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
		const question = numeronym.question(word);
		expect(question).toBe(
			"What is the numerical contraction numeronym (e.g. accessibility -> a11y) for: accessibility",
		);
	});

	test("correctAnswer", () => {
		const result = numeronym.correctAnswer("a11y", "accessibility");
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const result = numeronym.correctAnswer("a12y", "accessibility");
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
		const question = runLengthEncoding.question(word);
		expect(question).toBe(
			"What is the run length encoding (e.g. aabbc -> a2b2c1) of: aaabcc",
		);
	});

	test("correctAnswer", () => {
		const result = runLengthEncoding.correctAnswer("a3b1c2", "aaabcc");
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const result = runLengthEncoding.correctAnswer("a1b2", "aaabcc");
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
		const question = binaryToDecimal.question(number);
		expect(question).toBe(
			"What is the decimal value of the binary number: 101",
		);
	});

	test("correctAnswer", () => {
		const result = binaryToDecimal.correctAnswer("5", "101");
		expect(result).toBeTrue();
	});

	test("correctAnswer zero", () => {
		const result = binaryToDecimal.correctAnswer("0", "0");
		expect(result).toBeTrue();
	});

	test("correctAnswer 10111001101101", () => {
		const result = binaryToDecimal.correctAnswer("11885", "10111001101101");
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const result = binaryToDecimal.correctAnswer("6", "101");
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
		const question = morseCodeDecoder.question(sentence);
		expect(question).toBe(
			"What is the decoded message from morse code (3 spaces = space): .... . .-.. .-.. ---",
		);
	});

	test("correctAnswer", () => {
		const result = morseCodeDecoder.correctAnswer(
			"hello",
			".... . .-.. .-.. ---",
		);
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const result = morseCodeDecoder.correctAnswer(
			"world",
			".... . .-.. .-.. ---",
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
		const question = happyNumber.question({
			number,
			randomNumbers,
		});
		expect(question).toBe(
			"Which of these numbers is a happy number: 1, 2, 3, 19, 4, 5",
		);
	});

	test("correctAnswer", () => {
		const result = happyNumber.correctAnswer("19", {
			number: 19,
			randomNumbers: [1, 2, 3, 19, 4, 5],
		});
		expect(result).toBeTrue();
	});

	test("incorrectAnswer", () => {
		const result = happyNumber.correctAnswer("23", {
			number: 19,
			randomNumbers: [1, 2, 3, 19, 4, 5],
		});
		expect(result).toBeFalse();
	});
});
