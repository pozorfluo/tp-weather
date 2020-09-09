"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_solo_1 = require("./lib/app-solo");
const geo_1 = require("./geo");
const weather_1 = require("./weather");
require("./components/weather-nav");
require("./components/img-spinner");
require("./components/sprite-player");
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
        view.pins.city.set(f.city + 'x');
        view.pins.city.set(f.city + 'xy');
        view.pins.city.set(f.city + 'xyz');
        view.pins.icon.set('icons/' + d.icon);
        view.pins.temp.set(`${d.temperature}°`);
        view.pins.wind.set(`Vent ${d.windSpeed}km/h (${d.windDeg}°)`);
        view.pins.date.set(new Date(d.timestamp).toLocaleDateString(navigator.language));
        view.pins.loading.set('');
    };
    const weather_nav = document.querySelector('weather-nav');
    const weather = document.getElementById('Weather');
    weather_nav.renderPlaceholder(day_count, '...');
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
        .pub('icon', app_solo_1.newObservable(''))
        .pub('date', app_solo_1.newObservable(''))
        .pub('loading', app_solo_1.newObservable('loading'))
        .muster(weather)
        .activateSubs();
    const rate_limit_test = document.getElementById('RateLimit');
    const rate_limit_btn = document.getElementById('RateLimitBtn');
    const rate_limit = app_solo_1.newContext().muster(rate_limit_test).activateSubs();
    rate_limit_btn.addEventListener('click', (e) => {
        console.log('click ----------------');
        for (let i = 0; i < 10; i++) {
            rate_limit.pins.mouse_x.set(i);
            rate_limit.pins.mouse_y.set(i);
        }
        setTimeout(() => {
            rate_limit.pins.mouse_x.set(77);
            rate_limit.pins.mouse_y.set(44);
        }, 1000);
    });
});
