import { Forecast } from './weather';

export class WeatherDays extends HTMLElement {
  static _button: HTMLElement = (() => {
    const t = document.createElement('a');
     t.classList.add('day-button');
    return t;
  })();

  static _days: HTMLElement = (() => {
    const t = document.createElement('div');
    t.classList.add('card-action', 'day-nav');
    return t;
  })();

  _effect: (i: number) => void = () => {
    throw 'WeatherDays : effect not set.';
  };
  days: HTMLElement;

  constructor() {
    super();
    this.days = <HTMLElement>WeatherDays._days.cloneNode(true);
    this.appendChild(this.days);
  }

  connectedCallback() {
    this.days.textContent = 'Loading ...';
  }

  setEffect(effect: (i: number) => void): this {
    this._effect = effect;
    return this;
  }

  render(f: Forecast, max: number): this {
    const days = <HTMLElement>WeatherDays._days.cloneNode(true);
    for (let i = 0, length = Math.min(f.daily.length, max); i < length; i++) {
      const button = <HTMLElement>WeatherDays._button.cloneNode(true);
      button.textContent = new Date(
        f.daily[i].timestamp * 1000
      ).toLocaleDateString(navigator.language, {
        weekday: 'long',
      });

      button.onclick = (e: Event): void => {
        this._effect(i);
        e.preventDefault();
      };

      days.appendChild(button);
    }

    this.replaceChild(days, this.days);
    return this;
  }
}

customElements.define('weather-days', WeatherDays);
// (function () {
// })();
