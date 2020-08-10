'use strict';

// import { checkServerIdentity } from 'tls';

export interface GeoIpData {
  city?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  [propName: string]: any;
}

export interface GeoInfo {
  countryCode: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface GeoLoc {
  coords: {
    latitude: number;
    longitude: number;
    [propName: string]: any;
  };
  [propName: string]: any;
}

/**
 * Workaround commiting api keys to git for this exercise.
 */
async function getApiKeys() {
  console.log(__dirname);
  const api_keys = await fetch('/../keys.env', { mode: 'no-cors' })
    .then((response) => response.json())
    .then((json) => {
      //   api_keys = json;
      return json;
    })
    .catch((error) => console.log(error));
  console.log(api_keys);
  return api_keys;
}
// async function waitAndMaybeReject(): Promise<string> {
//   // Wait one second
//   await new Promise((r) => setTimeout(r, 1000));
//   // Toss a coin
//   const isHeads = Boolean(Math.round(Math.random()));

//   if (isHeads) return 'yay';
//   throw Error('Boo!');
// }

async function geoIp(api_key: string): Promise<GeoIpData> {
  try {
    // const response: Promise<string> = waitAndMaybeReject();
    console.log(`https://api.ipdata.co?api-key=${api_key}`);
    const response: Response = await fetch(
      `https://api.ipdata.co?api-key=${api_key}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );
    return response.json();
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function geoReverse(
  lat: number,
  lon: number,
  api_key: string
): Promise<[string | null, string | null]> {
  try {
    console.log(
      `https://eu1.locationiq.com/v1/reverse.php?key=${api_key}&lat=${lat}&lon=${lon}&format=json`
    );
    const response: Response = await fetch(
      `https://eu1.locationiq.com/v1/reverse.php?key=${api_key}&lat=${lat}&lon=${lon}&format=json`
    );
    const result = await response.json();
    return [result.address.country_code, result.address.town];
  } catch (err) {
    console.log(err);
    return [null, null];
  }
}

// function geoSuccess(position: any): [number, number] {
//   return [position.coords.latitude, position.coords.longitude];
// }

// function geoError(): string {
//   console.log('geoError');
//   return 'geoError';
// }

async function geoCoords(): Promise<GeoLoc | null> {
  const options = {
    maximumAge: 30000,
    timeout: 10000,
  };

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export async function geoLocate(): Promise<GeoInfo | null> {
  let lat = null;
  let lon = null;
  let city = null;
  let country_code = null;
  const api_keys = await getApiKeys();

  let coords = null;
  if (navigator.geolocation) {
    try {
      coords = await geoCoords();
    } catch (err) {
      console.log('Unable to retrieve coords using geolocation API.');
    }
  }

  if (coords !== null) {
    lat = coords.coords.latitude;
    lon = coords.coords.longitude;
    [country_code, city] = await geoReverse(lat, lon, api_keys.map);
  } else {
    ({ latitude: lat, longitude: lon, country_code, city } = await geoIp(
      api_keys.ipdata
    ));
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
