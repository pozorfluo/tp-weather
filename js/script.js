"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_solo_1 = require("./app-solo");
const geo_1 = require("./geo");
const weather_1 = require("./weather");
async function getApiKeys() {
    const api_keys = await fetch('/../keys.env', { mode: 'no-cors' })
        .then((response) => response.json())
        .then((json) => {
        return json;
    })
        .catch((error) => console.log(error));
    return api_keys;
}
async function getWeather() {
    const api_keys = await getApiKeys();
    const loc = await geo_1.geoLocate(api_keys);
    const forecasts = loc !== null ? await weather_1.getDailyForecasts(loc, api_keys) : null;
    return forecasts !== null ? weather_1.newForecast(loc, forecasts) : null;
}
window.addEventListener('DOMContentLoaded', function (event) {
    var _a;
    getWeather()
        .then((forecasts) => {
        app.observables.forecasts.set(forecasts);
        app.observables.day.set(0);
    })
        .catch((err) => {
        console.log(err);
    });
    const renderForecast = function (f, day) {
        const d = day === 0 ? f.current : f.daily[Math.min(day, 7)];
        view.observables.city.set(f.city);
        view.observables.icon.set('icons/' + d.icon);
        view.observables.temp.set(`${d.temperature}°`);
        view.observables.wind.set(`Vent ${d.windSpeed}km/h (${d.windDeg}°)`);
    };
    const renderDaysNav = function (f) {
        const fragment = document.createDocumentFragment();
        const button = document.createElement('a');
        button.classList.add('day-button');
        for (let i = 0, length = f.daily.length; i < length; i++) {
            const day = new Date(f.daily[i].timestamp * 1000);
            const day_button = button.cloneNode(true);
            day_button.textContent = day.toLocaleDateString(navigator.language, {
                weekday: 'long',
            });
            day_button.addEventListener('click', (e) => {
                app.observables.day.set(i);
                e.preventDefault();
            });
            fragment.appendChild(day_button);
        }
        days_nav.appendChild(fragment);
    };
    const app = app_solo_1.newContext()
        .put('forecasts', app_solo_1.newObservable(null), (f) => {
        renderForecast(f, 0);
        renderDaysNav(f);
    })
        .put('day', app_solo_1.newObservable(0), (d) => {
        renderForecast(app.observables.forecasts.value, d);
    });
    const view = app_solo_1.newContext()
        .put('city', app_solo_1.newObservable('...'))
        .put('icon', app_solo_1.newObservable('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='))
        .put('temp', app_solo_1.newObservable('...°'))
        .put('wind', app_solo_1.newObservable('Vent ...km/h (...°)'))
        .put('date', app_solo_1.newObservable(new Date()))
        .put('day', app_solo_1.newObservable(0))
        .musterPins()
        .activatePins()
        .refresh();
    const days_nav = (_a = document.querySelector('.day-nav')) !== null && _a !== void 0 ? _a : document.createElement('div');
});
