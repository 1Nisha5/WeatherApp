import React, { useState } from 'react';
import './InputModes.css';

const InputModes = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleLatitudeChange = (e) => {
    setLatitude(e.target.value);
  };

  const handleLongitudeChange = (e) => {
    setLongitude(e.target.value);
  };

  const handleSearch = () => {
    onSearch(location, latitude, longitude);
  };

  return (
    <div className="input-modes-container">
      <h2>Input Modes</h2>
      <div className="input-group">
        <label htmlFor="location">Location:</label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={handleLocationChange}
        />
      </div>
      <div className="input-group">
        <label htmlFor="latitude">Latitude:</label>
        <input
          type="text"
          id="latitude"
          value={latitude}
          onChange={handleLatitudeChange}
        />
      </div>
      <div className="input-group">
        <label htmlFor="longitude">Longitude:</label>
        <input
          type="text"
          id="longitude"
          value={longitude}
          onChange={handleLongitudeChange}
        />
      </div>
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default InputModes;

