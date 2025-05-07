import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./calender.css";
import { Info, DateTime, Interval } from "luxon";
import classnames from "classnames";
import {motion } from "framer-motion"

const DriverHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("driverToken");
    if (!token) {
      navigate("/driver-login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("storage"));
    navigate("/driver-login");
  };

  const [activeDrives, setActiveDrives] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const username_drivers = localStorage.getItem("driverUsername");

      useEffect(() => {
        const fetchData = async () => {
          setIsLoading(true);
          try {
              const activeDrives = await fetch(`http://localhost:5000/ActiveDrives?param1=${username_drivers}`);
              const data = await activeDrives.json();
              console.log("Data:" + data)
              setActiveDrives(data);
          } catch (error) {
             console.error('Error fetching users:', error);
             setIsError(true)
          } finally {setIsLoading(false)}
        };
        fetchData();
      }, []);

      const formattedData = activeDrives.reduce((acc, obj) => {
        // CORRECT: Access the property value directly
        const scheduledDate = DateTime.fromISO(obj.scheduled_date).toISODate();
        console.log("scheduled Date: " + scheduledDate)
    
        // Basic check if scheduledDate exists and is a string (like 'YYYY-MM-DD')
        if (typeof scheduledDate !== 'string' || scheduledDate.length === 0) {
            console.warn("Skipping object due to invalid scheduled_date:", obj);
            return acc; // Skip this object if the date is invalid/missing
        }
    
        // CORRECT: Access properties directly on the 'obj'
        const values = [
          DateTime.fromISO(obj.order_date).toISODate(),
            obj.username_drivers,
            obj.seat_number,
            obj.time,
            obj.is_completed,
            obj.origin,
            obj.destination,
            obj.town,
            obj.Rider1,
            obj.Rider2,
            obj.Rider3,
            obj.Rider4,
            obj.Rider5,
            obj.Rider6,
        ];
        console.log("values: " + values)
    
        if (acc[scheduledDate]) {
            acc[scheduledDate].push(values);
        } else {
            acc[scheduledDate] = [values];
        }
    
        return acc;
    }, {});

   const today = DateTime.local();
    const [activeDay, setActiveDay] = useState(null);
    const activeDayDrives = formattedData[activeDay?.toISODate()] ?? [];
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
    }

  return (
    <div class="signup-card">
      <h2 class="titlefont">Welcome to Swift Campus</h2>
      <h1>Your current Drives</h1>
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
                {daysOfMonth.map((dayOfMonth, dayOfMonthIndex) => {
                  const dateStr = dayOfMonth.toISODate();
                  const hasMeetings = formattedData.hasOwnProperty(dateStr);
                  return(
                  <div
                    key={dayOfMonthIndex}
                    className={classnames({
                      "calendar-grid-cell": true,
                      "calendar-grid-cell-inactive": dayOfMonth.month !== firstDayOfActiveMonth.month,
                      "calendar-grid-cell-active": activeDay?.toISODate() === dayOfMonth.toISODate(),
                      "calendar-grid-cell-Drive-inactive": hasMeetings && dayOfMonth.month === firstDayOfActiveMonth.month && activeDay?.toISODate() !== dayOfMonth.toISODate(),
                      "calendar-grid-cell-Drive-active": hasMeetings && dayOfMonth.month === firstDayOfActiveMonth.month && activeDay?.toISODate() === dayOfMonth.toISODate()
                    })}
                    onClick={() => calenderGridOnClick(dayOfMonth)}
                  >
                    {dayOfMonth.day}
                  </div>
                )})}
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
          {activeDay && activeDayDrives.length === 0 && (
            <div>No Planned Meetings Today</div>
          )}
          {activeDay && activeDayDrives.length > 0 && (
            <>
            {activeDay && activeDayDrives.length > 0 && (
            <>
              {activeDayDrives.map((Drive, DriveIndex) => (
                <div key={DriveIndex} style={{ border: '1px solid #eee', padding: '5px', marginBottom: '5px' }}>
                  <p><strong>Order Made:</strong> {Drive[0]}</p>
                  <p><strong>Pickup Time:</strong> {Drive[3]}</p>
                  <p><strong>Town:</strong> {Drive[7]}</p>
                  <p><strong>Pickup Spot:</strong> {Drive[5]}</p>
                  <p><strong>Destination:</strong> {Drive[6]}</p>
                  <p><strong>Riders:</strong> {(Drive[8] == null) && (Drive[9] == null) &&(Drive[10] == null) &&
                             (Drive[11] == null) && (Drive[12] == null) && (Drive[13] == null) && (<p>There are currently no other passengers</p>)}
                            {Drive[8] != null && Drive[8]}
                            {Drive[9] != null && Drive[9]}
                            {Drive[10] != null && Drive[10]}
                            {Drive[11] != null && Drive[11]}
                            {Drive[12] != null && Drive[12]}
                            {Drive[13] != null && Drive[13]}</p>
                  <p><strong>Seats Left:</strong> {Drive[2]}</p>
                </div>
              ))}
            </>
          )}
            </>
          )}
        </div>
            </div>
          </div>
          </motion.div>

          {/* ---- End Calender Section---- */}
      <button
        onClick={() => navigate("/fromcampus")}
        style={{
          margin: "10px",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Offer a Ride
      </button>
      <button
        onClick={handleLogout}
        style={{
          margin: "10px",
          padding: "10px",
          fontSize: "16px",
          backgroundColor: "#dc3545",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Logout
      </button>
      <div class="spacer"/>
    </div>
  );
};

export default DriverHome;
