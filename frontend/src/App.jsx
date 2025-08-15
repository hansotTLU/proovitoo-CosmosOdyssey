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
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';

function App() {
  const [routes, setRoutes] = useState([]);
  const [validUntil, setValidUntil] = useState("");
  const [allPlanets, setAllPlanets] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [reservations, setReservations] = useState([]);

  // Filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [company, setCompany] = useState("");
  const [sortField, setSortField] = useState("price");
  const [sortOrder, setSortOrder] = useState("ascending");

  // Reservation
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");


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
    fetch(`http://localhost:8080/reservations`)
      .then(res => res.json())
      .then(data => {
        setReservations(data || []);
      })
      .catch(err => console.error("Error fetching reservations:", err));
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
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
    }, 500);

    return () => clearTimeout(handler);
  }, [from, to, company, sortField, sortOrder]);

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#738ca8ff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: (theme.vars ?? theme).palette.text.secondary,
    ...theme.applyStyles('dark', {
      backgroundColor: '#1a2027ff',
    }),
  }));

  function getRouteName(routeId) {
    const leg = routes.find(l => l.legId === routeId);
    if (leg) {
      return `${leg.from} → ${leg.to}`;
    };
    return routeId;
  };
  
  const placeReservation = async (firstName, lastName, legId, price, time, chosenCompany) => {
    if (!firstName || !lastName) {
      console.warn("No success, field cannot be empty");
    } else {
      try {
        const response = await fetch("http://localhost:8080/reservations", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            route: legId,
            price: price,
            time: time,
            chosenCompany: chosenCompany
          }),
        });

        if (response.ok) {
          console.log("Success", response);
          console.log("Successfully placed a reservation!");
          window.location.reload(false);
        } else {
          console.warn("No success");
          console.log("Failed to place a reservation");
        }
      } catch (error) {
        console.warn(error);
        console.log("Error while placing reservation");
      }
    }
  };

  function ReservationForm({ onReserve }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          label="First Name"
        />
        <TextField
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          label="Last Name"
        />
        <Button
          variant="outlined"
          color="dark grey"
          onClick={() => onReserve(firstName, lastName)}
        >
          Place reservation
        </Button>
      </Stack>
    );
  }


  return (
    <Box sx={{
      width: '100%',
      paddingTop: 10,
      paddingBottom: 10,
      borderRadius: 1,
      justifyContent: 'center'
    }}>
      <Stack spacing={2}>
        <Item>
          <h1>🚀 Cosmos Odyssey 🪐</h1>
          <p>
            Price list valid until: {validUntil && new Date(validUntil).toLocaleString('sv-SE', {
              hour12: false
            }).replace('T', ' ')}
          </p>
        </Item>
        <Item>
          <h2>Reservations</h2>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="reservation table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Route</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Time</TableCell>
                  <TableCell align="right">Company</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.name}>
                    <TableCell component="th" scope="row">
                      {reservation.firstName} {reservation.lastName}
                    </TableCell>
                    <TableCell align="right">{getRouteName(reservation.route)}</TableCell>
                    <TableCell align="right">{reservation.price.toLocaleString()}</TableCell>
                    <TableCell align="right">{reservation.time}</TableCell>
                    <TableCell align="right">{reservation.chosenCompany}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Item>
        <Item>
          {/* Filters */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Item>
              <FormControl sx={{ m: 1, minWidth: 120}}>
                <InputLabel id="from-label">From</InputLabel>
                <Select
                  labelId="from-label"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  sx={{ backgroundColor: '#f5f5f5ff'}}
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
            </Item>
            <Item>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="to-label">To</InputLabel>
                <Select
                  labelId="to-label"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  sx={{ backgroundColor: '#f5f5f5ff'}}
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
            </Item>
            <Item>
              <Autocomplete
                disablePortal
                options={allCompanies}
                value={company}
                onChange={(event, newValue) => setCompany(newValue || '')}
                sx={{ width: 200, backgroundColor: '#f5f5f5ff', borderRadius: 1}}
                renderInput={(params) => <TextField {...params} label="Company" />}
              />
              <FormHelperText>Select company</FormHelperText>
            </Item>
            <Item>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select
                  labelId="sort-label"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  sx={{ backgroundColor: '#f5f5f5ff'}}
                >
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="distance">Distance</MenuItem>
                  <MenuItem value="time">Travel Time</MenuItem>
                </Select>
                <FormHelperText id="sort-label">Sort by</FormHelperText>
              </FormControl>
            </Item>
            <Item>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select
                  labelId="sort-order-label"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  sx={{ backgroundColor: '#f5f5f5ff'}}
                >
                  <MenuItem value="ascending">Ascending</MenuItem>
                  <MenuItem value="descending">Descending</MenuItem>
                </Select>
                <FormHelperText id="sort-order-label">Sort order</FormHelperText>
              </FormControl>
            </Item>
          </Stack>
        </Item>
        <Item>
          {routes.length > 0 ? (
            routes.map((route) => (
              <div
                key={route.legId}
                style={{
                  margin: "10px",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                <br></br>
                <h3>
                  {route.from} → {route.to}
                </h3>
                <p>Distance: {route.distance.toLocaleString()} km</p>
                <h4>Providers:</h4>
                  {route.providers.map((p, index) => (
                    <Accordion key={p.companyName + index} sx={{ backgroundColor: '#f5f5f5ff'}}>
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
                        <ReservationForm
                          route={route}
                          provider={p}
                          onReserve={(firstName, lastName) =>
                            placeReservation(firstName, lastName, route.legId, p.price, `${p.travelTimeHours}h ${p.travelTimeMinutes}m`, p.companyName)
                          }
                        />
                      </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
              </div>
            ))
          ) : (
            <p>No routes found.</p>
            )}
          </Item>
      </Stack>
    </Box>
  );
}

export default App;