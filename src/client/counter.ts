import { diffNow, formatDuration } from "../helpers/helpers";

/**
 * cmc-counter is a custom element that displays a live counter.
 * It takes a dateTime attribute that specifies the start time of the counter.
 * If count is set to true, the counter will update every second.
 * @element cmc-counter
 */
export class CmcCounter extends HTMLElement {
  private _dateTime: string | undefined;
  private _count: boolean | undefined;
  private _timerId: number | undefined;

  static get observedAttributes() {
    return ["date-time", "count"];
  }

  get dateTime() {
    return this._dateTime;
  }

  set dateTime(value: string | undefined) {
    this._dateTime = value;
  }

  get count() {
    return this._count;
  }

  set count(value: boolean | undefined) {
    this._count = value;
    if (this._count) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (this.count) {
      this.startTimer();
    }
  }

  disconnectedCallback() {
    this.stopTimer();
  }

  attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown) {
    if (oldValue !== newValue) {
      if (name === "date-time" && typeof newValue === "string") {
        this.dateTime = newValue;
      } else if (name === "count" && newValue === "true") {
        this.count = true;
      }
    }
    this.render();
  }

  private startTimer() {
    this.stopTimer();
    this._timerId = window.setInterval(() => {
      this.render();
    }, 1000);
  }

  private stopTimer() {
    if (this._timerId !== undefined) {
      clearInterval(this._timerId);
      this._timerId = undefined;
    }
  }

  private render() {
    if (this.shadowRoot) {
      const diff = this.dateTime ? diffNow(new Date(this.dateTime)) : 0;
      const formatted = formatDuration(diff);
      this.shadowRoot.innerHTML = `${formatted}`;
    }
  }
}
