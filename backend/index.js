import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { query, body, validationResult, matchedData } from "express-validator";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8080;

const COSMOS_API_URL = "https://cosmosodyssey.azurewebsites.net/api/v1.0/TravelPrices";

let rawData = [];
let allLatestData = [];
let currentData = null;
let reservations = [];

async function fetchData() {
  console.log('Fetching price list from API...');
  
  try {
    const response = await fetch(COSMOS_API_URL);

    if (!response.ok) {
      throw new Error("Could not fetch data");
    }

    const data = await response.json();
    rawData = data;

    allLatestData.push(data);
    if (allLatestData.length > 15) {
      const removed =  allLatestData.shift();
    }

    // Transform data
    let transformedData = data.legs.map(leg => {
      const fromName = leg.routeInfo.from.name;
      const toName = leg.routeInfo.to.name;
      const distance = leg.routeInfo.distance;

      const providers = leg.providers.map(p => {
        const start = new Date(p.flightStart);
        const end = new Date(p.flightEnd);
        const travelTimeMs = end - start;
        const travelTimeHours = Math.floor(travelTimeMs / (1000 * 60 * 60));
        const travelTimeMinutes = Math.floor((travelTimeMs / (1000 * 60)) % 60);

        return {
          providerId: p.id,
          companyName: p.company.name,
          price: p.price,
          flightStart: p.flightStart,
          flightEnd: p.flightEnd,
          travelTimeHours,
          travelTimeMinutes
        };
      });

      return {
        legId: leg.id,
        from: fromName,
        to: toName,
        distance,
        providers
      };
    });

    currentData = transformedData;
  }
  catch (error) {
    console.log(error);
  }
}

function cleanInvalidReservations() {
  reservations = reservations.filter(reservation => {
    const routeExists = currentData.some(leg => {
      if (leg.legId !== reservation.route) return false;

      return leg.providers.some(p => p.companyName === reservation.chosenCompany);
    });

    return routeExists;
  });
}



app.use("/routes", async (req, res) => {
  await fetchData();
  cleanInvalidReservations()

  // Filters
  const { from, to, company, sortField, sortOrder } = req.query;
  if (from) {
    currentData = currentData.filter(route => route.from.toLowerCase() === from.toLowerCase());
  }
  if (to) {
    currentData = currentData.filter(route => route.to.toLowerCase() === to.toLowerCase());
  }
  if (company) {
    currentData = currentData.map(route => ({
      ...route,
      providers: route.providers.filter(p => p.companyName.toLowerCase() === company.toLowerCase())
    })).filter(route => route.providers.length > 0);
  }

  // Sorting
  if (sortField) {
    currentData = currentData.map(route => {
      const sortedProviders = [...route.providers];

      if (sortField === 'price') {
        sortedProviders.sort((a, b) =>
          sortOrder === 'descending' ? b.price - a.price : a.price - b.price
        );
      } else if (sortField === 'time') {
        sortedProviders.sort((a, b) => {
          const timeA = a.travelTimeHours * 60 + a.travelTimeMinutes;
          const timeB = b.travelTimeHours * 60 + b.travelTimeMinutes;
          return sortOrder === 'descending' ? timeB - timeA : timeA - timeB;
        });
      }
      return { ...route, providers: sortedProviders };
    });

    if (sortField === 'distance') {
      currentData.sort((a, b) =>
        sortOrder === 'descending' ? b.distance - a.distance : a.distance - b.distance
      );
    }
  }

  res.json({
    validUntil: rawData.validUntil,
    routes: currentData
  });
});

app.get("/reservations", (req, res) => {
  

  res.json(reservations);
});

app.post(
  "/reservations",
  [
    body("firstName").notEmpty().withMessage("First name is required").escape(),
    body("lastName").notEmpty().withMessage("Last name is required").escape(),
    body("route").notEmpty().withMessage("Route ID is required").escape(),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("time").notEmpty().withMessage("Travel time is required").escape(),
    body("chosenCompany").notEmpty().withMessage("Company is required").escape(),
  ],
  (req, res) => {
    fetchData();
    cleanInvalidReservations()

    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const data = matchedData(req);

    const newReservation = {
      id: crypto.randomUUID(),
      firstName: data.firstName,
      lastName: data.lastName,
      route: data.route,
      price: data.price,
      time: data.time,
      chosenCompany: data.chosenCompany,
      createdAt: Date.now(),
    };

    reservations.push(newReservation);

    res.status(201).json(newReservation);
  }
);

app.get("/", async (req, res) => {
  await fetchData();
  cleanInvalidReservations()
  res.json(rawData);
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  fetchData().catch(err => console.error(err));
});
