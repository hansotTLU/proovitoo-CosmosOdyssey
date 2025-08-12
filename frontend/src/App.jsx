import React, { useEffect, useState } from "react";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

function App() {
  const [routes, setRoutes] = useState([]);
  const [validUntil, setValidUntil] = useState("");
  const [allPlanets, setAllPlanets] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);

  // Filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [company, setCompany] = useState("");
  const [sortField, setSortField] = useState("price");
  const [sortOrder, setSortOrder] = useState("ascending");

  useEffect(() => {
    fetch(`http://localhost:8080/routes`)
      .then(res => res.json())
      .then(data => {
        setRoutes(data.routes || []);
        setValidUntil(data.validUntil || "");
        const planets = [
          ...new Set(data.routes.flatMap(r => [r.from, r.to]))
        ];
        const companies = [
          ...new Set(data.routes.flatMap(route => 
            route.providers.map(p => p.companyName)
          ))
        ];
        setAllPlanets(planets);
        setAllCompanies(companies);
      })
      .catch(err => console.error("Error fetching routes:", err));
  }, []);

  useEffect(() => {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      if (company) params.append("company", company);
  
      fetch(`http://localhost:8080/routes?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setRoutes(data.routes);
          setValidUntil(data.validUntil);
        })
        .catch((err) => console.error("Error fetching routes:", err));
    }, [from, to, company]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🚀 Cosmos Odyssey</h1>
      <p>Price list valid until: {validUntil}</p>

      {/* Filters */}
      <div style={{ marginBottom: "20px" }}>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="from-label">From</InputLabel>
          <Select
            labelId="from-label"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {allPlanets.map((destination) => (
              <MenuItem key={destination} value={destination}>
                {destination}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select departure planet</FormHelperText>
        </FormControl>
        
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="to-label">To</InputLabel>
          <Select
            labelId="to-label"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {allPlanets.map((destination) => (
              <MenuItem key={destination} value={destination}>
                {destination}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select departure planet</FormHelperText>
        </FormControl>

        <Autocomplete
          disablePortal
          options={allCompanies}
          value={company}
          onChange={(event, newValue) => setCompany(newValue || '')}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Company" />}
        />
      </div>

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
