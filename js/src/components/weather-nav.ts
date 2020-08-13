export class WeatherNav extends HTMLElement {
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

  _onClick: (i: number) => void = () => {
    throw 'WeatherDays : effect not set.';
  };
  days: HTMLElement;

  constructor() {
    super();
    this.days = <HTMLElement>WeatherNav._days.cloneNode(true);
    this.appendChild(this.days);
  }

  connectedCallback() {
    this.days.textContent = 'Loading ...';
  }

  setOnClick(effect: (i: number) => void): this {
    this._onClick = effect;
    return this;
  }

  // handleClick = (e: Event): void => {
  //   const day = (<Element>e.target).getAttribute?.('data-day') ?? '0';
  //   this._onClick(+day);
  //   e.preventDefault();
  // };

  render(timestamps: number[], max: number): this {
    const days = <HTMLElement>WeatherNav._days.cloneNode(true);
    for (
      let i = 0, length = Math.min(timestamps.length, max);
      i < length;
      i++
    ) {
      const button = <HTMLElement>WeatherNav._button.cloneNode(true);
      button.textContent = new Date(
        timestamps[i]
      ).toLocaleDateString(navigator.language, {
        weekday: 'long',
      });
      
      // button.setAttribute('data-day', i + '');
      button.onclick = (e: Event): void => {
        this._onClick(i);
        e.preventDefault();
      };
      // button.onclick = this.handleClick;

      days.appendChild(button);
    }

    this.replaceChild(days, this.days);
    return this;
  }
}

customElements.define('weather-nav', WeatherNav);
