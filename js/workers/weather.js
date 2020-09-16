"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const geo_1 = require("../geo");
const weather_1 = require("../weather");
const worker = self;
console.log('hello from weather worker');
worker.addEventListener('message', (e) => {
    getWeather()
        .then((forecasts) => {
        worker.postMessage({ forecasts });
    })
        .catch((err) => {
        console.log(err);
    });
});
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
