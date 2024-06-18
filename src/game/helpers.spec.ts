import { describe, expect, test } from "bun:test";

import {
	decodeCaesarCipher,
	decodeMorse,
	encodeCaesarCipher,
	encodeMorse,
	evaluatePolishNotation,
	generateHappyNumbers,
	generateUnhappyNumbers,
	isHappy,
} from "./helpers";

describe("evaluatePolishNotation", () => {
	test("simple addition", () => {
		const result = evaluatePolishNotation("+ 1 2");
		expect(result).toBe(3);
	});

	test("simple subtraction", () => {
		const result = evaluatePolishNotation("- 2 1");
		expect(result).toBe(1);
	});

	test("simple multiplication", () => {
		const result = evaluatePolishNotation("* 2 3");
		expect(result).toBe(6);
	});

	test("simple division", () => {
		const result = evaluatePolishNotation("/ 6 3");
		expect(result).toBe(2);
	});

	test("complex expression", () => {
		const result = evaluatePolishNotation("+ 1 * 2 3");
		expect(result).toBe(7);
	});

	test("complex multiplication", () => {
		const result = evaluatePolishNotation("* * 2 3 4");
		expect(result).toBe(24);
	});

	test("mixed expression", () => {
		const result = evaluatePolishNotation("* + 2 3  / 4 2");
		expect(result).toBe(10);
	});
});

describe("encodeCaesarCipher", () => {
	test("simple shift", () => {
		const result = encodeCaesarCipher("hello", 3);
		expect(result).toBe("khoor");
	});

	test("wrap around", () => {
		const result = encodeCaesarCipher("xyz", 3);
		expect(result).toBe("abc");
	});

	test("mixed case", () => {
		const result = encodeCaesarCipher("Hello World", 3);
		expect(result).toBe("Khoor Zruog");
	});

	test("preserves non-alphabetic characters", () => {
		const result = encodeCaesarCipher("Hello, World!", 3);
		expect(result).toBe("Khoor, Zruog!");
	});

	test("decoding and encoding are inverse operations", () => {
		const text = "Programming: where 'It works on my machine' is enough.";
		const shift = 3;
		const encoded = encodeCaesarCipher(text, shift);
		const decoded = decodeCaesarCipher(encoded, shift);
		expect(decoded).toBe(text);
	});
});

describe("decodeCaesarCipher", () => {
	test("simple shift", () => {
		const result = decodeCaesarCipher("khoor", 3);
		expect(result).toBe("hello");
	});

	test("wrap around", () => {
		const result = decodeCaesarCipher("abc", 3);
		expect(result).toBe("xyz");
	});

	test("mixed case", () => {
		const result = decodeCaesarCipher("Khoor Zruog", 3);
		expect(result).toBe("Hello World");
	});

	test("preserves non-alphabetic characters", () => {
		const result = decodeCaesarCipher("Khoor, Zruog!", 3);
		expect(result).toBe("Hello, World!");
	});

	test("decoding and encoding are inverse operations", () => {
		const encoded = "zkhuh 'Lw zrunv rq pb pdfklqh' lv hqrxjk.";
		const shift = 3;
		const decoded = decodeCaesarCipher(encoded, shift);
		const encodedAgain = encodeCaesarCipher(decoded, shift);
		expect(encodedAgain).toBe(encoded);
	});
});

describe("decodeMorse", () => {
	test("simple word", () => {
		const result = decodeMorse(".... . .-.. .-.. ---");
		expect(result).toBe("hello");
	});

	test("simple sentence", () => {
		const result = decodeMorse(".... . .-.. .-.. ---   .-- --- .-. .-.. -..");
		expect(result).toBe("hello world");
	});
});

describe("encodeMorse", () => {
	test("simple word", () => {
		const result = encodeMorse("hello world");
		expect(result).toBe(".... . .-.. .-.. ---   .-- --- .-. .-.. -..");
	});

	test("decoding and encoding are inverse operations", () => {
		const text = "hello world";
		const encoded = encodeMorse(text);
		const decoded = decodeMorse(encoded);
		expect(decoded).toBe(text);
	});
});

describe("isHappy", () => {
	test("1 is happy", () => {
		const result = isHappy(1);
		expect(result).toBe(true);
	});

	test("19 is happy", () => {
		const result = isHappy(19);
		expect(result).toBe(true);
	});

	test("20 is not happy", () => {
		const result = isHappy(20);
		expect(result).toBe(false);
	});

	test("21 is not happy", () => {
		const result = isHappy(21);
		expect(result).toBe(false);
	});
});

describe("generateHappyNumbers", () => {
	test("first 5 happy numbers", () => {
		const result = generateHappyNumbers(5);
		expect(result).toEqual([1, 7, 10, 13, 19]);
	});
});

describe("generateUnhappyNumbers", () => {
	test("first 5 unhappy numbers", () => {
		const result = generateUnhappyNumbers(5);
		expect(result).toEqual([2, 3, 4, 5, 6]);
	});
});
