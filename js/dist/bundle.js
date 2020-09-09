(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
class ImgSpinner extends HTMLImageElement {
    constructor() {
        super();
        if (!(this['src'] || this['srcset'])) {
            this['src'] = ImgSpinner._placeholder;
            this.classList.add(ImgSpinner.classname);
        }
    }
    static get observedAttributes() {
        return ['src', 'srcset'];
    }
    _spinUntilLoaded() {
        if (!this.complete) {
            this.classList.add(ImgSpinner.classname);
            this.onload = this._onLoad;
        }
    }
    _onLoad() {
        this.classList.remove(ImgSpinner.classname);
    }
    connectedCallback() {
        this._spinUntilLoaded();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this._spinUntilLoaded();
    }
}
ImgSpinner.classname = 'img-spinner-loading';
ImgSpinner._template = (() => {
    const t = document.createElement('template');
    t.innerHTML = `\
      <style>
      .${ImgSpinner.classname} {
        filter: opacity(50%);
        background: transparent url('icons/spinner.svg') no-repeat scroll center
          center;
        background-blend-mode: multiply;
        shape-outside: polygon(0 0, 0 200px, 300px 600px);
      }
      </style>`;
    document.head.appendChild(t.content);
    return t.content;
})();
ImgSpinner._placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
customElements.define('img-spinner', ImgSpinner, { extends: 'img' });

},{}],2:[function(require,module,exports){
"use strict";
class SpritePlayer extends HTMLElement {
    constructor() {
        var _a, _b;
        super();
        this._running = true;
        this._loop = null;
        this.attachShadow({ mode: 'open' });
        (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.appendChild(SpritePlayer._template.cloneNode(true));
        this._sprite = (_b = this.shadowRoot) === null || _b === void 0 ? void 0 : _b.getElementById('sprite');
        const rules = this.shadowRoot.styleSheets[0].cssRules[0];
        this.css = rules.style;
    }
    static get observedAttributes() {
        return ['width', 'height', 'anim', 'duration', 'frames', 'loop'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this.css.setProperty('--' + name, (newValue !== null && newValue !== void 0 ? newValue : 0) + '');
    }
    setLoopDuration(duration) {
        this.css.setProperty('--duration', duration + 'ms');
        return this;
    }
    setLoop(iterations) {
        this.css.setProperty('animation-iteration-count', iterations);
        return this;
    }
    setAnim(anim) {
        this.css.setProperty('--anim', anim + '');
        return this;
    }
    play() {
        if (this._loop) {
            this.css.setProperty('animation-iteration-count', this._loop);
            this._loop = null;
        }
        this.css.setProperty('animation-play-state', 'running');
        this._running = true;
    }
    pause() {
        this.css.setProperty('animation-play-state', 'paused');
        this._running = false;
    }
    toggle() {
        if (this._loop) {
            this.css.setProperty('animation-iteration-count', this._loop);
            this._loop = null;
        }
        const toggle = this._running ? 'paused' : 'running';
        this.css.setProperty('animation-play-state', toggle);
        this._running = !this._running;
    }
    toggleReset() {
        if (this._running) {
            this.css.setProperty('animation-name', 'none');
        }
        else {
            if (this._loop) {
                this.css.setProperty('animation-iteration-count', this._loop);
                this._loop = null;
            }
            this.css.setProperty('animation-name', 'play');
        }
        this._running = !this._running;
    }
    pauseAfter() {
        this._loop = this.css.getPropertyValue('--loop');
        this.css.setProperty('animation-iteration-count', '1');
        this._running = false;
    }
}
SpritePlayer._template = (() => {
    const t = document.createElement('template');
    t.innerHTML = `\
      <style>
      #sprite {
        --width : 64px;
        --height : 64px;
        --frames: 12;
        --anim : 0;
        --loop : infinite;
        --y : calc(var(--height) * var(--anim) * -1);
        --x : calc(var(--width) * var(--frames) * -1);
        --duration: 333ms;
        width: var(--width);
        height: var(--height);
        background-origin: border-box;
        background: url('sprites/link.png') 0px var(--y);
        animation: play var(--duration) steps(var(--frames)) var(--loop);
      }

      @keyframes play {
        100% { background-position: var(--x) var(--y); }
      }
      </style>
      <div id="sprite"></div>
      `;
    return t.content;
})();
customElements.define('sprite-player', SpritePlayer);

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherNav = void 0;
class WeatherNav extends HTMLElement {
    constructor() {
        super();
        this._onClick = () => {
            throw 'WeatherDays : effect not set.';
        };
        this.days = WeatherNav._days.cloneNode(true);
        this.appendChild(this.days);
    }
    setOnClick(effect) {
        this._onClick = effect;
        return this;
    }
    render(timestamps, max) {
        const days = WeatherNav._days.cloneNode(true);
        for (let i = 0, length = Math.min(timestamps.length, max); i < length; i++) {
            const button = WeatherNav._button.cloneNode(true);
            button.textContent = new Date(timestamps[i]).toLocaleDateString(navigator.language, {
                weekday: 'long',
            });
            button.onclick = (e) => {
                this._onClick(i);
                e.preventDefault();
            };
            days.appendChild(button);
        }
        this.replaceChild(days, this.days);
        this.days = days;
        return this;
    }
    renderPlaceholder(max, msg) {
        const days = WeatherNav._days.cloneNode(true);
        for (let i = 0; i < max; i++) {
            const button = WeatherNav._button.cloneNode(true);
            button.textContent = msg;
            days.appendChild(button);
        }
        this.replaceChild(days, this.days);
        this.days = days;
        return this;
    }
}
exports.WeatherNav = WeatherNav;
WeatherNav._button = (() => {
    const t = document.createElement('a');
    t.classList.add('day-button');
    return t;
})();
WeatherNav._days = (() => {
    const t = document.createElement('div');
    t.classList.add('card-action', 'day-nav');
    return t;
})();
customElements.define('weather-nav', WeatherNav);

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geoLocate = void 0;
async function geoIp(api_key) {
    try {
        const response = await fetch(`https://api.ipdata.co?api-key=${api_key}`, {
            headers: {
                Accept: 'application/json',
            },
        });
        if (response.status >= 400 && response.status < 600) {
            throw new Error("Something went wrong contacting 'api.ipdata.co'.");
        }
        return response.json();
    }
    catch (err) {
        console.log(err);
        return err;
    }
}
async function geoReverse(lat, lon, api_key) {
    var _a, _b;
    try {
        const response = await fetch(`https://eu1.locationiq.com/v1/reverse.php?key=${api_key}&lat=${lat}&lon=${lon}&format=json`);
        if (response.status >= 400 && response.status < 600) {
            throw new Error("Something went wrong contacting 'eu1.locationiq.com'.");
        }
        const result = await response.json();
        return [
            result.address.country_code,
            (_b = (_a = result.address.city) !== null && _a !== void 0 ? _a : result.address.town) !== null && _b !== void 0 ? _b : result.address.village,
        ];
    }
    catch (err) {
        console.log(err);
        return [null, null];
    }
}
async function geoCoords() {
    const options = {
        maximumAge: 30000,
        timeout: 10000,
    };
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}
async function geoLocate(api_keys) {
    let lat = null;
    let lon = null;
    let city = null;
    let country_code = null;
    let coords = null;
    if (navigator.geolocation) {
        try {
            coords = await geoCoords();
        }
        catch (err) {
            console.log('Unable to retrieve coords using geolocation API. Using ip.');
        }
    }
    if (coords !== null) {
        lat = coords.coords.latitude;
        lon = coords.coords.longitude;
        [country_code, city] = await geoReverse(lat, lon, api_keys.map);
    }
    if (!(lat && lon && country_code && city)) {
        ({ latitude: lat, longitude: lon, country_code, city } = await geoIp(api_keys.ipdata));
    }
    return lat && lon && country_code && city
        ? {
            countryCode: country_code,
            city: city,
            latitude: lat,
            longitude: lon,
        }
        : null;
}
exports.geoLocate = geoLocate;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newContext = exports.withObservable = exports.newObservable = void 0;
const komrad_1 = require("./komrad");
var RateLimit;
(function (RateLimit) {
    RateLimit["none"] = "none";
    RateLimit["debounce"] = "debounce";
    RateLimit["throttle"] = "throttle";
})(RateLimit || (RateLimit = {}));
function newObservable(value, rateLimit = RateLimit.throttle) {
    const instance = {
        subscribers: [],
        value: value,
        _ticker: 0,
        _immediate: 0,
        notify: function () {
            for (let i = 0, length = instance.subscribers.length; i < length; i++) {
                instance.subscribers[i](instance.value);
            }
            return instance;
        },
        subscribe: function (subscriber, priority) {
            if (priority === undefined) {
                instance.subscribers.push(subscriber);
            }
            else {
                instance.subscribers.splice(priority, 0, subscriber);
            }
            return instance;
        },
        flush: function () {
            instance.subscribers = [];
            return instance;
        },
        get: function () {
            return instance.value;
        },
        set: ((rateLimit) => {
            switch (rateLimit) {
                case RateLimit.none:
                    return function (value) {
                        if (value !== instance.value) {
                            instance.value = value;
                            instance.notify();
                        }
                        return instance;
                    };
                case RateLimit.debounce:
                    return function (value) {
                        console.log('set', instance._ticker, instance.value);
                        if (value !== instance.value) {
                            instance.value = value;
                            if (instance._ticker) {
                                window.cancelAnimationFrame(instance._ticker);
                                console.log('Cancel notify', instance._ticker, instance.value);
                            }
                            instance._ticker = window.requestAnimationFrame(function () {
                                instance.notify();
                                console.log(' ----> Notify', instance._ticker, instance.value);
                                instance._ticker = 0;
                            });
                            console.log('Schedule notify', instance._ticker, instance.value);
                        }
                        return instance;
                    };
                case RateLimit.throttle:
                    return function (value) {
                        if (value !== instance.value) {
                            instance.value = value;
                            if (!instance._immediate && !instance._ticker) {
                                instance.notify();
                                console.log('----> LeadNotify', instance._ticker, instance.value);
                                instance._immediate = window.requestAnimationFrame(() => (instance._immediate = 0));
                            }
                            else if (!instance._ticker) {
                                instance._ticker = window.requestAnimationFrame(function (now) {
                                    window.cancelAnimationFrame(instance._ticker);
                                    instance.notify();
                                    console.log(' ----> Notify', instance._ticker, instance.value, now);
                                    instance._ticker = 0;
                                });
                                console.log('Schedule notify', instance._ticker, instance.value);
                            }
                        }
                        return instance;
                    };
            }
        })(rateLimit),
    };
    return instance;
}
exports.newObservable = newObservable;
function withObservable(name, value) {
    const trait = { observable: {} };
    trait.observable[name] = newObservable(value);
    return trait;
}
exports.withObservable = withObservable;
function newContext() {
    const context = {
        pins: {},
        subs: [],
        pub: function (name, pin, ...subscribers) {
            context.pins[name] = pin;
            for (let i = 0, length = subscribers.length; i < length; i++) {
                pin.subscribe(subscribers[i]);
            }
            return context;
        },
        remove: function (name) {
            if (context.pins[name] !== undefined) {
                context.pins[name].flush();
                delete context.pins[name];
            }
            return context;
        },
        merge: function (another_context) {
            if (another_context.pins !== undefined) {
                another_context = another_context.pins;
            }
            komrad_1.extend(context.pins, another_context);
            return context;
        },
        musterPubs: function (element) {
            var _a, _b, _c;
            const pub_nodes = [...element.querySelectorAll('[data-pub')];
            const length = pub_nodes.length;
            const subs = Array(length);
            for (let i = 0; i < length; i++) {
                const source = (_a = pub_nodes[i].getAttribute('data-pub')) !== null && _a !== void 0 ? _a : 'error';
                const target = (_b = pub_nodes[i].getAttribute('data-prop')) !== null && _b !== void 0 ? _b : 'textContent';
                const initial_value = pub_nodes[i][target];
                context.pub(source, newObservable(initial_value));
                subs[i] = {
                    source: context.pins[source] !== undefined ? context.pins[source] : source,
                    target: target,
                    type: (_c = pub_nodes[i].getAttribute('data-type')) !== null && _c !== void 0 ? _c : 'string',
                    node: pub_nodes[i],
                };
            }
            Array.prototype.push.apply(context.subs, subs);
            return context;
        },
        musterSubs: function (element) {
            var _a, _b, _c;
            const sub_nodes = [...element.querySelectorAll('[data-sub]')];
            const length = sub_nodes.length;
            const subs = Array(length);
            for (let i = 0; i < length; i++) {
                const source = (_a = sub_nodes[i].getAttribute('data-sub')) !== null && _a !== void 0 ? _a : 'error';
                subs[i] = {
                    source: context.pins[source] !== undefined ? context.pins[source] : source,
                    target: (_b = sub_nodes[i].getAttribute('data-prop')) !== null && _b !== void 0 ? _b : 'textContent',
                    type: (_c = sub_nodes[i].getAttribute('data-type')) !== null && _c !== void 0 ? _c : 'string',
                    node: sub_nodes[i],
                };
            }
            Array.prototype.push.apply(context.subs, subs);
            return context;
        },
        muster: function (element) {
            return context.musterPubs(element).musterSubs(element);
        },
        setSubs: function (subs) {
            context.subs = subs;
            return context;
        },
        activateSubs: function () {
            for (let i = 0, length = context.subs.length; i < length; i++) {
                if (typeof context.subs[i].source !== 'string') {
                    context.subs[i].source.subscribe((value) => {
                        context.subs[i].node[context.subs[i].target] = value;
                    });
                }
            }
            return context;
        },
        refresh: function () {
            for (const pin of Object.values(context.pins)) {
                pin.notify();
            }
            return context;
        },
    };
    return context;
}
exports.newContext = newContext;

},{"./komrad":6}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendCopy = exports.cram = exports.extend = void 0;
function extend(object, trait) {
    Object.assign(object, trait);
}
exports.extend = extend;
function cram(object, trait) {
    Object.keys(trait).forEach(function (key) {
        switch (typeof object[key]) {
            case 'object':
                if (Array.isArray(object[key])) {
                    [...object[key], trait[key]];
                }
                else {
                    extend(object[key], trait[key]);
                }
                break;
            case undefined:
            default:
                object[key] = trait[key];
                break;
        }
    });
    return object;
}
exports.cram = cram;
function extendCopy(object, trait) {
    const extended_copy = Object.assign({}, object);
    Object.keys(trait).forEach(function (key) {
        extended_copy[key] = trait[key];
    });
    return extended_copy;
}
exports.extendCopy = extendCopy;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_solo_1 = require("./lib/app-solo");
const geo_1 = require("./geo");
const weather_1 = require("./weather");
require("./components/weather-nav");
require("./components/img-spinner");
require("./components/sprite-player");
async function getApiKeys() {
    const api_keys = await fetch('/../keys.env', { mode: 'no-cors' })
        .then((response) => response.json())
        .then((json) => {
        return json;
    })
        .catch((error) => console.log(error));
    return api_keys;
}
async function getWeather() {
    const api_keys = await getApiKeys();
    const loc = await geo_1.geoLocate(api_keys);
    const forecasts = loc !== null ? await weather_1.getDailyForecasts(loc, api_keys) : null;
    return forecasts !== null ? weather_1.newForecast(loc, forecasts) : null;
}
window.addEventListener('DOMContentLoaded', function (event) {
    const day_count = 5;
    getWeather()
        .then((forecasts) => {
        app.pins.forecasts.set(forecasts);
        app.pins.day.set(0);
    })
        .catch((err) => {
        console.log(err);
    });
    const renderForecast = function (f, day) {
        const d = day === 0 ? f.current : f.daily[Math.min(day, day_count)];
        view.pins.city.set(f.city);
        view.pins.city.set(f.city + 'x');
        view.pins.city.set(f.city + 'xy');
        view.pins.city.set(f.city + 'xyz');
        view.pins.icon.set('icons/' + d.icon);
        view.pins.temp.set(`${d.temperature}°`);
        view.pins.wind.set(`Vent ${d.windSpeed}km/h (${d.windDeg}°)`);
        view.pins.date.set(new Date(d.timestamp).toLocaleDateString(navigator.language));
        view.pins.loading.set('');
    };
    const weather_nav = document.querySelector('weather-nav');
    const weather = document.getElementById('Weather');
    weather_nav.renderPlaceholder(day_count, '...');
    const app = app_solo_1.newContext()
        .pub('forecasts', app_solo_1.newObservable(null), (f) => {
        renderForecast(f, 0);
        weather_nav.setOnClick(app.pins.day.set);
        weather_nav.render(f.daily.map((d) => d.timestamp), day_count);
    })
        .pub('day', app_solo_1.newObservable(0), (d) => {
        renderForecast(app.pins.forecasts.value, d);
    });
    const view = app_solo_1.newContext()
        .pub('icon', app_solo_1.newObservable(''))
        .pub('date', app_solo_1.newObservable(''))
        .pub('loading', app_solo_1.newObservable('loading'))
        .muster(weather)
        .activateSubs();
    const rate_limit_test = document.getElementById('RateLimit');
    const rate_limit_btn = document.getElementById('RateLimitBtn');
    const rate_limit = app_solo_1.newContext().muster(rate_limit_test).activateSubs();
    rate_limit_btn.addEventListener('click', (e) => {
        console.log('click ----------------');
        for (let i = 0; i < 1000; i++) {
            rate_limit.pins.mouse_x.set(i);
        }
    });
});

},{"./components/img-spinner":1,"./components/sprite-player":2,"./components/weather-nav":3,"./geo":4,"./lib/app-solo":5,"./weather":8}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyForecasts = exports.newForecast = void 0;
const iconTable = {
    '01d': 'sun.svg',
    '02d': 'cloudy-sun.svg',
    '03d': 'cloudy.svg',
    '04d': 'cloudy.svg',
    '09d': 'rainy.svg',
    '10d': 'rainy.svg',
    '11d': 'thunderstorm.svg',
    '13d': 'snowy.svg',
    '50d': 'mist.svg',
    '01n': 'sun.svg',
    '02n': 'cloudy-sun.svg',
    '03n': 'cloudy.svg',
    '04n': 'cloudy.svg',
    '09n': 'rainy.svg',
    '10n': 'rainy.svg',
    '11n': 'thunderstorm.svg',
    '13n': 'snowy.svg',
    '50n': 'mist.svg',
};
function newForecast(loc, owm) {
    const forecast = {
        countryCode: loc.countryCode,
        city: loc.city,
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezone: owm.timezone,
        timezoneOffset: owm.timezone_offset,
        current: {
            timestamp: owm.current.dt * 1000,
            temperature: owm.current.temp,
            windSpeed: owm.current.wind_speed,
            windDeg: owm.current.wind_deg,
            icon: iconTable[owm.current.weather[0].icon],
        },
        daily: [],
    };
    for (let i = 0, length = owm.daily.length; i < length; i++) {
        forecast.daily.push({
            timestamp: owm.daily[i].dt * 1000,
            temperature: owm.daily[i].temp.day,
            windSpeed: owm.daily[i].wind_speed,
            windDeg: owm.daily[i].wind_deg,
            icon: iconTable[owm.daily[i].weather[0].icon],
        });
    }
    return forecast;
}
exports.newForecast = newForecast;
async function getDailyForecasts(loc, api_keys) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lang=${loc.countryCode}&units=metric&lat=${loc.latitude}&lon=${loc.longitude}&exclude=minutely,hourly&appid=${api_keys.owm}`);
        if (response.status >= 400 && response.status < 600) {
            throw new Error("Something went wrong contacting 'api.openweathermap.org'.");
        }
        return response.json();
    }
    catch (err) {
        console.log(err);
        return null;
    }
}
exports.getDailyForecasts = getDailyForecasts;

},{}]},{},[7]);
