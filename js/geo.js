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
