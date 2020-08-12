"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherDays = void 0;
class WeatherDays extends HTMLElement {
    constructor() {
        super();
        this._effect = () => {
            throw 'WeatherDays : effect not set.';
        };
        this.days = WeatherDays._days.cloneNode(true);
        this.appendChild(this.days);
    }
    connectedCallback() {
        this.days.textContent = 'Loading ...';
    }
    setEffect(effect) {
        this._effect = effect;
        return this;
    }
    render(f, max) {
        const days = WeatherDays._days.cloneNode(true);
        for (let i = 0, length = Math.min(f.daily.length, max); i < length; i++) {
            const button = WeatherDays._button.cloneNode(true);
            button.textContent = new Date(f.daily[i].timestamp * 1000).toLocaleDateString(navigator.language, {
                weekday: 'long',
            });
            button.onclick = (e) => {
                this._effect(i);
                e.preventDefault();
            };
            days.appendChild(button);
        }
        this.replaceChild(days, this.days);
        return this;
    }
}
exports.WeatherDays = WeatherDays;
WeatherDays._button = (() => {
    const t = document.createElement('a');
    t.classList.add('day-button');
    return t;
})();
WeatherDays._days = (() => {
    const t = document.createElement('div');
    t.classList.add('card-action', 'day-nav');
    return t;
})();
customElements.define('weather-days', WeatherDays);
