"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {  APIProvider,
          Map,
          MapCameraChangedEvent,
          AdvancedMarker,
          Pin,
          InfoWindow,
          useMap,
          useApiIsLoaded,
          useMapsLibrary,
          ControlPosition,
          MapControl,} from "@vis.gl/react-google-maps";


const FromCampus = () => {
  const [message, setMessage] = useState("");
  const [seat_number, setSeat_Number] = useState("1");
  const [time, setTime] = useState("08:00");
  const [origin, setOrigin] = useState("Amityville");
  const [isSuccess, setIsSuccess] = useState(null);
  const [destination, setDestination] = useState("Campus Center");
  const [town, setTown] = useState("");
  const navigate = useNavigate();

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  const apiIsLoaded = useApiIsLoaded();
  const [selectedPoiKey, setSelectedPoiKey] = useState(null)
  const initialCenter = { lat: 40.7529, lng: -73.4266 }; // Renamed for clarity
  const [selectedPlace, setSelectedPlace] = useState(null);

  const PoiFarmingdaleData: Poi[] = [ // Changed variable name to avoid conflict with type
    { key: 'Horton Hall', location: { lat: 40.75505279375311, lng: -73.42712174038577 } },
    { key: 'New York State University Department', location: { lat: 40.755616128470336, lng: -73.42652142680525 } },
    { key: 'Campus Center', location: { lat: 40.7543944326731, lng: -73.42814316946303 } },
    { key: 'Quintyne Hall', location: { lat: 40.75360031835355, lng: -73.42891372126803 } },
    { key: 'Thompson Hall', location: { lat: 40.75349172078801, lng: -73.42739949746048 } },
    { key: 'Farmingdale Child Care', location: { lat: 40.75352565754538, lng: -73.42360945791098 } },
    { key: 'Hale Hall', location: { lat: 40.75214781119411, lng: -73.43022186726918 } },
    { key: 'Lupton Hall', location: { lat: 40.75026086202828, lng: -73.43164649199423 } },
    { key: 'Admission Office', location: { lat: 40.750790299212035, lng: -73.42847468583453 } },
    { key: 'Alumni Hall', location: { lat: 40.751068591425145, lng: -73.42671854461396 } },
    { key: 'Dewey Hall', location: { lat: 40.75165911006816, lng: -73.42599279237483 } },
    { key: 'Orchard Hall', location: { lat: 40.75118398053776, lng: -73.4244248091422 } },
    { key: 'Nold Hall', location: { lat: 40.74890331150685, lng: -73.4315031335917 } },
  ];

  const PoiPickUpData: Poi[] = [ // Changed variable name to avoid conflict with type
    { key: "Dunkin' Donuts", location: { lat: 40.68382385190947, lng: -73.41709146595642} },
  ];

  type Poi = {
    key: string;
    location: { lat: number; lng: number };
  };
  
  // Define props for PoiMarkers component
  interface PoiMarkersProps {
    pois: Poi[];
    selectedPoiKey: string | null; // Track which marker is selected
    onMarkerClick: (key: string | null) => void; // Function to set the selected key
  }
  
  const PoiMarkers = (props: PoiMarkersProps) => {
    const { pois, selectedPoiKey, onMarkerClick } = props;
    const map = useMap();
  
    // Memoize click handler to avoid unnecessary re-renders
    const handleMarkerClick = useCallback((poiKey: string, poiLocation: { lat: number; lng: number }) => {
      if (map) {
         map.panTo(poiLocation); // Pan to the clicked marker
      }
      onMarkerClick(poiKey); // Set the currently selected marker's key
      console.log('marker clicked:', poiKey, poiLocation);
      setDestination(poiKey);
      console.log(destination)
    }, [map, onMarkerClick]); // Dependencies for useCallback
  
    // Memoize close handler
    const handleInfoWindowClose = useCallback(() => {
      onMarkerClick(null); // Deselect marker by setting key to null
    }, [onMarkerClick]);
  
    return (
      <>
        {pois.map((poi: Poi) => (
          // Use React.Fragment to provide a key for the group of Marker + InfoWindow
          <React.Fragment key={poi.key}>
            <AdvancedMarker
              position={poi.location}
              clickable={true}
              onClick={() => handleMarkerClick(poi.key, poi.location)} // Pass POI key and location
            >
              <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
            </AdvancedMarker>
  
            {/* Conditionally render InfoWindow only if this POI is selected */}
            {selectedPoiKey === poi.key && (
              <InfoWindow
                position={poi.location} // Position the InfoWindow at the marker's location
                onCloseClick={handleInfoWindowClose} // Handle closing the InfoWindow
              >
                {/* Display content specific to this POI */}
                <p style={{ fontWeight: 'bold', margin: 0 }}>{poi.key}</p>
                <p style={{ margin: '2px 0 0 0' }}>You want to drop off here?</p>
              </InfoWindow>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  const PoiPickUpMarkers = (props: PoiMarkersProps) => {
    const { pois, selectedPoiKey, onMarkerClick } = props;
    const map = useMap();
  
    // Memoize click handler to avoid unnecessary re-renders
    const handleMarkerClick = useCallback((poiKey: string, poiLocation: { lat: number; lng: number }) => {
      if (map) {
         map.panTo(poiLocation); // Pan to the clicked marker
      }
      onMarkerClick(poiKey); // Set the currently selected marker's key
      console.log('marker clicked:', poiKey, poiLocation);
      setOrigin(poiKey);
      console.log(destination)
    }, [map, onMarkerClick]); // Dependencies for useCallback
  
    // Memoize close handler
    const handleInfoWindowClose = useCallback(() => {
      onMarkerClick(null); // Deselect marker by setting key to null
    }, [onMarkerClick]);
  
    return (
      <>
        {pois.map((poi: Poi) => (
          // Use React.Fragment to provide a key for the group of Marker + InfoWindow
          <React.Fragment key={poi.key}>
            <AdvancedMarker
              position={poi.location}
              clickable={true}
              onClick={() => handleMarkerClick(poi.key, poi.location)} // Pass POI key and location
            >
              <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
            </AdvancedMarker>
  
            {/* Conditionally render InfoWindow only if this POI is selected */}
            {selectedPoiKey === poi.key && (
              <InfoWindow
                position={poi.location} // Position the InfoWindow at the marker's location
                onCloseClick={handleInfoWindowClose} // Handle closing the InfoWindow
              >
                {/* Display content specific to this POI */}
                <p style={{ fontWeight: 'bold', margin: 0 }}>{poi.key}</p>
                <p style={{ margin: '2px 0 0 0' }}>You want to Pickup here?</p>
              </InfoWindow>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  useEffect(() => {
    if (apiIsLoaded) {
      console.log('Google Maps API is loaded.');
    } else {
      console.log("Google Maps API is not loaded yet.");
    }
  }, [apiIsLoaded]);

  const handleOrder = async (e) => {
    e.preventDefault();

    const Order_Date = `${yyyy}-${mm}-${dd}`;
    const username_drivers = localStorage.getItem("driverUsername"); // ✅ Correct key
    const userOrder = {
      Order_Date,
      username_drivers,
      seat_number,
      time,
      origin,
      destination,
      town
    };
    console.log(userOrder)

    try {
      const creatingorder = await fetch("http://localhost:5000/orderridetocampus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userOrder),
      });

      const data = await creatingorder.json();
      setMessage(data.message);
      setIsSuccess(creatingorder.ok);

      if (creatingorder.ok) {
        console.log("Order made successfully.");
        setTimeout(() => navigate("/driver-home"), 1500); // ✅ Redirect to driver home
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage("Server error. Please try again later.");
    }
  };

  const PlaceAutocomplete = ({ onPlaceSelect }) => {
    const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
    const inputRef = useRef(null);
    const places = useMapsLibrary("places");
  
    useEffect(() => {
      if (!places || !inputRef.current) return;
  
      const options = {
        fields: ["geometry", "name", "formatted_address"],
      };
  
      setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
    }, [places]);
    useEffect(() => {
      if (!placeAutocomplete) return;
  
      placeAutocomplete.addListener("place_changed", () => {
        onPlaceSelect(placeAutocomplete.getPlace());
      });
    }, [onPlaceSelect, placeAutocomplete]);
    return (
      <div className="autocomplete-container">
        <input ref={inputRef} />
      </div>
    );
  };

  const MapHandler = ({ place }) => {
    const map = useMap();
  
    useEffect(() => {
      if (!map || !place ) return;
  
      if (place.geometry?.viewport) {
        map.fitBounds(place.geometry?.viewport);
      }
      console.log(place.name)
      setTown(place.name)
      }, [map, place]);
    return null;
  };

  return (
    <div style={{ textAlign: "center" }}>
      {/* Top Navigation */}
      <div style={{ marginBottom: "20px" }}>
        <Link to="/driver-home" style={{ marginRight: "15px", fontWeight: "bold", color: "purple", textDecoration: "underline" }}>
          Home
        </Link>
        |
        <Link to="/driver-profile" style={{ marginLeft: "15px", fontWeight: "bold", color: "purple", textDecoration: "underline" }}>
          Profile
        </Link>
      </div>

      <h2 class="headerfont">Ride From Campus</h2>
      <form onSubmit={handleOrder}>
        <label class="fromcamptxt">Available Seats: </label>
        <select class="rideselect" value={seat_number} onChange={(e) => setSeat_Number(e.target.value)} required>
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <br />
        <label class="fromcamptxt">Pickup Time: </label>
        <select class="rideselect" value={time} onChange={(e) => setTime(e.target.value)} required>
          {["8:00AM", "9:00AM", "10:00AM", "11:00AM", "12:00PM", "1:00PM", "2:00PM", "3:00PM", "4:00PM", "5:00PM", "6:00PM", "7:00PM", "8:00PM"].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <br />
{/*        <label class="fromcamptxt">Pickup Destination: </label>
        <select class="rideselect" value={origin} onChange={(e) => setOrigin(e.target.value)} required>
          <option value="Amityville">Amityville</option>
          <option value="Bethpage">Bethpage</option>
          <option value="Garden City">Garden City</option>
          <option value="Port Jefferson">Port Jefferson</option>
          <option value="Glen Cove">Glen Cove</option>
          <option value="Elmont">Elmont</option>
          <option value="Freeport">Freeport</option>
          <option value="Islip">Islip</option>
          <option value="Huntington">Huntington</option>
          <option value="Montauk">Montauk</option>

        </select>*/}
        <div style={{ display: 'flex' }}>
                {/* ---- Map Section 1---- */}
        {/* Make sure API key is securely managed in real apps (e.g., environment variables) */}
        <APIProvider apiKey="AIzaSyCxoELhG4wyJw_dqkYTc0shs3nPcgtJyqY" onLoad={() => console.log('Maps API provider loaded.')}>
          <div className="mapstyle" > {/* Example styling */}
            <Map
              defaultZoom={15} // Slightly zoomed out to see more POIs initially
              defaultCenter={initialCenter}
              mapId={"DEMO_MAP_ID"} // Consider using a unique Map ID
              onCameraChanged={(ev: MapCameraChangedEvent) =>
                console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
              }
              gestureHandling={'greedy'} // Allow easier map interaction
              //disableDefaultUI={true} // Optional: hide default controls
            >
              {/* Pass POIs, selected key, and handler to the PoiMarkers component */}
              <PoiPickUpMarkers
                pois={PoiPickUpData}
                selectedPoiKey={selectedPoiKey}
                onMarkerClick={setSelectedPoiKey}
              />
                       {/* Optional: Add a marker for the initial center if needed */}
             {/*
              <AdvancedMarker position={initialCenter}>
                <Pin background={"blue"} borderColor={"white"} glyphColor={"white"}/>
              </AdvancedMarker>
             */}

            </Map>
            <MapControl position={ControlPosition.TOP}>
            <div className="autocomplete-control">
            <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
            </div>
            </MapControl>
            <MapHandler place={selectedPlace} />
          </div>
        </APIProvider>
        {/* ---- End Map Section 1---- */}
        <br />        <br />
        {/* ---- Map Section 2---- */}
        {/* Make sure API key is securely managed in real apps (e.g., environment variables) */}
        <APIProvider apiKey="AIzaSyCxoELhG4wyJw_dqkYTc0shs3nPcgtJyqY" onLoad={() => console.log('Maps API provider loaded.')}>
          <div className="mapstyle" > {/* Example styling */}
            <Map
              defaultZoom={15} // Slightly zoomed out to see more POIs initially
              defaultCenter={initialCenter}
              mapId={"DEMO_MAP_ID"} // Consider using a unique Map ID
              onCameraChanged={(ev: MapCameraChangedEvent) =>
                console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
              }
              gestureHandling={'greedy'} // Allow easier map interaction
              //disableDefaultUI={true} // Optional: hide default controls
            >
              {/* Pass POIs, selected key, and handler to the PoiMarkers component */}
              <PoiMarkers
                pois={PoiFarmingdaleData}
                selectedPoiKey={selectedPoiKey}
                onMarkerClick={setSelectedPoiKey}
              />

             {/* Optional: Add a marker for the initial center if needed */}
             {/*
              <AdvancedMarker position={initialCenter}>
                <Pin background={"blue"} borderColor={"white"} glyphColor={"white"}/>
              </AdvancedMarker>
             */}

            </Map>
          </div>
        </APIProvider>
        {/* ---- End Map Section 2---- */}
        </div>
        <button class="submitbtn" type="submit">Make Order </button>
      </form>

      {message && <p style={{ color: isSuccess ? "green" : "red" }}>{message}</p>}
    </div>
  );
};

export default FromCampus;
