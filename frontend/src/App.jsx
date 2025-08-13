import React, { useEffect, useState } from "react";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import ListItemText from '@mui/material/ListItemText';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [route, setRoute] = useState("");
  const [price, setPrice] = useState("");
  const [time, setTime] = useState("");
  const [chosenCompany, setChosenCompany] = useState("");

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
      if (sortField) params.append("sortField", sortField);
      if (sortOrder) params.append("sortOrder", sortOrder);
  
      fetch(`http://localhost:8080/routes?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setRoutes(data.routes);
          setValidUntil(data.validUntil);
        })
        .catch((err) => console.error("Error fetching routes:", err));
  }, [from, to, company, sortField, sortOrder]);
  

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
          onChange={(newValue) => setCompany(newValue || '')}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Company" />}
        />

        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="sort-field-label">Sort By</InputLabel>
          <Select
            labelId="sort-field-label"
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <MenuItem value="price">Price</MenuItem>
            <MenuItem value="distance">Distance</MenuItem>
            <MenuItem value="time">Travel Time</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="sort-order-label">Order</InputLabel>
          <Select
            labelId="sort-order-label"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="ascending">Ascending</MenuItem>
            <MenuItem value="descending">Descending</MenuItem>
          </Select>
        </FormControl>
      </div>

      <div>
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
              <p>Distance: {route.distance.toLocaleString()} km</p>
              <h4>Providers:</h4>

              

                {route.providers.map((p) => (
                  <Accordion>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    <ListItemText
                      primary={`${p.companyName} - $${p.price.toLocaleString()}`}
                      secondary={`${p.travelTimeHours}h ${p.travelTimeMinutes}m`}
                    />
                      </AccordionSummary>
                    <AccordionDetails>
                    <Box
                      component="form"
                      sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
                      noValidate
                      autoComplete="off"
                    >
                      <div>
                        <TextField
                          required
                          id="first-name"
                          label="First Name"
                          onChange={(event) => setFirstName(event.target.value)}
                        />
                        <TextField
                          required
                          id="last-name"
                          label="Last Name"
                          onChange={(event) => setLastName(event.target.value)}
                          />
                          <Button
                            variant="outlined"
                            onClick={() => placeReservation({
                              routeId: route.legId,
                              price: p.price,
                              time: `${p.travelTimeHours}h ${p.travelTimeMinutes}m`,
                              chosenCompany: p.companyName
                            })}
                          >
                            Place reservation
                          </Button>
                      </div>
                    </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
            </div>
          ))
        ) : (
          <p>No routes found.</p>
          )}
      </div>
    </div>
  );
}

export default App;
