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

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const observable_1 = require("./observable");
exports.Context = function () {
    if (!new.target) {
        throw 'Context() must be called with new !';
    }
    this.pins = {};
    this.subs = [];
    return this;
};
exports.Context.prototype.pub = function (name, pin, ...subscribers) {
    this.pins[name] = pin;
    for (let i = 0, length = subscribers.length; i < length; i++) {
        pin.subscribe(subscribers[i]);
    }
    return this;
};
exports.Context.prototype.sub = function (name, ...subscribers) {
    if (!(name in this.pins))
        throw name + ' pin does not exist !';
    for (let i = 0, length = subscribers.length; i < length; i++) {
        this.pins[name].subscribe(subscribers[i]);
    }
    return this;
};
exports.Context.prototype.remove = function (name) {
    if (name in this.pins) {
        this.pins[name].dropAll();
        delete this.pins[name];
    }
    return this;
};
exports.Context.prototype.merge = function (another_context) {
    if (another_context.pins !== undefined) {
        another_context = another_context.pins;
    }
    Object.assign(this.pins, another_context);
    return this;
};
exports.Context.prototype.musterPubs = function (element) {
    var _a, _b, _c;
    const pub_nodes = [...element.querySelectorAll('[data-pub]')];
    const length = pub_nodes.length;
    const subs = Array(length);
    for (let i = 0; i < length; i++) {
        const source = (_a = pub_nodes[i].getAttribute('data-pub')) !== null && _a !== void 0 ? _a : 'error';
        const target = (_b = pub_nodes[i].getAttribute('data-prop')) !== null && _b !== void 0 ? _b : 'textContent';
        if (!(target in pub_nodes[i]))
            throw target + ' is not a valid node prop !';
        const initial_value = pub_nodes[i][target];
        this.pub(source, new observable_1.Observable(initial_value));
        subs[i] = {
            source: this.pins[source],
            target: target,
            type: (_c = pub_nodes[i].getAttribute('data-type')) !== null && _c !== void 0 ? _c : 'string',
            node: pub_nodes[i],
        };
    }
    Array.prototype.push.apply(this.subs, subs);
    return this;
};
exports.Context.prototype.musterSubs = function (element) {
    var _a, _b, _c;
    const sub_nodes = [...element.querySelectorAll('[data-sub]')];
    const length = sub_nodes.length;
    const subs = Array(length);
    for (let i = 0; i < length; i++) {
        const source = (_a = sub_nodes[i].getAttribute('data-sub')) !== null && _a !== void 0 ? _a : 'data-sub or';
        if (!(source in this.pins))
            throw source + ' pin does not exist !';
        subs[i] = {
            source: this.pins[source],
            target: (_b = sub_nodes[i].getAttribute('data-prop')) !== null && _b !== void 0 ? _b : 'textContent',
            type: (_c = sub_nodes[i].getAttribute('data-type')) !== null && _c !== void 0 ? _c : 'string',
            node: sub_nodes[i],
        };
    }
    Array.prototype.push.apply(this.subs, subs);
    return this;
};
exports.Context.prototype.muster = function (element) {
    return this.musterPubs(element).musterSubs(element);
};
exports.Context.prototype.activateAll = function () {
    for (let i = 0, length = this.subs.length; i < length; i++) {
        const target = this.subs[i].target;
        const node = this.subs[i].node;
        if (!(target in node))
            throw target + ' is not a valid node prop !';
        this.subs[i].source.subscribe((value) => {
            node[target] = value;
        });
    }
    return this;
};
exports.Context.prototype.refresh = function () {
    for (const pin of Object.values(this.pins)) {
        pin.notify();
    }
    return this;
};

},{"./observable":5}],4:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./observable"), exports);
__exportStar(require("./context"), exports);

},{"./context":3,"./observable":5}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observable = exports.RateLimit = void 0;
var RateLimit;
(function (RateLimit) {
    RateLimit["none"] = "none";
    RateLimit["debounce"] = "debounce";
    RateLimit["throttle"] = "throttle";
})(RateLimit = exports.RateLimit || (exports.RateLimit = {}));
exports.Observable = function (value, rateLimit = RateLimit.throttle) {
    if (!new.target) {
        throw 'Observable() must be called with new !';
    }
    this.subscribers = [];
    this.value = value;
    this._pending = 0;
    this._timeout = 0;
    this.set = ((rateLimit) => {
        switch (rateLimit) {
            case RateLimit.none:
                return (value) => {
                    if (value !== this.value) {
                        this.value = value;
                        this.notify();
                    }
                    return this;
                };
            case RateLimit.debounce:
                return (value) => {
                    if (value !== this.value) {
                        this.value = value;
                        if (this._pending) {
                            window.cancelAnimationFrame(this._pending);
                        }
                        this._pending = window.requestAnimationFrame(() => {
                            this.notify();
                            this._pending = 0;
                        });
                    }
                    return this;
                };
            case RateLimit.throttle:
                return (value) => {
                    if (value !== this.value) {
                        this.value = value;
                        if (!this._pending) {
                            if (!this._timeout) {
                                this.notify();
                                this._timeout = window.requestAnimationFrame(() => (this._timeout = 0));
                            }
                            else {
                                this._pending = window.requestAnimationFrame((now) => {
                                    window.cancelAnimationFrame(this._pending);
                                    this.notify();
                                    this._pending = 0;
                                });
                            }
                        }
                    }
                    return this;
                };
        }
    })(rateLimit);
    return this;
};
exports.Observable.prototype.notify = function () {
    for (let i = 0, length = this.subscribers.length; i < length; i++) {
        this.subscribers[i](this.value);
    }
    return this;
};
exports.Observable.prototype.subscribe = function (subscriber, priority) {
    if (priority === undefined) {
        this.subscribers.push(subscriber);
    }
    else {
        this.subscribers.splice(priority, 0, subscriber);
    }
    return this;
};
exports.Observable.prototype.drop = function (subscriber) {
    this.subscribers = this.subscribers.filter((s) => s !== subscriber);
    return this;
};
exports.Observable.prototype.dropAll = function () {
    this.subscribers = [];
    return this;
};
exports.Observable.prototype.get = function () {
    return this.value;
};

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_solo_1 = require("./lib/app-solo");
require("./components/weather-nav");
require("./components/img-spinner");
function main() {
    if (window.Worker) {
        const weather_worker = new Worker('js/dist/workers/weather.js');
        weather_worker.onmessage = (e) => {
            console.log('test_worker said : ', e.data);
            app.pins.forecasts.set(e.data.forecasts);
            app.pins.day.set(0);
        };
        weather_worker.postMessage([]);
        console.log(weather_worker);
        const day_count = 5;
        const renderForecast = function (f, day) {
            const d = day === 0 ? f.current : f.daily[Math.min(day, day_count)];
            view.pins.city.set(f.city);
            view.pins.icon.set('icons/' + d.icon);
            view.pins.temp.set(`${d.temperature}°`);
            view.pins.wind.set(`Vent ${d.windSpeed}km/h (${d.windDeg}°)`);
            view.pins.date.set(new Date(d.timestamp).toLocaleDateString(navigator.language));
            view.pins.loading.set('');
        };
        const weather_nav = document.querySelector('weather-nav');
        const weather = document.getElementById('Weather');
        weather_nav.renderPlaceholder(day_count, '...');
        const app = new app_solo_1.Context();
        app
            .pub('forecasts', new app_solo_1.Observable(null), (f) => {
            renderForecast(f, 0);
            weather_nav.setOnClick(app.pins.day.set);
            weather_nav.render(f.daily.map((d) => d.timestamp), day_count);
        })
            .pub('day', new app_solo_1.Observable(0), (d) => {
            renderForecast(app.pins.forecasts.value, d);
        });
        const view = new app_solo_1.Context();
        view
            .pub('icon', new app_solo_1.Observable(''))
            .pub('date', new app_solo_1.Observable(''))
            .pub('loading', new app_solo_1.Observable('loading'))
            .muster(weather)
            .activateAll();
        const rate_limit_test = document.getElementById('RateLimit');
        const rate_limit_btn = document.getElementById('RateLimitBtn');
        const rate_limit = new app_solo_1.Context();
        rate_limit.muster(rate_limit_test).activateAll();
        rate_limit_btn.addEventListener('click', (e) => {
            console.log('click ----------------');
            for (let i = 0; i < 1000; i++) {
                rate_limit.pins.mouse_x.set(i);
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

},{"./components/img-spinner":1,"./components/weather-nav":2,"./lib/app-solo":4}]},{},[6]);
