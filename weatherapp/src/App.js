import React, { useState } from 'react';
import InputModes from './InputModes';
import WeatherReport from './WeatherReport';
import Navbar from './Navbar';
import './App.css';

const API_KEY = 'bef9ab8d6a590c6352a148dcd995af0e'; 

const App = () => {
  const [weatherData, setWeatherData] = useState(null);

  const handleSearch = async (location, latitude, longitude) => {
    try {
      let response;
      if (location) {
        response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}`
        );
      } else {
        response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
        );
      }

      if (response.ok) {
        const data = await response.json();
        const weather = {
          location: data.name,
          temperature: `${Math.round(data.main.temp - 273.15)}°C`,
          description: data.weather[0].description,
        };
        setWeatherData(weather);
      } else {
        console.error('Failed to fetch weather data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="content-container">
      <div className="components-container">
          <InputModes className="im" onSearch={handleSearch} />
          {weatherData && <WeatherReport className="wr" weatherData={weatherData} />}
        </div>
      </div>
    </div>
  );
};

export default App;
