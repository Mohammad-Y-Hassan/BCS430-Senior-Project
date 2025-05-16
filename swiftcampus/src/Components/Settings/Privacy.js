import React, {useEffect, useState} from "react";
import megamanwalking from "./megamanwalking.gif"

const Privacy = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [perfer_fm, setFemaleRideronly] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const username_drivers = localStorage.getItem("driverUsername")
  const isDriver = localStorage.getItem("driverToken");
  const isFemale = localStorage.getItem("driverGender");



      useEffect(() => {
        const fetchData = async () => {
          console.log('useEffect triggered, perfer_fm:', perfer_fm);
          setIsLoading(true);
          try {
              const activeride = await fetch(`process.env.REACT_APP_BACKEND/GetPreferWomen?param1=${username_drivers}`);
              const data = await activeride.json();
              console.log("Data:" + JSON.stringify(data))
              console.log("Data2: " + data[0].perfer_fm)
              if (data[0].perfer_fm === 0) {
                console.log("Determined False")
                setFemaleRideronly(false)
                setIsChecked(false)
                return
              }
              if (data[0].perfer_fm === 1) {
                console.log("Determined True")
                setFemaleRideronly(true)
                setIsChecked(true)
                return
              }
          } catch (error) {
             console.error('Error fetching users:', error);
             setIsError(true)
          } finally {setIsLoading(false)}
        };
        fetchData();
      }, [username_drivers]);
  
  
  const handleCheckboxChange = async (event) => {
    const newIsChecked = event.target.checked;
    setIsChecked(newIsChecked);
    setFemaleRideronly(newIsChecked);
    const PreferWomen = {username_drivers, perfer_fm: newIsChecked}
        console.log("perfer_fm: " + newIsChecked)
        try {
          const res = await fetch("process.env.REACT_APP_BACKEND/PreferWomen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(PreferWomen),
          });
        } catch (error) {
          console.error("Server error:", error);
        }
      };
    console.log("ischecked: "+isChecked)
  return (
    <div className="settings-page">
      <h2>Privacy Settings</h2>
      <ul>
      {isError && isDriver && <div>An error has occured!</div>}
      {isLoading && isDriver && <div> <img src={megamanwalking} alt="loading..." /><br></br>Loading...</div>}
      {!isLoading && isDriver && isFemale == "F" && ( <label>
              Want Your Riders to be Women?
            <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            /><hi/>
      </label>)}
      {!isDriver && (<> There's nothing here for Riders Yet!</>)}
      {isDriver && isFemale == "M" && (<>There's Nothing here for Male Drivers Yet!</>)}
      </ul>
    </div>
  );
};

export default Privacy;
