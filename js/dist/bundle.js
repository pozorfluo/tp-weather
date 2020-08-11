(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newContext = exports.link = exports.withObservable = exports.newObservable = void 0;
const komrad_1 = require("./komrad");
'use strict';
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
function link(observable, node, property, event = 'input') {
    node[property] = observable.value + '';
    observable.subscribe(() => {
        node[property] = observable.value + '';
    });
    node.addEventListener(event, () => observable.set(node[property]));
}
exports.link = link;
function newContext() {
    const context = {
        observables: {},
        observables_iterator: [],
        pins: [],
        links: [],
        put: function (name, observable, ...subscribers) {
            this.observables[name] = observable;
            this.observables_iterator.push([name, observable]);
            for (let i = 0, length = subscribers.length; i < length; i++) {
                observable.subscribe(subscribers[i]);
            }
            return this;
        },
        remove: function (name) {
            if (this.observables[name] !== undefined) {
                this.observables[name].flush();
                delete this.observables[name];
            }
            return this;
        },
        merge: function (another_context) {
            if (another_context.observables !== undefined) {
                another_context = another_context.observables;
            }
            komrad_1.extend(this.observables, another_context);
            return this;
        },
        musterPins: function () {
            var _a, _b, _c;
            const pin_nodes = [...document.querySelectorAll('[data-pin]')];
            const length = pin_nodes.length;
            const pins = Array(length);
            for (let i = 0; i < length; i++) {
                const source = (_a = pin_nodes[i].getAttribute('data-pin')) !== null && _a !== void 0 ? _a : 'error';
                const target = (_b = pin_nodes[i].getAttribute('data-property')) !== null && _b !== void 0 ? _b : 'value';
                const type = (_c = pin_nodes[i].getAttribute('data-type')) !== null && _c !== void 0 ? _c : 'string';
                pins[i] = {
                    source: this.observables[source] !== undefined
                        ? this.observables[source]
                        : source,
                    target: target,
                    type: type,
                    node: pin_nodes[i],
                };
            }
            this.pins = pins;
            return this;
        },
        musterLinks: function () {
            var _a, _b, _c, _d;
            const link_nodes = [
                ...document.querySelectorAll('[data-link]'),
            ];
            const length = link_nodes.length;
            const links = Array(length);
            for (let i = 0; i < length; i++) {
                const source = (_a = link_nodes[i].getAttribute('data-link')) !== null && _a !== void 0 ? _a : 'error';
                const event = (_b = link_nodes[i].getAttribute('data-event')) !== null && _b !== void 0 ? _b : 'input';
                const target = (_c = link_nodes[i].getAttribute('data-property')) !== null && _c !== void 0 ? _c : 'value';
                const type = (_d = link_nodes[i].getAttribute('data-type')) !== null && _d !== void 0 ? _d : 'string';
                links[i] = {
                    source: this.observables[source] !== undefined
                        ? this.observables[source]
                        : source,
                    event: event,
                    target: target,
                    type: type,
                    node: link_nodes[i],
                };
            }
            this.links = links;
            return this;
        },
        setPins: function (pins) {
            this.pins = pins;
            return this;
        },
        setLinks: function (links) {
            this.links = links;
            return this;
        },
        activatePins: function () {
            for (let i = 0, length = this.pins.length; i < length; i++) {
                if (typeof this.pins[i].source !== 'string') {
                    this.pins[i].source.subscribe((value) => {
                        this.pins[i].node[this.pins[i].target] = value;
                    });
                }
            }
            return this;
        },
        activateLinks: function () {
            for (let i = 0, length = this.links.length; i < length; i++) {
                if (typeof this.links[i].source !== 'string') {
                    link(this.links[i].source, this.links[i].node, this.links[i].target, this.links[i].event);
                }
            }
            return this;
        },
        refresh: function () {
            for (let i = 0, length = this.observables_iterator.length; i < length; i++) {
                this.observables_iterator[i][1].notify();
            }
            return this;
        },
    };
    return context;
}
exports.newContext = newContext;

},{"./komrad":3}],2:[function(require,module,exports){
'use strict';
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
    try {
        const response = await fetch(`https://eu1.locationiq.com/v1/reverse.php?key=${api_key}&lat=${lat}&lon=${lon}&format=json`);
        if (response.status >= 400 && response.status < 600) {
            throw new Error("Something went wrong contacting 'eu1.locationiq.com'.");
        }
        const result = await response.json();
        return [result.address.country_code, result.address.town];
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

},{}],3:[function(require,module,exports){
'use strict';
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

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_solo_1 = require("./app-solo");
const geo_1 = require("./geo");
const weather_1 = require("./weather");
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
    getWeather()
        .then((forecasts) => {
        app.observables.forecasts.set(forecasts);
        app.observables.day.set(0);
    })
        .catch((err) => {
        console.log(err);
    });
    const view = app_solo_1.newContext()
        .put('city', app_solo_1.newObservable('...'))
        .put('icon', app_solo_1.newObservable('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='))
        .put('temp', app_solo_1.newObservable('...°'))
        .put('wind', app_solo_1.newObservable('Vent ...km/h (...°)'))
        .put('date', app_solo_1.newObservable(new Date()))
        .put('day', app_solo_1.newObservable(0))
        .musterPins()
        .activatePins()
        .refresh();
    const updateForecast = function (f, day) {
        const d = day === 0 ? f.current : f.daily[Math.min(day, 7)];
        view.observables.city.set(f.city);
        view.observables.icon.set('icons/' + d.icon);
        view.observables.temp.set(`${d.temperature}°`);
        view.observables.wind.set(`Vent ${d.windSpeed}km/h (${d.windDeg}°)`);
    };
    const app = app_solo_1.newContext()
        .put('forecasts', app_solo_1.newObservable(null), (f) => {
        updateForecast(f, 0);
        updateDaysNav(f);
    })
        .put('day', app_solo_1.newObservable(0), (d) => {
        updateForecast(app.observables.forecasts.value, d);
    });
    const days_nav = document.querySelector('.days-nav');
    const updateDaysNav = function (f) {
        for (let i = 0, length = f.daily.length; i < length; i++) {
            const day = new Date();
            console.log(f.daily[i].timestamp);
        }
    };
});

},{"./app-solo":1,"./geo":2,"./weather":5}],5:[function(require,module,exports){
'use strict';
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

},{}]},{},[3,1,4]);
