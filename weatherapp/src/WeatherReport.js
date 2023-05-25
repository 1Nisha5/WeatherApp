import React from 'react';
import './WeatherReport.css'; 
import { WiDaySunny, WiCloudy, WiRain, WiSnow } from 'react-icons/wi';

const WeatherReport = ({ weatherData }) => {
  const { location, temperature, description } = weatherData;

  const getWeatherIcon = (description) => {
    switch (description.toLowerCase()) {
      case 'sunny':
        return <WiDaySunny />;
      case 'cloudy':
        return <WiCloudy />;
      case 'rain':
        return <WiRain />;
      case 'snow':
        return <WiSnow />;
      default:
        return null;
    }
  };

  return (
    <div className="weather-report-container">
      <h2>{location}</h2>
      <div className="weather-details">
        <div className="weather-item">
          <span className="weather-label">Temperature:</span>
          <span className="weather-value">{temperature}</span>
        </div>
        <div className="weather-item">
          <span className="weather-label">Description:</span>
          <span className="weather-value">{description}</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherReport;
