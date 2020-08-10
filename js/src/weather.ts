'use strict';

import { GeoInfo } from './geo';

export interface OWMOneCallResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: {
    [propName: string]: any;
  };
  daily: {
    [propName: string]: any;
  };
  [propName: string]: any;
}

export async function getDailyForecasts(
  loc: GeoInfo,
  api_keys: any
): Promise<OWMOneCallResponse | null> {
  try {
    const response: Response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lang=${loc.countryCode}&units=metric&lat=${loc.latitude}&lon=${loc.longitude}&exclude=minutely,hourly&appid=${api_keys.owm}`
    );
    if (response.status >= 400 && response.status < 600) {
      throw new Error(
        "Something went wrong contacting 'api.openweathermap.org'."
      );
    }
    return response.json();
  } catch (err) {
    console.log(err);
    return null;
  }
}
