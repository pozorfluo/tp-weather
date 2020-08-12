import { newObservable, newContext } from './app-solo';
import { geoLocate, GeoInfo } from './geo';
import { getDailyForecasts, Forecast, newForecast } from './weather';
import {
  div,
  a,
  button,
  h1,
  h2,
  h3,
  h4,
  h5,
  header,
  p,
  span,
} from './elements';

import './weather-days';

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
      app.pins.forecasts.set(forecasts);
      app.pins.day.set(0);
    })
    .catch((err) => {
      console.log(err);
    });
  //----------------------------------------------- render functions ---
  const renderForecast = function (f: Forecast, day: number): void {
    const d = day === 0 ? f.current : f.daily[Math.min(day, 7)];
    view.pins.city.set(f.city);
    view.pins.icon.set('icons/' + d.icon);
    view.pins.temp.set(`${d.temperature}°`);
    view.pins.wind.set(`Vent ${d.windSpeed}km/h (${d.windDeg}°)`);
    view.pins.loading.set('');
  };

  const renderDaysNav = function (f: Forecast): void {
    const fragment = document.createDocumentFragment();
    // const button = document.createElement('a');
    // button.classList.add('day-button');

    for (let i = 0, length = Math.min(f.daily.length, 5); i < length; i++) {
      //   const day = new Date(f.daily[i].timestamp * 1000);
      //   const day_button = button.cloneNode(true);
      //   day_button.textContent = day.toLocaleDateString(navigator.language, {
      //     weekday: 'long',
      //   });
      //   day_button.addEventListener('click', (e) => {
      //     app.pins.day.set(i);
      //     e.preventDefault();
      //   });
      //   fragment.appendChild(day_button);
      fragment.appendChild(
        a(
          {
            className: 'day-button',
            onclick: (e: Event) => {
              app.pins.day.set(i);
              e.preventDefault();
            },
          },
          new Date(f.daily[i].timestamp * 1000).toLocaleDateString(
            navigator.language,
            {
              weekday: 'long',
            }
          )
        )
      );
    }
    days_nav.appendChild(fragment);
  };
  //------------------------------------------------------- contexts ---
  const app = newContext()
    .pub('forecasts', newObservable<Forecast | null>(null), (f) => {
      renderForecast(f, 0);
      renderDaysNav(f);
    })
    .pub('day', newObservable<number>(0), (d) => {
      renderForecast(app.pins.forecasts.value, d);
    });

  const view = newContext()
    .pub('city', newObservable<string>('...'))
    .pub(
      'icon',
      newObservable<string>(
        'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
      )
    )
    .pub('temp', newObservable<string>('...°'))
    .pub('wind', newObservable<string>('Vent ...km/h (...°)'))
    .pub('date', newObservable<Date>(new Date()))
    .pub('day', newObservable<number>(0))
    .pub('loading', newObservable<string>('loading'))
    .musterSubs(document)
    .activateSubs()
    .refresh();

  const days_nav =
    document.querySelector('.day-nav') ?? document.createElement('div');

  console.log(navigator.language);
}); /* DOMContentLoaded */
