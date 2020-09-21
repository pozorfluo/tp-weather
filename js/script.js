"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
require("./components/weather-nav");
require("./components/img-spinner");
function main() {
    if (window.Worker) {
        const weather_worker = new Worker('js/dist/workers/weather.js');
        weather_worker.onmessage = (e) => {
            console.log('test_worker said : ', e.data);
            app.pins.forecasts.push(e.data.forecasts);
            app.pins.day.push(0);
        };
        weather_worker.postMessage([]);
        console.log(weather_worker);
        const day_count = 5;
        const renderForecast = function (f, day) {
            const d = day === 0 ? f.current : f.daily[Math.min(day, day_count)];
            view.pins.city.push(f.city);
            view.pins.icon.push('icons/' + d.icon);
            view.pins.temp.push(`${d.temperature}°`);
            view.pins.wind.push(`Vent ${d.windSpeed}km/h (${d.windDeg}°)`);
            view.pins.date.push(new Date(d.timestamp).toLocaleDateString(navigator.language));
            view.pins.loading.push('');
        };
        const weather_nav = document.querySelector('weather-nav');
        const weather = document.getElementById('Weather');
        weather_nav.renderPlaceholder(day_count, '...');
        const app = new lib_1.Context();
        app
            .pub('forecasts', new lib_1.Feed(null), (f) => {
            renderForecast(f, 0);
            weather_nav.setOnClick(app.pins.day.push);
            weather_nav.render(f.daily.map((d) => d.timestamp), day_count);
        })
            .pub('day', new lib_1.Feed(0), (d) => {
            renderForecast(app.pins.forecasts.value, d);
        });
        const view = new lib_1.Context();
        view
            .pub('icon', new lib_1.Feed(''))
            .pub('date', new lib_1.Feed(''))
            .pub('loading', new lib_1.Feed('loading'))
            .muster(weather)
            .activateAll();
        const rate_limit_test = document.getElementById('RateLimit');
        const rate_limit_btn = document.getElementById('RateLimitBtn');
        const rate_limit = new lib_1.Context();
        rate_limit.muster(rate_limit_test).activateAll();
        rate_limit_btn.addEventListener('click', (e) => {
            console.log('click ----------------');
            for (let i = 0; i < 1000; i++) {
                rate_limit.pins.mouse_x.push(i);
            }
        });
    }
    else {
        console.warn("Your brower doesn't support web workers");
    }
}
document.readyState === 'loading'
    ? window.addEventListener('DOMContentLoaded', main)
    : main();
