import { CmcCounter } from "../client/client";

declare global {
	namespace JSX {
		// Necessary overrides for Web Components to be used in JSX
		interface IntrinsicElements {
			"cmc-counter": {
				count?: "true" | "false";
				"date-time"?: string;
			};
		}
	}
}
