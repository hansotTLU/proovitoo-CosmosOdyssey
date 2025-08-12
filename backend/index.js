import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8080;

const COSMOS_API_URL = "https://cosmosodyssey.azurewebsites.net/api/v1.0/TravelPrices";

let currentData = null;

async function fetchData() {
  console.log('Fetching price list from API...');
  
  try {
    const response = await fetch(COSMOS_API_URL);

    if (!response.ok) {
      throw new Error("Could not fetch data");
    }

    const data = await response.json();
    // currentData = data;

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



app.get("/", async (req, res) => {
  await fetchData();
  res.json(currentData);
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  fetchData().catch(err => console.error(err));
});
