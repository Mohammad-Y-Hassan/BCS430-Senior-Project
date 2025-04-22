import React, { useEffect, useState, useMemo, useCallback } from "react";
import {    APIProvider,
            Map,
            MapCameraChangedEvent,
            AdvancedMarker,
            Pin,
            InfoWindow,
            useMap,
            useApiIsLoaded,
            useMapsLibrary,
            ControlPosition,
            MapControl, GoogleMap } from '@vis.gl/react-google-maps';
import { useNavigate } from "react-router-dom";
import Puzzlenobackground from "../src/Puzzlenobackground.gif";

const ActiveRide = () => {
    const navigate = useNavigate();

    const [activeride, setActiveRide] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const username_riders = localStorage.getItem("username");

    useEffect(() => {
      const fetchData = async () => {
        console.log(username_riders)
        setIsLoading(true);
        try {
            const activeride = await fetch(`http://localhost:5000/ActiveRide?param1=${username_riders}`);
            const data = await activeride.json();
            console.log("Data:" + data)
            setActiveRide(data);
        } catch (error) {
           console.error('Error fetching users:', error);
           setIsError(true)
        } finally {setIsLoading(false)}
      };
      fetchData();
    }, []);

    /*const [center, setCenter] = useState(null); // Store the map center coordinates

    const apikey = process.env.REACT_APP_API_KEY
    const geocodingLib = useMapsLibrary('geocoding');
    const [address, setAddress] = useState('');
    const [town, setTown] = useState('');
    const [building, setBuilding] = useState('');
    const [mapCenter, setMapCenter] = useState(null);
    const [zoom, setZoom] = useState(10)

    const geocodeAddress = useCallback(() => {
        if (!geocodingLib) return;
        const geocoder = new geocodingLib.Geocoder();

        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            const addressComponents = results[0].address_components;
            let foundTown = activeride.map(ride => ride.town);
            let foundBuilding = activeride.map(ride => ride.origin);
    
            for (const component of addressComponents) {
              if (component.types.includes('locality')) {
                foundTown = component.long_name;
              }
              if (component.types.includes('premise') || component.types.includes('subpremise')) {
                foundBuilding = component.long_name;
              }
            }
             setTown(foundTown);
             setBuilding(foundBuilding);
             const location = results[0].geometry.location;
             setMapCenter({ lat: location.lat(), lng: location.lng() });
          } else {
               setTown('Not Found');
               setBuilding('Not Found');
               setMapCenter(null)
            console.error('Geocoding failed:', status);
          }
        });
      }, [address, geocodingLib]);

      console.log(geocodingLib)
      useEffect(() => {
        geocodeAddress();
     }, [geocodeAddress]);

     const mapOptions = useMemo(() => ({
        mapId:'YOUR_MAP_ID',
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl:false
      }), []);*/

    const handleCompleteRide = async () => {
        const username_riders = localStorage.getItem("username");
        const userToUpdate = { username_riders};
        try {
            const creatingOrder = await fetch("http://localhost:5000/CompleteRide", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userToUpdate),
            });
            const data = await creatingOrder.json();
            if (creatingOrder.ok) {
                console.log("Order Made successfully");
                localStorage.removeItem("ActiveRide")
                navigate("/");
            } else {
                console.error("Failed to create order:", data.message);
            }
        } catch (error) {
            console.error("Server error:", error);
        }
    };

    const handleCall = () => {window.location.href = `tel:${+16317030199}`;};

    console.log("Active Ride:" + activeride);
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
                    <div style={{ textAlign: "center", marginTop: "50px" }}>
                        <h2>Active Ride</h2>
                        {isError && <div>An error has occured!</div>}
                        {isLoading && <div> <img src={Puzzlenobackground} alt="loading..." /><br></br>Loading...</div>}
                        {!isLoading && (            <ul>
                        {activeride.map(ride => (
                        <li key={ride.order_id}>
                        <p> Your Driver is : {ride.username_drivers}<br></br>
                            You will be picked up at : {ride.origin} in {ride.town} at {ride.time}<br></br>
                            {/*<APIProvider apiKey = {apikey}>
                            {mapCenter && (
                            <Map defaultZoom={15} defaultCenter={mapCenter} options = {mapOptions}>
                            <AdvancedMarker position={center} />
                            </Map>
                            )}
                            </APIProvider>*/}
                            You are going to : {ride.destination}<br></br>
                            Other Riders:<br></br>
                            {(ride.Rider1 == null || ride.Rider1 == username_riders) && 
                             (ride.Rider2 == null || ride.Rider2 == username_riders) &&
                             (ride.Rider3 == null || ride.Rider3 == username_riders) &&
                             (ride.Rider4 == null || ride.Rider4 == username_riders) && 
                             (ride.Rider5 == null || ride.Rider5 == username_riders) && 
                             (ride.Rider6 == null || ride.Rider6 == username_riders) && 
                             (<p>There are currently no other passengers</p>)}
                            {ride.Rider1 != null && ride.Rider1 != username_riders && ride.Rider1}
                            {ride.Rider2 != null && ride.Rider2 != username_riders && ride.Rider2}
                            {ride.Rider3 != null && ride.Rider3 != username_riders && ride.Rider3}
                            {ride.Rider4 != null && ride.Rider4 != username_riders && ride.Rider4}
                            {ride.Rider5 != null && ride.Rider5 != username_riders && ride.Rider5}
                            {ride.Rider6 != null && ride.Rider6 != username_riders && ride.Rider6}
                            They have {ride.seat_number} seats avaliable<br></br>
                            <button onClick={() => handleCompleteRide()}>Complete Ride</button></p>
                        </li>
                        ))}
                        </ul>)}
                        <button onClick={() => navigate("/")}>Home</button>
                        <button onClick={handleCall}>Emergency Call </button>
                    </div>
        </div>
        
    );
};

export default ActiveRide;