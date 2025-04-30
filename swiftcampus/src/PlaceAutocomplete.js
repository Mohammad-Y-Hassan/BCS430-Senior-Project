import { useEffect, useState, useRef } from "react"
import {useMapsLibrary} from "@vis.gl/react-google-maps"


const PlaceAutocomplete = ({ onPlaceSelect }) => {
  const places = useMapsLibrary("places") // Load places library for the element
  const inputRef = useRef(null) // Ref for the web component itself
  const [elementIsReady, setElementIsReady] = useState(false)

  // Store onPlaceSelect in a ref to avoid it being a dependency of the main effect
  // This prevents resetting the listener if the parent re-renders unnecessarily
  const onPlaceSelectRef = useRef(onPlaceSelect)
  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect
  }, [onPlaceSelect])

  // Effect to track when the ref is attached
  useEffect(() => {
    if (inputRef.current) {
      console.log("PlaceAutocompleteElement ref attached.")
      setElementIsReady(true)
    } else {
      console.log("PlaceAutocompleteElement ref not ready yet.")
      setElementIsReady(false) // Reset if ref becomes null
    }
  }, [inputRef.current]) // Re-run if the ref's current value changes

  // Effect to add the event listener once dependencies are ready
  useEffect(() => {
    // Wait for places library and the element ref
    if (!places || !elementIsReady || !inputRef.current) {
      console.log(
        "PlaceAutocomplete listener effect: Waiting for dependencies (places, element)..."
      )
      return
    }

    const currentElement = inputRef.current // Capture ref value
    console.log(
      "PlaceAutocomplete listener effect: Adding gmp-placeselect listener."
    )

    const handlePlaceSelect = event => {
      // Type assertion to access the 'place' property
      const element = event.target
      const placeResult = element?.place

      console.log("gmp-placeselect event fired:", event)

      if (placeResult && placeResult.geometry && placeResult.name) {
        console.log("Place selected:", placeResult.name)
        // Use the stable ref for the callback
        if (onPlaceSelectRef.current) {
          onPlaceSelectRef.current(placeResult)
        }
      } else {
        console.warn(
          "Place selection event fired, but no valid place data found on element:",
          placeResult
        )
        if (onPlaceSelectRef.current) {
          onPlaceSelectRef.current(null) // Notify parent that selection failed/cleared
        }
      }
    }

    // Add the event listener
    currentElement.addEventListener("gmp-placeselect", handlePlaceSelect)

    // Cleanup function
    return () => {
      console.log(
        "PlaceAutocomplete listener effect: Removing gmp-placeselect listener."
      )
      // Use the captured ref value in cleanup
      currentElement.removeEventListener("gmp-placeselect", handlePlaceSelect)
    }

    // Dependencies: only re-run if the library or element readiness changes
  }, [places, elementIsReady])

  return (
    <div className="autocomplete-container">
      {/* Render the Web Component once the places library is loaded */}
      {places ? (
        <gmp-place-autocomplete
          ref={inputRef}
          // The API key should be handled by the APIProvider wrapping the app
          placeholder="Enter pickup location"
        ></gmp-place-autocomplete>
      ) : (
        <input placeholder="Loading autocomplete..." disabled />
      )}
    </div>
  )
}

export default PlaceAutocomplete;