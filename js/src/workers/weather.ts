//--------------------------------------------------------------- weather.ts ---
/**
 *
 */
import { geoLocate, GeoInfo } from '../geo';
import { getDailyForecasts, Forecast, newForecast } from '../weather';

/** Alias for this worker context. */
const worker: Worker = <any>self;

console.log('hello from weather worker');
worker.addEventListener('message', (e) => {
  // worker.postMessage(e.data * 2);
  getWeather()
    .then((forecasts) => {
      worker.postMessage({forecasts});
    })
    .catch((err) => {
      console.log(err);
    });
});

/**
 * Workaround commiting api keys to git for this exercise.
 */
async function getApiKeys() {
  const api_keys = await fetch('/../keys.env', { mode: 'no-cors' })
    .then((response) => response.json())
    .then((json) => {
      return json;
    })
    .catch((error) => console.log(error));
  return api_keys;
}

async function getWeather(): Promise<Forecast | null> {
  const api_keys = await getApiKeys();
  const loc = await geoLocate(api_keys);
  const forecasts =
    loc !== null ? await getDailyForecasts(loc, api_keys) : null;
  /** newForecast not called if loc === null, safe to 'cast' to quiet linter */
  return forecasts !== null ? newForecast(<GeoInfo>loc, forecasts) : null;
}
