import React, { useEffect, useState } from "react";

const RequestRideFromCampus = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/orders/fromcampus")
      .then(async (res) => {
        const text = await res.text();

        try {
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            setOrders(data);
          } else {
            console.error("Expected array but got:", data);
            setError("Failed to fetch orders.");
          }
        } catch (err) {
          console.error("Invalid JSON from server:", text);
          setError("Unexpected server response.");
        }
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setError("Server not reachable.");
      });
  }, []);

  const handleSelection = (orderId) => {
    setSelectedOrderId(orderId);
  };

  const handleSubmit = () => {
    if (selectedOrderId === null) {
      alert("Please select a ride to request.");
      return;
    }

    alert(`Ride with Order ID ${selectedOrderId} selected!`);
    // You can send this order ID to the server or use it however needed.
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Available Ride Requests from Campus</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={(e) => e.preventDefault()}>
        <table style={{ margin: "0 auto", borderCollapse: "collapse", width: "90%" }} border="1">
        <thead>
            <tr style={{ backgroundColor: "green", color: "white" }}>
                <th>Select</th>
                <th>Order ID</th>
                <th>Date</th>
                <th>Username</th>
                <th>Location ID</th>
                <th>License Plate</th>
            </tr>
        </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.Order_ID}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedOrderId === order.Order_ID}
                    onChange={() => handleSelection(order.Order_ID)}
                  />
                </td>
                <td>{order.Order_ID}</td>
                <td>{order.Order_Date}</td>
                <td>{order.username}</td>
                <td>{order.location_id}</td>
                <td>{order.License_plate}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <br />
        <button
          type="button"
          onClick={handleSubmit}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Confirm Selection
        </button>
      </form>
    </div>
  );
};

export default RequestRideFromCampus;
