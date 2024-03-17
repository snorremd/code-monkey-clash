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
