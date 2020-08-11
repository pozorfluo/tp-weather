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
    console.log(owm);
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
