"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const geo_1 = require("./geo");
const weather_1 = require("./weather");
/**
 * Workaround commiting api keys to git for this exercise.
 */
async function getApiKeys() {
    // console.log(__dirname);
    const api_keys = await fetch('/../keys.env', { mode: 'no-cors' })
        .then((response) => response.json())
        .then((json) => {
        //   api_keys = json;
        return json;
    })
        .catch((error) => console.log(error));
    // console.log(api_keys);
    return api_keys;
}
async function getWeather() {
    console.log('getApiKeys()');
    const api_keys = await getApiKeys();
    console.log('geoLocate()');
    const loc = await geo_1.geoLocate(api_keys);
    console.log('getDailyForecasts()');
    const forecasts = loc !== null ? weather_1.getDailyForecasts(loc, api_keys) : null;
    // throw 'boom';
    // console.log(forecasts);
    return forecasts;
}
//----------------------------------------------------------------- main ---
/**
 * Run the app !
 *
 */
window.addEventListener('DOMContentLoaded', async function (event) {
    var _a;
    const startTime = performance.now();
    const app = (_a = document.querySelector('.weather')) !== null && _a !== void 0 ? _a : document.createElement('section');
    const owm_response = document.createElement('pre');
    console.log((performance.now() - startTime) + 'ms : setting textContent : pending');
    owm_response.textContent = 'pending';
    console.log((performance.now() - startTime) + 'ms : appendChild');
    app.appendChild(owm_response);
    console.log((performance.now() - startTime) + 'ms : getWeather()');
    getWeather().then((forecasts) => {
        owm_response.textContent = JSON.stringify(forecasts);
    }).catch((err) => {
        owm_response.textContent = err;
    });
    console.log((performance.now() - startTime) + 'ms : setting textContent : working ...');
    owm_response.textContent = 'working ...';
    // console.log(await getWeather());
    // owm_response.textContent = JSON.stringify(await getWeather());
}); /* DOMContentLoaded */
// })(); /* IIFE */
