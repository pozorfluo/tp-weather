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
window.addEventListener('DOMContentLoaded', function (event: Event) {
  const startTime = performance.now();

  const context = newContext()
    .put('city', newObservable<string>('city pending'))
    .put('icon', newObservable<string>('icons/snowy.svg'))
    .put('temp', newObservable<string>('temperature pending'))
    .put('wind', newObservable<Object>({speed: 'speed pending', deg: 'direction pending'}))
    .put('date', newObservable<Date>(new Date))
    .put('day', newObservable<string>('day pending'))
    .musterPins()
    .activatePins()
    .refresh()
  ;

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
