import { newObservable, newContext } from './lib/app-solo';
import { geoLocate, GeoInfo } from './geo';
import { getDailyForecasts, Forecast, Daily, newForecast } from './weather';

import { WeatherNav } from './components/weather-nav';
import './components/weather-nav';
import './components/img-spinner';
import './components/sprite-player';

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
  /** @todo Convert 'renderForecast' to web component */
  const renderForecast = function (f: Forecast, day: number): void {
    const d = day === 0 ? f.current : f.daily[Math.min(day, day_count)];
    view.pins.city.set(f.city);
    view.pins.city.set(f.city + 'x');
    view.pins.city.set(f.city + 'xy');
    view.pins.city.set(f.city + 'xyz');
    view.pins.icon.set('icons/' + d.icon);
    view.pins.temp.set(`${d.temperature}°`);
    view.pins.wind.set(`Vent ${d.windSpeed}km/h (${d.windDeg}°)`);
    view.pins.date.set(
      new Date(d.timestamp).toLocaleDateString(navigator.language)
    );
    view.pins.loading.set('');
  };

  //------------------------------------------------------- contexts ---
  const weather_nav = <WeatherNav>document.querySelector('weather-nav');
  const weather = <HTMLElement>document.getElementById('Weather');

  weather_nav.renderPlaceholder(day_count, '...');

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
    .pub('icon', newObservable<string>(''))
    .pub('date', newObservable<string>(''))
    .pub('loading', newObservable<string>('loading'))
    .muster(weather)
    .activateSubs();
  // .refresh()

  //-------------------------------------------------------- rate limit test ---
  const rate_limit_test = <HTMLElement>document.getElementById('RateLimit');
  const rate_limit_btn = <HTMLElement>document.getElementById('RateLimitBtn');
  const rate_limit = newContext().muster(rate_limit_test).activateSubs();

  rate_limit_btn.addEventListener('click', (e) => {
    console.log('click ----------------');

    for (let i = 0; i < 10; i++) {
      rate_limit.pins.mouse_x.set(i);
      rate_limit.pins.mouse_y.set(i);
    }
    setTimeout(() => {
      rate_limit.pins.mouse_x.set(77);
      rate_limit.pins.mouse_y.set(44);
    }, 1000);
  });

  // window.addEventListener('mousemove', (e) => {
  //   rate_limit.pins.mouse_x.set(0);
  //   rate_limit.pins.mouse_y.set(0);
  //   rate_limit.pins.mouse_x.set(e.offsetX);
  //   rate_limit.pins.mouse_y.set(e.offsetY);
  //   // console.log(e.offsetX, e.offsetY);
  // })
}); /* DOMContentLoaded */
