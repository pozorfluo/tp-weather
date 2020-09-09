export interface GeoIpData {
  city?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  [prop: string]: any;
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
    [prop: string]: any;
  };
  [prop: string]: any;
}

async function geoIp(api_key: string): Promise<GeoIpData> {
  try {
    const response: Response = await fetch(
      `https://api.ipdata.co?api-key=${api_key}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );
    if (response.status >= 400 && response.status < 600) {
      throw new Error("Something went wrong contacting 'api.ipdata.co'.");
    }
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
    const response: Response = await fetch(
      `https://eu1.locationiq.com/v1/reverse.php?key=${api_key}&lat=${lat}&lon=${lon}&format=json`
    );
    if (response.status >= 400 && response.status < 600) {
      throw new Error("Something went wrong contacting 'eu1.locationiq.com'.");
    }
    const result = await response.json();
    return [
      result.address.country_code,
      result.address.city ?? result.address.town ?? result.address.village,
    ];
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

export async function geoLocate(api_keys: any): Promise<GeoInfo | null> {
  let lat = null;
  let lon = null;
  let city = null;
  let country_code = null;

  let coords = null;
  if (navigator.geolocation) {
    try {
      coords = await geoCoords();
    } catch (err) {
      console.log('Unable to retrieve coords using geolocation API. Using ip.');
    }
  }
  if (coords !== null) {
    lat = coords.coords.latitude;
    lon = coords.coords.longitude;
    [country_code, city] = await geoReverse(lat, lon, api_keys.map);
  }

  if (!(lat && lon && country_code && city)) {
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
