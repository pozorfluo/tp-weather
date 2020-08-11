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

  /** newForecast not called if loc === null, safe to cast to quiet linter */
  return forecasts !== null ? newForecast(<GeoInfo>loc, forecasts) : null;
}

//----------------------------------------------------------------- main ---
/**
 * Run the app !
 */
window.addEventListener('DOMContentLoaded', function (event: Event) {
  getWeather()
    .then((forecasts) => {
      app.observables.forecasts.set(forecasts);
      app.observables.day.set(0);
    })
    .catch((err) => {
      console.log(err);
    });

  const renderForecast = function (f: Forecast, day: number): void {
    const d = day === 0 ? f.current : f.daily[Math.min(day, 7)];
    view.observables.city.set(f.city);
    view.observables.icon.set('icons/' + d.icon);
    view.observables.temp.set(`${d.temperature}°`);
    view.observables.wind.set(`Vent ${d.windSpeed}km/h (${d.windDeg}°)`);
  };

  const renderDaysNav = function (f: Forecast): void {
    const fragment = document.createDocumentFragment();
    const button = document.createElement('a');
    button.classList.add('day-button');

    for (let i = 0, length = f.daily.length; i < length; i++) {
      const day = new Date(f.daily[i].timestamp * 1000);
      const day_button = button.cloneNode(true);
      day_button.textContent = day.toLocaleDateString(navigator.language, {
        weekday: 'long',
      });
      day_button.addEventListener('click', (e) => {
        app.observables.day.set(i);
        e.preventDefault();
      });
      fragment.appendChild(day_button);
    }
    days_nav.appendChild(fragment);
  };

  const app = newContext()
    .put('forecasts', newObservable<Forecast | null>(null), (f) => {
      renderForecast(f, 0);
      renderDaysNav(f);
    })
    .put('day', newObservable<number>(0), (d) => {
      renderForecast(app.observables.forecasts.value, d);
    });

  const view = newContext()
    .put('city', newObservable<string>('...'))
    .put(
      'icon',
      newObservable<string>(
        'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
      )
    )
    .put('temp', newObservable<string>('...°'))
    .put('wind', newObservable<string>('Vent ...km/h (...°)'))
    .put('date', newObservable<Date>(new Date()))
    .put('day', newObservable<number>(0))
    .musterPins()
    .activatePins()
    .refresh();

  const days_nav =
    document.querySelector('.day-nav') ?? document.createElement('div');
}); /* DOMContentLoaded */
