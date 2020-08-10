"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const geo_1 = require("./geo");
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
//----------------------------------------------------------------- main ---
/**
 * Run the app !
 *
 */
window.addEventListener('DOMContentLoaded', async function (event) {
    var _a;
    const board = (_a = document.querySelector('.weather')) !== null && _a !== void 0 ? _a : document.createElement('section');
    // owm_api_link.href = `https://api.openweathermap.org/data/2.5/weather?lang=fr&units=metric&lat=${lat}&lon=${lon}&appid=${owm_api_key}`;
    // owm_api_link.textContent = `lat : ${lat} | lon : ${lon}`;
    // owm_api_link.href = `https://api.openweathermap.org/data/2.5/weather?lang=fr&units=metric&lat=${lat}&lon=${lon}&appid=${api_key}`;
    // owm_api_link.textContent = `lat : ${lat} | lon : ${lon}`;
    // board.appendChild(owm_api_link);
    // geoLocate().then((value) => console.log(value));
    const api_keys = await getApiKeys();
    const geo_loc = await geo_1.geoLocate(api_keys);
    console.log(geo_loc);
}); /* DOMContentLoaded */
// })(); /* IIFE */
https: ; //api.openweathermap.org/data/2.5/onecall?lang=${country_code}&units=metric&lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${api_key}`
