import { Feed, Context } from './lib';
// import { geoLocate, GeoInfo } from './geo';
import { Forecast, Daily } from './weather';

import { WeatherNav } from './components/weather-nav';
import './components/weather-nav';
import './components/img-spinner';

// /**
//  * Workaround commiting api keys to git for this exercise.
//  */
// async function getApiKeys() {
//   const api_keys = await fetch('/../keys.env', { mode: 'no-cors' })
//     .then((response) => response.json())
//     .then((json) => {
//       return json;
//     })
//     .catch((error) => console.log(error));
//   return api_keys;
// }

// async function getWeather(): Promise<Forecast | null> {
//   const api_keys = await getApiKeys();
//   const loc = await geoLocate(api_keys);
//   const forecasts =
//     loc !== null ? await getDailyForecasts(loc, api_keys) : null;
//   /** newForecast not called if loc === null, safe to 'cast' to quiet linter */
//   return forecasts !== null ? newForecast(<GeoInfo>loc, forecasts) : null;
// }

//----------------------------------------------------------------- main ---
/**
 * Run the app !
 */
function main(): void {
  if (window.Worker) {
    // const test_worker = new Worker("js/workers/weather.js");
    const weather_worker = new Worker('js/dist/workers/weather.js');

    weather_worker.onmessage = (e) => {
      console.log('test_worker said : ', e.data);
      app.pins.forecasts.push(e.data.forecasts);
      app.pins.day.push(0);
    };

    weather_worker.postMessage([]);

    console.log(weather_worker);

    const day_count = 5;

    // getWeather()
    // .then((forecasts) => {
    //   app.pins.forecasts.set(forecasts);
    //   app.pins.day.set(0);
    // })
    // .catch((err) => {
    //   console.log(err);
    // });
    //----------------------------------------------- render functions ---
    /** @todo Convert 'renderForecast' to web component */
    const renderForecast = function (f: Forecast, day: number): void {
      const d = day === 0 ? f.current : f.daily[Math.min(day, day_count)];
      view.pins.city.push(f.city);
      view.pins.icon.push('icons/' + d.icon);
      view.pins.temp.push(`${d.temperature}°`);
      view.pins.wind.push(`Vent ${d.windSpeed}km/h (${d.windDeg}°)`);
      view.pins.date.push(
        new Date(d.timestamp).toLocaleDateString(navigator.language)
      );
      view.pins.loading.push('');
    };

    //------------------------------------------------------- contexts ---
    const weather_nav = <WeatherNav>document.querySelector('weather-nav');
    const weather = <HTMLElement>document.getElementById('Weather');

    weather_nav.renderPlaceholder(day_count, '...');

    const app = new Context();
    app
      .pub('forecasts', new Feed<Forecast | null>(null), (f) => {
        renderForecast(f, 0);
        // weather_nav.setOnClick(app.pins.day.set.bind(app.pins.day));
        weather_nav.setOnClick(app.pins.day.push);
        // weather_nav.setOnClick((value) => app.pins.day.set(value));
        weather_nav.render(
          f.daily.map((d: Daily) => d.timestamp),
          day_count
        );
      })
      .pub('day', new Feed<number>(0), (d) => {
        renderForecast(app.pins.forecasts.value, d);
      });

    const view = new Context();
    view
      .pub('icon', new Feed<string>(''))
      .pub('date', new Feed<string>(''))
      .pub('loading', new Feed<string>('loading'))
      .muster(weather)
      .activateAll();
    // .refresh()

    //------------------------------------------------------ rate limit test ---
    const rate_limit_test = <HTMLElement>document.getElementById('RateLimit');
    const rate_limit_btn = <HTMLElement>document.getElementById('RateLimitBtn');
    const rate_limit = new Context();
    rate_limit.muster(rate_limit_test).activateAll();

    rate_limit_btn.addEventListener('click', (e) => {
      console.log('click ----------------');

      for (let i = 0; i < 1000; i++) {
        rate_limit.pins.mouse_x.push(i);
        //   rate_limit.pins.mouse_y.set(i);
        //   setTimeout(() => {
        //     rate_limit.pins.mouse_x.set(i);
        //   }, i);
      }
      // setTimeout(() => {
      //   rate_limit.pins.mouse_x.set(77);
      //   rate_limit.pins.mouse_y.set(44);
      // }, 1000);
    });

    // window.addEventListener('mousemove', (e) => {
    //   rate_limit.pins.mouse_x.set(0);
    //   rate_limit.pins.mouse_y.set(0);
    //   rate_limit.pins.mouse_x.set(e.offsetX);
    //   rate_limit.pins.mouse_y.set(e.offsetY);
    //   // console.log(e.offsetX, e.offsetY);
    // })
  } else {
    console.warn("Your brower doesn't support web workers");
  }
}
//---------------------------------------------------------------------- run ---
document.readyState === 'loading'
  ? window.addEventListener('DOMContentLoaded', main)
  : main();
