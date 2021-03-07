import ICurrentWather from "./ICurrentWeather";

export default interface IGetCurrentWeatherResponse {
  data: ICurrentWather[];
  count: number;
}
