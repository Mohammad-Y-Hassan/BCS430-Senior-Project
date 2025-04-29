// MinimalMapTest.js
"use client";
import React, { useState } from 'react';
import { Map, useApiIsLoaded } from '@vis.gl/react-google-maps';

const API_KEY = process.env.REACT_APP_API_KEY; // Or paste directly for testing

const MinimalMapTest = () => {
  const apiLoaded = useApiIsLoaded();
  const [mapLoaded, setMapLoaded] = useState(false);

  console.log("API Loaded:", apiLoaded);
  console.log("Map Loaded:", mapLoaded);

  return (
      <div style={{ width: '500px', height: '400px', margin: '20px auto' }}>
        <h2>Minimal Map Test</h2>
        <p>{apiLoaded ? 'API Script Loaded' : 'API Script Loading...'}</p>
        <p>{mapLoaded ? 'Map Component Loaded' : 'Map Component Loading...'}</p>
        <Map
          defaultZoom={10}
          defaultCenter={{ lat: 40.7529, lng: -73.4266 }}
          mapId={"DEMO_MAP_ID"} // Use a unique or DEMO_MAP_ID
          onLoad={() => {
            console.log("Minimal Map onLoad FIRED!"); // <-- Check for this log
            setMapLoaded(true);
          }}
          onError={(e) => {
             console.error("Minimal Map onError FIRED:", e); // <-- Check for errors here too
          }}
        >
          {/* No children */}
        </Map>
      </div>
  );
};

export default MinimalMapTest;