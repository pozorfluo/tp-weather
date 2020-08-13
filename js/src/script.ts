import { newObservable, newContext } from './lib/app-solo';
import { geoLocate, GeoInfo } from './geo';
import { getDailyForecasts, Forecast, Daily, newForecast } from './weather';

import { WeatherNav } from './components/weather-nav';
import './components/weather-nav';
import './components/img-spinner';

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

//----------------------------------------------------------------- main ---
/**
 * Run the app !
 */
window.addEventListener('DOMContentLoaded', function (event: Event) {
  const day_count = 5;

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
    const d = day === 0 ? f.current : f.daily[Math.min(day, day_count)];
    view.pins.city.set(f.city);
    view.pins.icon.set('icons/' + d.icon);
    view.pins.temp.set(`${d.temperature}°`);
    view.pins.wind.set(`Vent ${d.windSpeed}km/h (${d.windDeg}°)`);
    view.pins.loading.set('');
  };

  //------------------------------------------------------- contexts ---
  const weather_nav = <WeatherNav>document.querySelector('weather-nav');
  const weather = <HTMLElement>document.getElementById('Weather');
  const app = newContext()
    .pub('forecasts', newObservable<Forecast | null>(null), (f) => {
      renderForecast(f, 0);
      weather_nav.setOnClick(app.pins.day.set);
      weather_nav.render(
        f.daily.map((d: Daily) => d.timestamp),
        day_count
      );
    })
    .pub('day', newObservable<number>(0), (d) => {
      renderForecast(app.pins.forecasts.value, d);
    });

  const view = newContext()
    .pub('city', newObservable<string>('...'))
    .pub(
      'icon',
      newObservable<string>(
        ''
      )
    )
    // .pub('temp', newObservable<string>('...°'))
    .pub('wind', newObservable<string>('Vent ...km/h (...°)'))
    .pub('date', newObservable<Date>(new Date()))
    .pub('day', newObservable<number>(0))
    .pub('loading', newObservable<string>('loading'))
    .musterPubs(weather)
    .musterSubs(weather)
    .activateSubs()
    // .refresh()
    ;



  console.log(view.pins);
  // <WeatherDays>document.querySelector('weather-nav') ??
  // new WeatherDays();
}); /* DOMContentLoaded */
