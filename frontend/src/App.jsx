import React, { useEffect, useState } from "react";

function App() {
  const [routes, setRoutes] = useState([]);
  const [validUntil, setValidUntil] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8080/routes`)
      .then(res => res.json())
      .then(data => {
        setRoutes(data.routes || []);
        setValidUntil(data.validUntil || "");
      })
      .catch(err => console.error("Error fetching routes:", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🚀 Cosmos Odyssey</h1>
      <p>Price list valid until: {validUntil}</p>

      {routes.length > 0 ? (
        routes.map((route) => (
          <div
            key={route.legId}
            style={{
              border: "1px solid #ccc",
              margin: "10px",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <h3>
              {route.from} → {route.to}
            </h3>
            <p>Distance: {route.distance} km</p>
            <h4>Providers:</h4>
            <ul>
              {route.providers.map((p) => (
                <li key={p.providerId}>
                  {p.companyName} - ${p.price} - {p.travelTimeHours}h{" "}
                  {p.travelTimeMinutes}m
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No routes found.</p>
      )}
    </div>
  );
}

export default App;
