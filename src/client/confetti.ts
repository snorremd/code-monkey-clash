/**
 * This module contains logic to render confetti on the screen.
 * It draws to a canvas element and draws confetti using Canvas
 * draw paths.
 *
 * Each confetti is modeled as a set of properties each being a 64 bit float with properties:
 * - 0 radius: radius of the particle
 * - 1 color: color index of the particle
 * - 2 xSpeed: horizontal speed of the particle
 * - 3 ySpeed: vertical speed of the particle
 * - 4 rSpeed: rotation speed of the particle
 * - 5 xAmplitude: horizontal flutter amplitude of the particle
 * - 6 yAmplitude: vertical flutter amplitude of the particle
 * - 7 x: x-coordinate of the particle
 * - 8 y: y-coordinate of the particle
 * - 9 tilt: tilt of the particle (angle)
 *
 * This makes each confetti particle 10  * 8 = 80 bytes in size taking 10 spaces in a Float64Array.
 * Given 500 particles this would take about 39KB of memory fitting nicely in any CPU cache. This
 * should make the calculations for each particle very fast.
 */

/** Width of one confetti's parameters */
const confettiWidth = 10;
const radiusOffset = 0;
const colorOffset = 1;
const xSpeedOffset = 2;
const ySpeedOffset = 3;
const rSpeedOffset = 4;
const xAmplitudeOffset = 5;
const yAmplitudeOffset = 6;
const xOffset = 7;
const yOffset = 8;
const tiltOffset = 9;

/** Number of confettis to draw */
const confettiCount = 5000;

/** Confetti colors from Daisy UI */
const colors = [
	"#1fb2a6", // Primary
	"#e879f9", // Secondary
	"#fcd34d", // Accent
	"#f87171", // Neutral
	"#60a5fa", // Info
	"#34d399", // Success
	"#fb923c", // Warning
	"#f87171", // Error
] as const;

/**
 * The main function to start the confetti animation.
 * Accepts a canvas element to draw the confetti on.
 *
 *
 * @param canvas the canvas element to draw the confetti on
 */
export function startConfetti(canvas: HTMLCanvasElement) {
	// biome-ignore lint/style/noNonNullAssertion: 2d context is always available
	const ctx = canvas.getContext("2d")!;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Create an array of confetti particles
	const confetti = new Float64Array(confettiCount * confettiWidth);

	for (let i = 0; i < confettiCount; i++) {
		// Initialize each confetti particle with random properties
		const index = i * confettiWidth;
		confetti[index + radiusOffset] = Math.random() * 10 + 10; // radius
		confetti[index + colorOffset] = Math.floor(Math.random() * colors.length); // color
		confetti[index + xSpeedOffset] = Math.random() * 2 - 1; // xSpeed
		confetti[index + ySpeedOffset] = Math.random() * 2 + 1; // ySpeed
		confetti[index + rSpeedOffset] = Math.random() * 0.1 - 0.05; // rSpeed
		confetti[index + xAmplitudeOffset] = Math.random() * 2 - 1; // xAmplitude
		confetti[index + yAmplitudeOffset] = Math.random() * 2 - 1; // yAmplitude
		confetti[index + xOffset] = Math.random() * canvas.width; // Start x-coordinate
		confetti[index + yOffset] = Math.random() * canvas.height - canvas.height; // Start y-coordinate
		confetti[index + tiltOffset] = Math.random() * 10 - 5; // Start tilt
	}

	let time = 0;

	function drawConfetti() {
		requestAnimationFrame(drawConfetti);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		time += 0.06;

		for (let i = 0; i < confettiCount; i++) {
			// Get the properties of the confetti particle
			const index = i * confettiWidth;
			const radius = confetti[index + radiusOffset];
			const color = colors[confetti[index + colorOffset]];
			const xSpeed = confetti[index + xSpeedOffset];
			const ySpeed = confetti[index + ySpeedOffset];
			const rSpeed = confetti[index + rSpeedOffset];
			const xAmplitude = confetti[index + xAmplitudeOffset];
			const yAmplitude = confetti[index + yAmplitudeOffset];

			let x = confetti[index + xOffset];
			let y = confetti[index + yOffset];
			let tilt = confetti[index + tiltOffset];

			// Draw the confetti particle
			ctx.beginPath();
			ctx.lineWidth = radius / 2;
			ctx.strokeStyle = color;
			ctx.moveTo(x + tilt + radius / 4, y);
			ctx.lineTo(x + tilt, y + tilt + radius / 4);
			ctx.stroke();

			// Update the properties of the confetti particle
			y += ySpeed; // Move the particle down
			x += xSpeed; // Move the particle right
			tilt += rSpeed; // Rotate the particle
			x += Math.sin(i + time) * xAmplitude; // Flutter horizontally
			y += Math.cos(i + time) * yAmplitude; // Flutter vertically

			// Update the properties of the confetti particle
			confetti[index + xOffset] = x;
			confetti[index + yOffset] = y;

			if (y > canvas.height) {
				confetti[index + xOffset] = Math.random() * canvas.width;
				confetti[index + yOffset] = -20;
				confetti[index + tiltOffset] = Math.random() * 10 - 5;
			}
		}
	}

	drawConfetti();
}
