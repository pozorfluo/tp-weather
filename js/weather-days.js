"use strict";
class WeatherDays extends HTMLElement {
    constructor() {
        super();
        const button = document.createElement('a');
        button.classList.add('day-button');
        button.textContent = 'Now';
        this.appendChild(button);
    }
}
customElements.define('weather-days', WeatherDays);
