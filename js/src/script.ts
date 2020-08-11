import { extend } from './komrad';
import {
  Observable,
  withObservable,
  newObservable,
  newContext,
} from './app-solo';

import { geoLocate, GeoInfo } from './geo';
import { getDailyForecasts, Forecast, newForecast } from './weather';

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

async function getWeather(): Promise<Forecast | null> {
  console.log('getApiKeys()');
  const api_keys = await getApiKeys();
  console.log('geoLocate()');
  const loc = await geoLocate(api_keys);
  console.log('getDailyForecasts()');
  const forecasts = loc !== null ? await getDailyForecasts(loc, api_keys) : null;
  
  /** newForecast not called if loc === null, safe to cast to quiet linter */
  return forecasts !== null ? newForecast(<GeoInfo>loc, forecasts) : null;
}

//----------------------------------------------------------------- main ---
/**
 * Run the app !
 *
 */
window.addEventListener('DOMContentLoaded', function (event: Event) {
  const startTime = performance.now();

  const view = newContext()
    .put('city', newObservable<string>('...'))
    .put('icon', newObservable<string>('icons/cloudy.svg'))
    .put('temp', newObservable<string>('...°'))
    .put('wind', newObservable<string>('Vent ...km/h (...°)')) //newObservable<Object>({ speed: '', deg: '' })
    .put('date', newObservable<Date>(new Date()))
    .put('day', newObservable<number>(0))
    .musterPins()
    .activatePins()
    .refresh();


    console.log(
      performance.now() - startTime + 'ms : context set and view refreshed.'
    );

  const app = newContext()
  .put('forecasts', newObservable<Forecast | null>(null));

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
