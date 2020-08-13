"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_solo_1 = require("./lib/app-solo");
const geo_1 = require("./geo");
const weather_1 = require("./weather");
require("./components/weather-nav");
require("./components/img-spinner");
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
    const day_count = 5;
    getWeather()
        .then((forecasts) => {
        app.pins.forecasts.set(forecasts);
        app.pins.day.set(0);
    })
        .catch((err) => {
        console.log(err);
    });
    const renderForecast = function (f, day) {
        const d = day === 0 ? f.current : f.daily[Math.min(day, day_count)];
        view.pins.city.set(f.city);
        view.pins.icon.set('icons/' + d.icon);
        view.pins.temp.set(`${d.temperature}°`);
        view.pins.wind.set(`Vent ${d.windSpeed}km/h (${d.windDeg}°)`);
        view.pins.loading.set('');
    };
    const app = app_solo_1.newContext()
        .pub('forecasts', app_solo_1.newObservable(null), (f) => {
        renderForecast(f, 0);
        weather_nav.setOnClick(app.pins.day.set);
        weather_nav.render(f.daily.map((d) => d.timestamp), day_count);
    })
        .pub('day', app_solo_1.newObservable(0), (d) => {
        renderForecast(app.pins.forecasts.value, d);
    });
    const view = app_solo_1.newContext()
        .pub('city', app_solo_1.newObservable('...'))
        .pub('icon', app_solo_1.newObservable(''))
        .pub('temp', app_solo_1.newObservable('...°'))
        .pub('wind', app_solo_1.newObservable('Vent ...km/h (...°)'))
        .pub('date', app_solo_1.newObservable(new Date()))
        .pub('day', app_solo_1.newObservable(0))
        .pub('loading', app_solo_1.newObservable('loading'))
        .musterSubs(document)
        .activateSubs();
    const weather_nav = document.querySelector('weather-nav');
    const key = 'data-pub-name';
    console.log(key.split('-'));
    console.log('howdy');
});
