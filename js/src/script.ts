import { extend } from './komrad';
import {
  Observable,
  withObservable,
  newObservable,
  newContext,
} from './app-solo';

import { geoLocate } from './geo';

//----------------------------------------------------------------- main ---
/**
 * Run the app !
 *
 */
window.addEventListener('DOMContentLoaded', async function (event: Event) {
  const board =
    document.querySelector('.weather') ?? document.createElement('section');
  // owm_api_link.href = `https://api.openweathermap.org/data/2.5/weather?lang=fr&units=metric&lat=${lat}&lon=${lon}&appid=${owm_api_key}`;
  // owm_api_link.textContent = `lat : ${lat} | lon : ${lon}`;
    // owm_api_link.href = `https://api.openweathermap.org/data/2.5/weather?lang=fr&units=metric&lat=${lat}&lon=${lon}&appid=${api_key}`;
  // owm_api_link.textContent = `lat : ${lat} | lon : ${lon}`;
  // board.appendChild(owm_api_link);
  // geoLocate().then((value) => console.log(value));
  const geo_loc = await geoLocate();
  console.log(geo_loc);
}); /* DOMContentLoaded */
// })(); /* IIFE */


https://api.openweathermap.org/data/2.5/onecall?lang=${country_code}&units=metric&lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${api_key}`