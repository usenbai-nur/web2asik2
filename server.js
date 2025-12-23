const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(express.static("public"));

// random user api
app.get("/api/user", async (req, res) => {
  try {
    const response = await axios.get("https://randomuser.me/api/");
    const user = response.data.results[0];

    res.json({
      firstName: user.name.first,
      lastName: user.name.last,
      gender: user.gender,
      age: user.dob.age,
      dob: user.dob.date,
      city: user.location.city,
      country: user.location.country,
      address: `${user.location.street.number}, ${user.location.street.name}`,
      image: user.picture.large
    });
  } catch (error) {
    console.error("Random User API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// rest countries api 
app.get("/api/country/:country", async (req, res) => {
  try {
    const response = await axios.get(
      `https://restcountries.com/v3.1/name/${req.params.country}`,
      {
        headers: {
          // demonstrating environment variable usage for API security
          'X-API-Key': process.env.REST_COUNTRIES_API_KEY || ''
        }
      }
    );
    const country = response.data[0];

    // extract currency with proper null checking
    const currencyCode = country.currencies 
      ? Object.keys(country.currencies)[0] 
      : null;

    // handle missing data gracefully
    res.json({
      name: country.name.common,
      capital: country.capital?.[0] || "N/A",
      languages: country.languages
        ? Object.values(country.languages).join(", ")
        : "N/A",
      currency: currencyCode || "N/A",
      flag: country.flags.png,
      hasCurrency: !!currencyCode
    });
  } catch (error) {
    console.error("REST Countries API Error:", error.message);
    res.status(500).json({ error: "Country data not found" });
  }
});

// exchange rate api
app.get("/api/exchange/:currency", async (req, res) => {
  try {
    // Validate currency code
    if (!req.params.currency || req.params.currency === "N/A") {
      return res.json({
        USD: "N/A",
        KZT: "N/A",
        error: "Currency not available"
      });
    }

    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/latest/${req.params.currency}`
    );

    // parse and send only relevant data
    res.json({
      USD: response.data.conversion_rates.USD.toFixed(2),
      KZT: response.data.conversion_rates.KZT.toFixed(2)
    });
  } catch (error) {
    console.error("Exchange Rate API Error:", error.message);
    res.status(500).json({ 
      error: "Exchange rate unavailable",
      USD: "N/A",
      KZT: "N/A"
    });
  }
});

// news api
app.get("/api/news/:country", async (req, res) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${req.params.country}&language=en&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
    );

    // clean and filter news data server-side
    const news = response.data.articles
      .filter(a => a.title && a.title !== "[Removed]")
      .slice(0, 5)
      .map(a => ({
        title: a.title,
        description: a.description || "No description available",
        image: a.urlToImage || null,
        url: a.url
      }));

    res.json(news);
  } catch (error) {
    console.error("News API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);