"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_solo_1 = require("./app-solo");
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
window.addEventListener('DOMContentLoaded', function (event) {
    const startTime = performance.now();
    const context = app_solo_1.newContext()
        .put('city', app_solo_1.newObservable('city pending'))
        .put('icon', app_solo_1.newObservable('icons/snowy.svg'))
        .put('temp', app_solo_1.newObservable('temperature pending'))
        .put('wind', app_solo_1.newObservable({ speed: 'speed pending', deg: 'direction pending' }))
        .put('date', app_solo_1.newObservable(new Date))
        .put('day', app_solo_1.newObservable('day pending'))
        .musterPins()
        .activatePins()
        .refresh();
    // context.observables.city.set('hello');
    // context.observables.icon.set('icons/rainy.svg');
    console.log(context);
    // const app =
    //   document.querySelector('.weather') ?? document.createElement('section');
    // const owm_response = document.createElement('pre');
    // owm_response.textContent = 'pending';
    // app.appendChild(owm_response);
    // getWeather()
    //   .then((forecasts) => {
    //     owm_response.textContent = JSON.stringify(forecasts);
    //   })
    //   .catch((err) => {
    //     owm_response.textContent = err;
    //   });
    //   owm_response.textContent = 'working ...';
}); /* DOMContentLoaded */
// })(); /* IIFE */
