"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherNav = void 0;
class WeatherNav extends HTMLElement {
    constructor() {
        super();
        this._onClick = () => {
            throw 'WeatherDays : effect not set.';
        };
        this.days = WeatherNav._days.cloneNode(true);
        this.appendChild(this.days);
    }
    connectedCallback() {
        this.days.textContent = 'Loading ...';
    }
    setOnClick(effect) {
        this._onClick = effect;
        return this;
    }
    render(timestamps, max) {
        const days = WeatherNav._days.cloneNode(true);
        for (let i = 0, length = Math.min(timestamps.length, max); i < length; i++) {
            const button = WeatherNav._button.cloneNode(true);
            button.textContent = new Date(timestamps[i] * 1000).toLocaleDateString(navigator.language, {
                weekday: 'long',
            });
            button.onclick = (e) => {
                this._onClick(i);
                e.preventDefault();
            };
            days.appendChild(button);
        }
        this.replaceChild(days, this.days);
        return this;
    }
}
exports.WeatherNav = WeatherNav;
WeatherNav._button = (() => {
    const t = document.createElement('a');
    t.classList.add('day-button');
    return t;
})();
WeatherNav._days = (() => {
    const t = document.createElement('div');
    t.classList.add('card-action', 'day-nav');
    return t;
})();
customElements.define('weather-nav', WeatherNav);
