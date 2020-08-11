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
    const forecasts = loc !== null ? await weather_1.getDailyForecasts(loc, api_keys) : null;
    /** newForecast not called if loc === null, safe to cast to quiet linter */
    return forecasts !== null ? weather_1.newForecast(loc, forecasts) : null;
}
//----------------------------------------------------------------- main ---
/**
 * Run the app !
 *
 */
window.addEventListener('DOMContentLoaded', function (event) {
    const startTime = performance.now();
    const view = app_solo_1.newContext()
        .put('city', app_solo_1.newObservable('...'))
        .put('icon', app_solo_1.newObservable('icons/cloudy.svg'))
        .put('temp', app_solo_1.newObservable('...°'))
        .put('wind', app_solo_1.newObservable('Vent ...km/h (...°)')) //newObservable<Object>({ speed: '', deg: '' })
        .put('date', app_solo_1.newObservable(new Date()))
        .put('day', app_solo_1.newObservable(0))
        .musterPins()
        .activatePins()
        .refresh();
    console.log(performance.now() - startTime + 'ms : context set and view refreshed.');
    const app = app_solo_1.newContext()
        .put('forecasts', app_solo_1.newObservable(null));
    getWeather()
        .then((forecasts) => {
        app.observables.forecasts.set(forecasts);
        console.log(forecasts);
        console.log(Object.is(app.observables.forecasts, app.observables_iterator[0][1]));
        console.log(app.observables.forecasts === app.observables_iterator[0][1]);
    })
        .catch((err) => {
        console.log(err);
    });
    // context.observables.city.set('hello');
    // context.observables.icon.set('icons/rainy.svg');
    // const app =
    //   document.querySelector('.weather') ?? document.createElement('section');
    // const owm_response = document.createElement('pre');
    // owm_response.textContent = 'pending';
    // app.appendChild(owm_response);
    //   owm_response.textContent = 'working ...';
}); /* DOMContentLoaded */
// })(); /* IIFE */
