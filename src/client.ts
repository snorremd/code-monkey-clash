/** Make a Lit counter component cmc-counter to facilitate live ticker */

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { diffNow, formatDuration } from "./helpers";

@customElement("cmc-counter")
class CmcCounter extends LitElement {
	@property({ type: String })
	dateTime: string | undefined;

	@property({ type: Boolean })
	count: boolean | undefined;

	private timerId: number | undefined;

	render() {
		const diff = this.dateTime ? diffNow(new Date(this.dateTime)) : 0;
		const formatted = formatDuration(diff);

		return html`${formatted}`;
	}

	connectedCallback() {
		super.connectedCallback();
		if (this.count) {
			this.timerId = window.setInterval(() => {
				this.requestUpdate();
			}, 1000);
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if (this.timerId !== undefined) {
			clearInterval(this.timerId);
		}
	}
}
