// MapInstanceChecker.jsx
import React, { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

// Renamed prop for clarity
const MapInstanceChecker = ({ onMapInstanceReady }) => {
    const map = useMap();
    // Use a ref to track if we've already passed the instance up
    // to avoid unnecessary state updates in parent if map instance reference is stable
    const instanceSentRef = useRef(false);

    useEffect(() => {
        // If we get a map instance and haven't sent it yet
        if (map && !instanceSentRef.current) {
            console.log(">>> Map instance obtained via useMap() in child. Calling onMapInstanceReady.", map);
            onMapInstanceReady(map); // Pass instance to parent
            instanceSentRef.current = true; // Mark as sent
        }
        // Optional: Handle if map becomes null later (e.g., component unmounts)
        // else if (!map && instanceSentRef.current) {
        //     console.log(">>> Map instance became null in child.");
        //     instanceSentRef.current = false; // Reset if needed
        // }
    }, [map, onMapInstanceReady]); // Depend on map instance and the callback

    // Cleanup function to reset the ref on unmount
    useEffect(() => {
        return () => {
            instanceSentRef.current = false;
        }
    }, []);

    return null; // Component renders nothing
};

export default MapInstanceChecker;