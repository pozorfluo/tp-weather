(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newContext = exports.withObservable = exports.newObservable = void 0;
const komrad_1 = require("./komrad");
function newObservable(value) {
    const observable = {
        subscribers: [],
        value: value,
        notify: function () {
            for (let i = 0, length = this.subscribers.length; i < length; i++) {
                this.subscribers[i](this.value);
            }
            return this;
        },
        subscribe: function (subscriber, priority) {
            if (priority === undefined) {
                this.subscribers.push(subscriber);
            }
            else {
                this.subscribers.splice(priority, 0, subscriber);
            }
            return this;
        },
        flush: function () {
            this.subscribers = [];
            return this;
        },
        get: function () {
            return this.value;
        },
        set: function (value) {
            if (value !== this.value) {
                this.value = value;
                this.notify();
            }
            return this;
        },
    };
    return observable;
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
            this.pins[name] = pin;
            for (let i = 0, length = subscribers.length; i < length; i++) {
                pin.subscribe(subscribers[i]);
            }
            return this;
        },
        remove: function (name) {
            if (this.pins[name] !== undefined) {
                this.pins[name].flush();
                delete this.pins[name];
            }
            return this;
        },
        merge: function (another_context) {
            if (another_context.pins !== undefined) {
                another_context = another_context.pins;
            }
            komrad_1.extend(this.pins, another_context);
            return this;
        },
        musterSubs: function (element) {
            var _a, _b, _c;
            const sub_nodes = [...element.querySelectorAll('[data-sub]')];
            const length = sub_nodes.length;
            const subs = Array(length);
            for (let i = 0; i < length; i++) {
                const source = (_a = sub_nodes[i].getAttribute('data-sub')) !== null && _a !== void 0 ? _a : 'error';
                const target = (_b = sub_nodes[i].getAttribute('data-property')) !== null && _b !== void 0 ? _b : 'value';
                const type = (_c = sub_nodes[i].getAttribute('data-type')) !== null && _c !== void 0 ? _c : 'string';
                subs[i] = {
                    source: this.pins[source] !== undefined
                        ? this.pins[source]
                        : source,
                    target: target,
                    type: type,
                    node: sub_nodes[i],
                };
            }
            this.subs = subs;
            return this;
        },
        setSubs: function (subs) {
            this.subs = subs;
            return this;
        },
        activateSubs: function () {
            for (let i = 0, length = this.subs.length; i < length; i++) {
                if (typeof this.subs[i].source !== 'string') {
                    this.subs[i].source.subscribe((value) => {
                        this.subs[i].node[this.subs[i].target] = value;
                    });
                }
            }
            return this;
        },
        refresh: function () {
            for (const pin of Object.values(this.pins)) {
                pin.notify();
            }
            return this;
        }
    };
    return context;
}
exports.newContext = newContext;

},{"./komrad":4}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.span = exports.p = exports.header = exports.h5 = exports.h4 = exports.h3 = exports.h2 = exports.h1 = exports.div = exports.button = exports.a = void 0;
function appendArray(elem, children) {
    for (let i = 0, length = children.length; i < length; i++) {
        Array.isArray(children[i])
            ? appendArray(elem, children[i])
            : elem.append(children[i]);
    }
}
function setStyles(elem, styles) {
    if (!styles) {
        elem.removeAttribute(`styles`);
        return;
    }
    Object.keys(styles).forEach((styleName) => {
        if (styleName in elem.style) {
            elem.style[styleName] = styles[styleName];
        }
        else {
            console.warn(`${styleName} is not a valid style for a <${elem.tagName.toLowerCase()}>`);
        }
    });
}
function makeElement(type, ...children) {
    const elem = document.createElement(type);
    if (Array.isArray(children[0])) {
        appendArray(elem, children[0]);
    }
    else if (children[0] instanceof window.Element) {
        elem.appendChild(children[0]);
    }
    else if (typeof children[0] === 'string') {
        elem.append(children[0]);
    }
    else if (typeof children[0] === 'object') {
        Object.keys(children[0]).forEach((propName) => {
            if (propName in elem) {
                const value = children[0][propName];
                if (propName === 'style') {
                    setStyles(elem, value);
                }
                else if (value) {
                    elem[propName] = value;
                }
            }
            else {
                console.warn(`${propName} is not a valid property of a <${type}>`);
            }
        });
    }
    if (children.length >= 1)
        appendArray(elem, children.slice(1));
    return elem;
}
exports.a = (...args) => makeElement(`a`, ...args);
exports.button = (...args) => makeElement(`button`, ...args);
exports.div = (...args) => makeElement(`div`, ...args);
exports.h1 = (...args) => makeElement(`h1`, ...args);
exports.h2 = (...args) => makeElement(`h2`, ...args);
exports.h3 = (...args) => makeElement(`h3`, ...args);
exports.h4 = (...args) => makeElement(`h4`, ...args);
exports.h5 = (...args) => makeElement(`h5`, ...args);
exports.header = (...args) => makeElement(`header`, ...args);
exports.p = (...args) => makeElement(`p`, ...args);
exports.span = (...args) => makeElement(`span`, ...args);

},{}],3:[function(require,module,exports){
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
    var _a;
    try {
        const response = await fetch(`https://eu1.locationiq.com/v1/reverse.php?key=${api_key}&lat=${lat}&lon=${lon}&format=json`);
        if (response.status >= 400 && response.status < 600) {
            throw new Error("Something went wrong contacting 'eu1.locationiq.com'.");
        }
        const result = await response.json();
        return [result.address.country_code, (_a = result.address.city) !== null && _a !== void 0 ? _a : result.address.town];
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
    else {
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

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cram = exports.extend = void 0;
function extend(object, trait) {
    Object.keys(trait).forEach(function (key) {
        object[key] = trait[key];
    });
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

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_solo_1 = require("./app-solo");
const geo_1 = require("./geo");
const weather_1 = require("./weather");
const elements_1 = require("./elements");
require("./weather-days");
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
    var _a;
    getWeather()
        .then((forecasts) => {
        app.pins.forecasts.set(forecasts);
        app.pins.day.set(0);
    })
        .catch((err) => {
        console.log(err);
    });
    const renderForecast = function (f, day) {
        const d = day === 0 ? f.current : f.daily[Math.min(day, 7)];
        view.pins.city.set(f.city);
        view.pins.icon.set('icons/' + d.icon);
        view.pins.temp.set(`${d.temperature}°`);
        view.pins.wind.set(`Vent ${d.windSpeed}km/h (${d.windDeg}°)`);
        view.pins.loading.set('');
    };
    const renderDaysNav = function (f) {
        const fragment = document.createDocumentFragment();
        for (let i = 0, length = Math.min(f.daily.length, 5); i < length; i++) {
            fragment.appendChild(elements_1.a({
                className: 'day-button',
                onclick: (e) => {
                    app.pins.day.set(i);
                    e.preventDefault();
                },
            }, new Date(f.daily[i].timestamp * 1000).toLocaleDateString(navigator.language, {
                weekday: 'long',
            })));
        }
        days_nav.appendChild(fragment);
    };
    const app = app_solo_1.newContext()
        .pub('forecasts', app_solo_1.newObservable(null), (f) => {
        renderForecast(f, 0);
        renderDaysNav(f);
    })
        .pub('day', app_solo_1.newObservable(0), (d) => {
        renderForecast(app.pins.forecasts.value, d);
    });
    const view = app_solo_1.newContext()
        .pub('city', app_solo_1.newObservable('...'))
        .pub('icon', app_solo_1.newObservable('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='))
        .pub('temp', app_solo_1.newObservable('...°'))
        .pub('wind', app_solo_1.newObservable('Vent ...km/h (...°)'))
        .pub('date', app_solo_1.newObservable(new Date()))
        .pub('day', app_solo_1.newObservable(0))
        .pub('loading', app_solo_1.newObservable('loading'))
        .musterSubs(document)
        .activateSubs()
        .refresh();
    const days_nav = (_a = document.querySelector('.day-nav')) !== null && _a !== void 0 ? _a : document.createElement('div');
    console.log(navigator.language);
});

},{"./app-solo":1,"./elements":2,"./geo":3,"./weather":7,"./weather-days":6}],6:[function(require,module,exports){
"use strict";
class WeatherDays extends HTMLElement {
    constructor() {
        super();
        const button = document.createElement('a');
        button.classList.add('day-button');
        button.textContent = 'Now';
        this.appendChild(button);
    }
}
customElements.define('weather-days', WeatherDays);

},{}],7:[function(require,module,exports){
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
            timestamp: owm.current.dt,
            temperature: owm.current.temp,
            windSpeed: owm.current.wind_speed,
            windDeg: owm.current.wind_deg,
            icon: iconTable[owm.current.weather[0].icon],
        },
        daily: [],
    };
    for (let i = 0, length = owm.daily.length; i < length; i++) {
        forecast.daily.push({
            timestamp: owm.daily[i].dt,
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

},{}]},{},[4,1,5]);
