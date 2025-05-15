"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useApiIsLoaded,
  useMapsLibrary,
  ControlPosition,
  MapControl
} from "@vis.gl/react-google-maps"
import "./calender.css";
import { Info, DateTime, Interval } from "luxon";
import classnames from "classnames";
import {motion } from "framer-motion"
import "./FromCampus.css"

const FromCampus = () => {
  const [message, setMessage] = useState("")
  const [seat_number, setSeat_Number] = useState("1")
  const [time, setTime] = useState("08:00")
  const [origin, setOrigin] = useState("Amityville")
  const [isSuccess, setIsSuccess] = useState(null)
  const [destination, setDestination] = useState("Campus Center")
  const [town, setTown] = useState("")
  const [scheduled_date, setScheduledDay] = useState(null);
  const navigate = useNavigate()
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");

  
  const thisday = new Date()
  const dd = String(thisday.getDate()).padStart(2, "0")
  const mm = String(thisday.getMonth() + 1).padStart(2, "0")
  const yyyy = thisday.getFullYear()

  const apiIsLoaded = useApiIsLoaded()
  const [selectedPoiKey, setSelectedPoiKey] = useState(null)
  const initialCenter = { lat: 40.7529, lng: -73.4266 } // Renamed for clarity
  const [selectedPlace, setSelectedPlace] = useState(null)

  const PoiFarmingdaleData = [
    // Changed variable name to avoid conflict with type
    {
      key: "Horton Hall",
      location: { lat: 40.75505279375311, lng: -73.42712174038577 }
    },
    {
      key: "New York State University Department",
      location: { lat: 40.755616128470336, lng: -73.42652142680525 }
    },
    {
      key: "Campus Center",
      location: { lat: 40.7543944326731, lng: -73.42814316946303 }
    },
    {
      key: "Quintyne Hall",
      location: { lat: 40.75360031835355, lng: -73.42891372126803 }
    },
    {
      key: "Thompson Hall",
      location: { lat: 40.75349172078801, lng: -73.42739949746048 }
    },
    {
      key: "Farmingdale Child Care",
      location: { lat: 40.75352565754538, lng: -73.42360945791098 }
    },
    {
      key: "Hale Hall",
      location: { lat: 40.75214781119411, lng: -73.43022186726918 }
    },
    {
      key: "Lupton Hall",
      location: { lat: 40.75026086202828, lng: -73.43164649199423 }
    },
    {
      key: "Admission Office",
      location: { lat: 40.750790299212035, lng: -73.42847468583453 }
    },
    {
      key: "Alumni Hall",
      location: { lat: 40.751068591425145, lng: -73.42671854461396 }
    },
    {
      key: "Dewey Hall",
      location: { lat: 40.75165911006816, lng: -73.42599279237483 }
    },
    {
      key: "Orchard Hall",
      location: { lat: 40.75118398053776, lng: -73.4244248091422 }
    },
    {
      key: "Nold Hall",
      location: { lat: 40.74890331150685, lng: -73.4315031335917 }
    }
  ]

  const PoiPickUpData = [
    // Changed variable name to avoid conflict with type
    {
      key: "Dunkin' Donuts",
      location: { lat: 40.68382385190947, lng: -73.41709146595642 },
      town : "Amityville"
    },
    {
      key: "7-Eleven",
      location: { lat: 40.68583028397215, lng: -73.41815854910737 },
      town : "Amityville"
    },
    {
      key: "Amityville Train Station",
      location: { lat: 40.68025906149632, lng: -73.42054922009916 },
      town : "Amityville"
    },
    {
      key: "Poppy's Bagel",
      location: { lat: 40.675090466577515, lng: -73.41661361188918 },
      town : "Amityville"
    },
    {
      key: "High Fidelity Records & CDs",
      location: { lat: 40.6709928831099, lng: -73.41691179356238 },
      town : "Amityville"
    },
    {
      key: "Bethpage Train Station",
      location: { lat: 40.74272643022623, lng: -73.48279783930379 },
      town : "Bethpage"
    },
    {
      key: "Crestline Park",
      location: { lat: 40.73298349016668, lng: -73.48432836226641 },
      town : "Bethpage"
    },
    {
      key: "Mobil",
      location: { lat: 40.73815485748685, lng: -73.48082623450229 },
      town : "Bethpage"
    },
    {
      key: "Bethpage Community Park",
      location: { lat: 40.75630050248238, lng: -73.48614300449157 },
      town : "Bethpage"
    },
    {
      key: "Carvel",
      location: { lat: 40.742911935796734, lng: -73.4809674669909 },
      town : "Bethpage"
    },
    {
      key: "Garden City Station",
      location: { lat: 40.72321917105126, lng: -73.64042299388188 },
      town : "Garden City"
    },
    {
      key: "Novita",
      location: { lat: 40.72757339914262, lng: -73.63520879822681 },
      town : "Garden City"
    },
    {
      key: "The Garden City Hotel",
      location: { lat: 40.72459412392653, lng: -73.6405801470497 },
      town : "Garden City"
    },
    {
      key: "BK Sweeney's Uptown Grille",
      location: { lat: 40.72414799155494, lng: -73.63391948060982 },
      town : "Garden City"
    },
    {
      key: "Nassau County Supreme Court",
      location: { lat: 40.73616133902359, lng: -73.63338231895696 },
      town : "Garden City"
    },
    {
      key: "Port Jefferson Train Station",
      location: { lat: 40.93462993549318, lng: -73.05367312092774 },
      town : "Port Jefferson"
    },
    {
      key: "Theatre Three",
      location: { lat: 40.94377737508194, lng: -73.06737744405713 },
      town : "Port Jefferson"
    },
    {
      key: "Drowned Meadow Cottage Museum",
      location: { lat: 40.94552993193306, lng: -73.0723665275546 },
      town : "Port Jefferson"
    },
    {
      key: "Gentle Dental - Port Jefferson - A Dental365 Company",
      location: { lat: 40.93994509335891, lng: -73.06205222668162 },
      town : "Port Jefferson"
    },
    {
      key: "The Grille at Waterview",
      location: { lat: 40.96311395817188, lng: -73.05253240348435 },
      town : "Port Jefferson"
    },
    {
      key: "Glen Cove Train Station",
      location: { lat: 40.86578520495942, lng: -73.61647346874972 },
      town : "Glen Cove"
    },
    {
      key: "PetSmart",
      location: { lat: 40.86787260459076, lng: -73.63127516576554 },
      town : "Glen Cove"
    },
    {
      key: "Forest Ave Grill",
      location: { lat: 40.87410244640033, lng: -73.61595662162966 },
      town : "Glen Cove"
    },
    {
      key: "Panera Bread",
      location: { lat: 40.86360504497582, lng: -73.63314441867486 },
      town : "Glen Cove"
    },
    {
      key: "Cactus Cafe, Glen Cove",
      location: { lat: 40.84814384200413, lng: -73.63526412922937 },
      town : "Glen Cove"
    },
    {
      key: "Elmont UBS Arena",
      location: { lat: 40.72019992396041, lng: -73.72499790310557 },
      town : "Elmont"
    },
    {
      key: "Elmont Public Library",
      location: { lat: 40.708143403324534, lng: -73.69963490989853 },
      town : "Elmont"
    },
    {
      key: "King Umberto",
      location: { lat: 40.70798377049609, lng: -73.69018040005564 },
      town : "Elmont"
    },
    {
      key: "Belmont Deli and Grill",
      location: { lat: 40.708960479953056, lng: -73.72191527255265 },
      town : "Elmont"
    },
    {
      key: "Yard Flavors",
      location: { lat: 40.708434351607146, lng: -73.71017863894265 },
      town : "Elmont"
    },
    {
      key: "Freeport Train Station",
      location: { lat: 40.6575631813663, lng: -73.5820402463261 },
      town : "Freeport"
    },
    {
      key: "The Home Depot",
      location: { lat: 40.65633798511026, lng: -73.57539466787365 },
      town : "Freeport"
    },
    {
      key: "Leslie's",
      location: { lat: 40.655846691788206, lng: -73.59934812047912 },
      town : "Freeport"
    },
    {
      key: "Taco Bell",
      location: { lat: 40.65237417596334, lng: -73.58920425077403 },
      town : "Freeport"
    },
    {
      key: "Dominican Restaurant",
      location: { lat: 40.6628406264448, lng: -73.58586212722422 },
      town : "Freeport"
    },
    {
      key: "Islip Train Station",
      location: { lat: 40.73595998333892, lng: -73.20901558412609 },
      town : "Islip"
    },
    {
      key: "Kohl's",
      location: { lat: 40.7533216093637, lng: -73.22727397703585 },
      town : "Islip"
    },
    {
      key: "Commack Road Park",
      location: { lat: 40.75337486924841, lng: -73.22748489979706 },
      town : "Islip"
    },
    {
      key: "Gold's Gym",
      location: { lat: 40.75172745144558, lng: -73.21181422574904 },
      town : "Islip"
    },
    {
      key: "Suffolk County Environmental Center (Scully Estate)",
      location: { lat: 40.71593595433896, lng: -73.21217077336256 },
      town : "Islip"
    },
    {
      key: "Huntington Hospital",
      location: { lat: 40.87958471114619, lng: -73.41633856825855 },
      town : "Huntington"
    },
    {
      key: "Gold Star Beach Park",
      location: { lat: 40.896692850286335, lng: -73.43408474981277 },
      town : "Huntington"
    },
    {
      key: "Main Street Nursery",
      location: { lat: 40.87182675514823, lng: -73.43998712941587 },
      town : "Huntington"
    },
    {
      key: "Munday's",
      location: { lat: 40.871472028502374, lng: -73.42605961097965 },
      town : "Huntington"
    },
    {
      key: "Huntington Rural Cemetery",
      location: { lat: 40.86390149799027, lng: -73.42298500913193 },
      town : "Huntington"
    },
    {
      key: "Hither Hills Campground",
      location: { lat: 41.00701341272302, lng: -72.0153172272369 },
      town : "Montauk"
    },
    {
      key: "Gurney's Montauk Resort & Seawater Spa",
      location: { lat: 41.01536186241648, lng: -71.99189567363099 },
      town : "Montauk"
    },
    {
      key: "Montauk Point Lighthouse Museum",
      location: { lat: 41.07097828916579, lng: -71.85723681001654 },
      town : "Montauk"
    },
    {
      key: "Joni's",
      location: { lat: 41.034802171807755, lng: -71.9418393462955 },
      town : "Montauk"
    },
    {
      key: "Viking Fleet",
      location: { lat: 41.07373115153016, lng: -71.93942932818346 },
      town : "Montauk"
    }
  ]

  const PoiMarkers = props => {
    const { pois, selectedPoiKey, onMarkerClick } = props
    const map = useMap()

    // Memoize click handler to avoid unnecessary re-renders
    const handleMarkerClick = useCallback(
      (poiKey, poiLocation) => {
        if (map) {
          map.panTo(poiLocation) // Pan to the clicked marker
        }
        onMarkerClick(poiKey) // Set the currently selected marker's key
        console.log("marker clicked:", poiKey, poiLocation)
        setDestination(poiKey)
        setDropoffLocation(poiKey);
        console.log(destination)
      },
      [map, onMarkerClick]
    ) // Dependencies for useCallback

    // Memoize close handler
    const handleInfoWindowClose = useCallback(() => {
      onMarkerClick(null) // Deselect marker by setting key to null
    }, [onMarkerClick])

    return (
      <>
        {pois.map(poi => (
          // Use React.Fragment to provide a key for the group of Marker + InfoWindow
          <React.Fragment key={poi.key}>
            <AdvancedMarker
              position={poi.location}
              clickable={true}
              // Pass POI key and location
              onClick={() => handleMarkerClick(poi.key, poi.location)}
            >
              <Pin
                background={"#FBBC04"}
                glyphColor={"#000"}
                borderColor={"#000"}
              />
            </AdvancedMarker>

            {/* Conditionally render InfoWindow only if this POI is selected */}
            {selectedPoiKey === poi.key && (
              <InfoWindow
                // Position the InfoWindow at the marker's location
                position={poi.location}
                // Handle closing the InfoWindow
                onCloseClick={handleInfoWindowClose}
              >
                {/* Display content specific to this POI */}
                <p style={{ fontWeight: "bold", margin: 0 }}>{poi.key}</p>
                <p style={{ margin: "2px 0 0 0" }}>
                  You want to drop off here?
                </p>
              </InfoWindow>
            )}
          </React.Fragment>
        ))}
      </>
    )
  }

  const PoiPickUpMarkers = props => {
    const { pois, selectedPoiKey, onMarkerClick } = props
    const map = useMap()

    // Memoize click handler to avoid unnecessary re-renders
    const handleMarkerClick = useCallback(
      (poiKey, poiLocation, poitown) => {
        if (map) {
          map.panTo(poiLocation) // Pan to the clicked marker
        }
        onMarkerClick(poiKey) // Set the currently selected marker's key
        console.log("marker clicked:", poiKey, poiLocation, poitown)
        setTown(poitown)
        setOrigin(poiKey)
        setPickupLocation(poiKey);
        console.log(destination)
      },
      [map, onMarkerClick]
    ) // Dependencies for useCallback

    // Memoize close handler
    const handleInfoWindowClose = useCallback(() => {
      onMarkerClick(null) // Deselect marker by setting key to null
    }, [onMarkerClick])

    return (
      <>
        {pois.map(poi => (
          // Use React.Fragment to provide a key for the group of Marker + InfoWindow
          <React.Fragment key={poi.key}>
            <AdvancedMarker
              position={poi.location}
              clickable={true}
              // Pass POI key and location
              onClick={() => handleMarkerClick(poi.key, poi.location, poi.town)}
            >
              <Pin
                background={"#FBBC04"}
                glyphColor={"#000"}
                borderColor={"#000"}
              />
            </AdvancedMarker>

            {/* Conditionally render InfoWindow only if this POI is selected */}
            {selectedPoiKey === poi.key && (
              <InfoWindow
                // Position the InfoWindow at the marker's location
                position={poi.location}
                // Handle closing the InfoWindow
                onCloseClick={handleInfoWindowClose}
              >
                {/* Display content specific to this POI */}
                <p style={{ fontWeight: "bold", margin: 0 }}>{poi.key}</p>
                <p style={{ margin: "2px 0 0 0" }}>You'll be picking up here</p>
              </InfoWindow>
            )}
          </React.Fragment>
        ))}
      </>
    )
  }

  useEffect(() => {
    if (apiIsLoaded) {
      console.log("Google Maps API is loaded.")
    } else {
      console.log("Google Maps API is not loaded yet.")
    }
  }, [apiIsLoaded])

  const handleOrder = async e => {
    e.preventDefault()

    const Order_Date = `${yyyy}-${mm}-${dd}`
    const username_drivers = localStorage.getItem("driverUsername") // ✅ Correct key
    const userOrder = {
      Order_Date,
      username_drivers,
      seat_number,
      time,
      origin,
      destination,
      town,
      scheduled_date
    }
    console.log(userOrder)

    try {
      const creatingorder = await fetch(
        "http://localhost:5000/orderridetocampus",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userOrder)
        }
      )

      const data = await creatingorder.json()
      setMessage(data.message)
      setIsSuccess(creatingorder.ok)

      if (creatingorder.ok) {
        console.log("Order made successfully.")
        setTimeout(() => navigate("/driver-home"), 1500) // ✅ Redirect to driver home
      }
    } catch (error) {
      setIsSuccess(false)
      setMessage("Server error. Please try again later.")
    }
  }

  const PlaceAutocomplete = ({ onPlaceSelect }) => {
    const [placeAutocomplete, setPlaceAutocomplete] = useState(null)
    const inputRef = useRef(null)
    const places = useMapsLibrary("places")

    useEffect(() => {
      if (!places || !inputRef.current) return

      const options = {
        fields: ["geometry", "name", "formatted_address"]
      }

      setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options))
    }, [places])
    useEffect(() => {
      if (!placeAutocomplete) return

      placeAutocomplete.addListener("place_changed", () => {
        onPlaceSelect(placeAutocomplete.getPlace())
      })
    }, [onPlaceSelect, placeAutocomplete])
    return (
      <div className="autocomplete-container">
        <input ref={inputRef} />
      </div>
    )
  }

  const MapHandler = ({ place }) => {
    const map = useMap()

    useEffect(() => {
      if (!map || !place) return

      if (place.geometry?.viewport) {
        map.fitBounds(place.geometry?.viewport)
      }
      console.log(place.name)
    }, [map, place])
    return null
  }


  const today = DateTime.local();
  const [activeDay, setActiveDay] = useState(null);
  const [firstDayOfActiveMonth, setFirstDayOfActiveMonth] = useState(today.startOf("month"));
  const weekDays = Info.weekdays("short");
  const daysOfMonth = Interval.fromDateTimes(today,
  firstDayOfActiveMonth.endOf("month").endOf("week")).splitBy({ day: 1 }).map((day) => day.start);
  const goToPreviousMonth = () => {
    setFirstDayOfActiveMonth(firstDayOfActiveMonth.minus({ month: 1 }));
  };
  const goToNextMonth = () => {
    setFirstDayOfActiveMonth(firstDayOfActiveMonth.plus({ month: 1 }));
  };
  const goToToday = () => {
    setFirstDayOfActiveMonth(today.startOf("month"));
  };

  const calenderGridOnClick = (dayOfMonth) => {
    setActiveDay(dayOfMonth)
    setScheduledDay(dayOfMonth.toISODate())
    console.log("Scheduled Date: " + scheduled_date)
  }

  return (
      <motion.div style={{ textAlign: "center" }} initial = {{opacity : 0}} whileInView={{opacity : 1, transition : {duration : 1}}} viewport={{ once : true, amount : 0.5 }}>
        <h2 class="headerfont">Ride From Campus</h2>
        <form onSubmit={handleOrder}>
          <div class="small-card">
          <label class="fromcamptxt">Available Seats: </label>
          <select class="rideselect" value={seat_number} onChange={e => setSeat_Number(e.target.value)} required>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <br />
          <label class="fromcamptxt">Pickup Time: </label>
          <select
            class="rideselect"
            value={time}
            onChange={e => setTime(e.target.value)}
            required
          >
            {[
              "8:00AM",
              "9:00AM",
              "10:00AM",
              "11:00AM",
              "12:00PM",
              "1:00PM",
              "2:00PM",
              "3:00PM",
              "4:00PM",
              "5:00PM",
              "6:00PM",
              "7:00PM",
              "8:00PM"
            ].map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div className="location-box">
          <div><strong>Pick up:</strong></div>
          <div>{pickupLocation || "Click a pickup marker"}</div>
          <div><strong>Drop off:</strong></div>
          <div>{dropoffLocation || "Click a dropoff marker"}</div>
        </div>



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
          <div
            style={{ display: "flex", marginRight: "10%", marginLeft: "10%" }}
          >
            </div>
       
            
          </div>
          <div style={{ display: "flex" }}>
            {/* ---- Map Section 1---- */}
            <div className="mapstyle">
            <h2>Where Do you want to pick up?</h2>
              {" "}
              {/* Dummy styling */}
              <Map
                defaultZoom={10}
                defaultCenter={initialCenter}
                mapId={"DEMO_MAP_ID"}
                onCameraChanged={ev =>
                  console.log(
                    "camera changed:",
                    ev.detail.center,
                    "zoom:",
                    ev.detail.zoom
                  )
                }
                //disableDefaultUI={true} // hide default controls
                gestureHandling={"greedy"}
              >
                <PoiPickUpMarkers
                  pois={PoiPickUpData}
                  selectedPoiKey={selectedPoiKey}
                  onMarkerClick={setSelectedPoiKey}
                />
                <MapControl position={ControlPosition.TOP}>
                  <div className="autocomplete-control">
                    <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
                  </div>
                </MapControl>
                <MapHandler place={selectedPlace} />
              </Map>
            </div>
            {/* ---- End Map Section 1---- */}
            <br /> <br />
            {/* ---- Map Section 2---- */}
            <div className="mapstyle">
            <h2>Where do you want to Drop off?</h2>
              {" "}
              {/* Dummy styling */}
              <Map
                defaultZoom={15}
                defaultCenter={initialCenter}
                mapId={"DEMO_MAP_ID"}
                onCameraChanged={ev =>
                  console.log(
                    "camera changed:",
                    ev.detail.center,
                    "zoom:",
                    ev.detail.zoom
                  )
                }
                //disableDefaultUI={true} // hide default controls
                gestureHandling={"greedy"}
              >
                <PoiMarkers
                  pois={PoiFarmingdaleData}
                  selectedPoiKey={selectedPoiKey}
                  onMarkerClick={setSelectedPoiKey}
                />
              </Map>
            </div>
            {/* ---- End Map Section 2---- */}
          </div>
          <br />
          <br />
          <br />
          <br />
          <br />
          <hr/>
          {/* ---- Calender Section---- */}
          {/* The Base of this code was taken from this Git Repo: https://github.com/monsterlessonsacademy/monsterlessonsacademy/blob/471-interactive-calendar-react/src/App.jsx */}
          <motion.div style={{ textAlign: "center" }} initial = {{opacity : 0}} whileInView={{opacity : 1, transition : {duration : 1}}} viewport={{ once : false, amount : 0.5 }}>
          <div className="calendar-container">
            <div className="calendar">
              <div className="calendar-headline">
                <div className="calendar-headline-month">
                  {firstDayOfActiveMonth.monthShort}, {firstDayOfActiveMonth.year}
                </div>
                <div className="calendar-headline-controls">
                  <div className="calendar-headline-control" onClick={() => goToPreviousMonth()}>
                    «
                  </div>
                  <div className="calendar-headline-control calendar-headline-controls-today" onClick={() => goToToday()}>
                    Today
                  </div>
                  <div className="calendar-headline-control" onClick={() => goToNextMonth()}>
                    »
                  </div>
                </div>
              </div>
              <div className="calendar-weeks-grid">
                {weekDays.map((weekDay, weekDayIndex) => (
                  <div key={weekDayIndex} className="calendar-weeks-grid-cell">{weekDay}</div>))}
              </div>
              <div className="calendar-grid">
                {daysOfMonth.map((dayOfMonth, dayOfMonthIndex) => (
                  <div
                    key={dayOfMonthIndex}
                    className={classnames({
                      "calendar-grid-cell": true,
                      "calendar-grid-cell-inactive": dayOfMonth.month !== firstDayOfActiveMonth.month,
                      "calendar-grid-cell-active": activeDay?.toISODate() === dayOfMonth.toISODate(),
                    })}
                    onClick={() => calenderGridOnClick(dayOfMonth)}
                  >
                    {dayOfMonth.day}
                  </div>
                ))}
              </div>
            </div>
            <div className="schedule">
              <div className="schedule-headline">
                {activeDay === null && <div>Please select a day</div>}
                {activeDay && (
                  <div>{activeDay.toLocaleString(DateTime.DATE_MED)}</div>
                )}
              </div>
              <div>
                {activeDay && (
                  <div>You would like to schedule your ride for: <br/><b>{activeDay.toLocaleString(DateTime.DATE_HUGE)}</b> at <b>{time}</b> </div>
                )}
              </div>
            </div>
          </div>
          </motion.div>

          {/* ---- End Calender Section---- */}
          <button
            onClick={() => navigate("/driver-home")}
            style={{
              margin: "10px",
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px"
            }}
          >
            Back
          </button>
          <button class="submitbtn" type="submit">
            Make Order{" "}
          </button>
        </form>

        {message && (
          <p style={{ color: isSuccess ? "green" : "red" }}>{message}</p>
        )}
        <div class="spacer"></div>
      </motion.div>
  )
}

export default FromCampus

