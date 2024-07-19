/**
 * This module contains logic to render confetti on the screen.
 * It draws to a canvas element and draws confetti using Canvas
 * draw paths.
 *
 * Each confetti is modeled as a particle with position coordinates,
 * color, tilt, rotation and other properties. We use requestAnimationFrame
 * to make a render loop that updates the position of each confetti particle
 * and redraws the canvas.
 */

/** Number of confettis to draw */
const confettiCount = 500;

/** Adjust the vertical speed of the confetti */
const speedFactor = -2;

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

type Color = (typeof colors)[number];

/**
 * The TypeScript interface for a confetti particle.
 * Defines properties and methods for a single confetti particle.
 */
interface ConfettiParticle {
	/** Canvas element to draw to */
	canvas: HTMLCanvasElement;
	/** The Canvas 2D context */
	ctx: CanvasRenderingContext2D;
	/** x-coordinate of the particle */
	x: number;
	/** y-coordinate of the particle */
	y: number;
	/** Radius of the particle */
	r: number;
	/** Affects vertical and horizontal velocity/speed */
	d: number;
	/** Color of the particle */
	color: Color;
	/** Tilt of the particle */
	tilt: number;
	/** Draw the particle on the canvas */
	draw: () => void;
}

class ConfettiParticleImpl implements ConfettiParticle {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	x: number;
	y: number;
	r: number;
	d: number;
	color: Color;
	tilt: number;

	/**
	 * Create a new confetti particle with random position and movement properties.
	 * @param canvas The canvas element to draw the confetti particle on
	 * @param confettiCount The index count of this confetti particle to introduce randomness
	 */
	constructor(canvas: HTMLCanvasElement, confettiCount: number) {
		this.canvas = canvas;
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		this.ctx = canvas.getContext("2d")!;
		this.x = Math.random() * this.canvas.width;
		this.y = Math.random() * this.canvas.height - canvas.height;
		this.r = Math.random() * 10 + 10;
		this.d = Math.random() * confettiCount;
		this.color = colors[Math.floor(Math.random() * colors.length)];
		this.tilt = Math.floor(Math.random() * 10) - 10;
	}

	draw() {
		// Draw the confetti particle using a path
		this.ctx.beginPath(); // Start a new path
		this.ctx.lineWidth = this.r / 2; // Sets thickness for lines in this 2D Canvas Context to half the radius of the particle
		this.ctx.strokeStyle = this.color; // Sets the color used to stroke the lines of the path to the particle's color
		this.ctx.moveTo(this.x + this.tilt + this.r / 4, this.y); // Begin new sub-path at the left edge of the particle
		this.ctx.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 4); // Add a line to the right edge of the particle
		this.ctx.stroke(); // Draw the stroke of the path using defined styles
	}
}

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
	const confettis: ConfettiParticle[] = [];

	for (let i = 0; i < confettiCount; i++) {
		confettis.push(new ConfettiParticleImpl(canvas, i));
	}

	// Inner confetti loop function to draw the confetti on each requestAnimationFrame
	function drawConfetti() {
		requestAnimationFrame(drawConfetti);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (let i = 0; i < confettiCount; i++) {
			const confetti = confettis[i];
			confetti.y += (Math.cos(confetti.d) + speedFactor + confetti.r / 2) / 2;
			confetti.x += Math.sin(confetti.d);

			confetti.draw();

			if (confetti.y > canvas.height) {
				confetti.x = Math.random() * canvas.width;
				confetti.y = -20;
				confetti.tilt = Math.floor(Math.random() * 10) - 10;
			}
		}
	}

	drawConfetti();
}
