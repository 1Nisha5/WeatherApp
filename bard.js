import React, { useState } from "react";
import axios from "axios";

const WeatherReport = () => {
  const [city, setCity] = useState("");
  const [coordinates, setCoordinates] = useState([0, 0]);
  const [weather, setWeather] = useState(null);

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handleCoordinatesChange = (e) => {
    setCoordinates(e.target.value.split(","));
  };

  const fetchWeather = async () => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=YOUR_API_KEY`;
    const response = await axios.get(url);
    setWeather(response.data);
  };

  return (
    <div>
      <h1>Weather Report</h1>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={handleCityChange}
      />
      <input
        type="text"
        placeholder="Enter coordinates"
        value={coordinates.join(",")}
        onChange={handleCoordinatesChange}
      />
      <button onClick={fetchWeather}>Get Weather</button>
      {weather && (
        <div>
          <h2>City: {weather.name}</h2>
          <h3>Weather: {weather.weather[0].description}</h3>
          <h4>Temperature: {weather.main.temp}°C</h4>
          <h4>Humidity: {weather.main.humidity}%</h4>
          <h4>Wind speed: {weather.wind.speed}m/s</h4>
        </div>
      )}
    </div>
  );
};

export default WeatherReport;
