import { extend } from './komrad';
import {
  Observable,
  withObservable,
  newObservable,
  newContext,
} from './app-solo';

import { geoLocate } from './geo';
import { getDailyForecasts, OWMOneCallResponse } from './weather';

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

async function getWeather(): Promise<OWMOneCallResponse | null> {
  console.log('getApiKeys()');
  const api_keys = await getApiKeys();
  console.log('geoLocate()');
  const loc = await geoLocate(api_keys);
  console.log('getDailyForecasts()');
  const forecasts = loc !== null ? getDailyForecasts(loc, api_keys) : null;
  // throw 'boom';
  // console.log(forecasts);
  return forecasts;
}


//----------------------------------------------------------------- main ---
/**
 * Run the app !
 *
 */
window.addEventListener('DOMContentLoaded', async function (event: Event) {
  const startTime = performance.now();
  const app =
    document.querySelector('.weather') ?? document.createElement('section');
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
