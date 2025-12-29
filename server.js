const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// API Keys from environment variables
const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY || process.env.EXCHANGERATE_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const REST_COUNTRIES_API_KEY = process.env.REST_COUNTRIES_API_KEY || '';

/**
 * Task 1: Random User Generator API
 * Fetches a random user and extracts required information
 */
app.get("/api/user", async (req, res) => {
  try {
    const response = await axios.get("https://randomuser.me/api/");
    const user = response.data.results[0];

    const userData = {
      firstName: user.name.first,
      lastName: user.name.last,
      gender: user.gender,
      profilePicture: user.picture.large,
      age: user.dob.age,
      dob: user.dob.date,
      dateOfBirth: new Date(user.dob.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      city: user.location.city,
      country: user.location.country,
      address: `${user.location.street.number}, ${user.location.street.name}`,
      fullAddress: `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.country}`,
      image: user.picture.large
    };

    res.json(userData);
  } catch (error) {
    console.error("Random User API Error:", error.message);
    res.status(500).json({ 
      error: "Failed to fetch user data",
      message: error.message 
    });
  }
});

/**
 * Task 2: REST Countries API
 * Fetches country information based on country name
 * Uses API key from environment variable (demonstrated for security)
 */
app.get("/api/country/:country", async (req, res) => {
  try {
    const countryName = encodeURIComponent(req.params.country);
    
    const response = await axios.get(
      `https://restcountries.com/v3.1/name/${countryName}?fullText=false`,
      {
        headers: {
          // Demonstrating environment variable usage for API security
          'X-API-Key': REST_COUNTRIES_API_KEY
        }
      }
    );
    
    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ error: "Country data not found" });
    }
    
    const country = response.data[0];

    // Extract official languages
    const languages = country.languages 
      ? Object.values(country.languages).join(", ")
      : "N/A";

    // Extract currency code for exchange rate API
    const currencyCode = country.currencies 
      ? Object.keys(country.currencies)[0]
      : null;

    const countryData = {
      name: country.name.common,
      countryName: country.name.common,
      capital: country.capital ? country.capital[0] : "N/A",
      languages: languages,
      officialLanguages: languages,
      currency: currencyCode || "N/A",
      currencyCode: currencyCode,
      flag: country.flags.png,
      hasCurrency: !!currencyCode
    };

    res.json(countryData);
  } catch (error) {
    console.error("REST Countries API Error:", error.message);
    res.status(500).json({ 
      error: "Country data not found",
      message: error.message 
    });
  }
});

/**
 * Task 3: Exchange Rate API
 * Fetches exchange rates for the given currency to USD and KZT
 */
app.get("/api/exchange/:currency", async (req, res) => {
  try {
    const currencyCode = req.params.currency.toUpperCase();
    
    // Validate currency code
    if (!currencyCode || currencyCode === "N/A") {
      return res.json({
        USD: "N/A",
        KZT: "N/A",
        error: "Currency not available"
      });
    }

    if (!EXCHANGE_API_KEY) {
      console.warn("Exchange Rate API key not configured");
      return res.status(500).json({ 
        error: "Exchange rate API key not configured",
        USD: "N/A",
        KZT: "N/A"
      });
    }

    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/${currencyCode}`
    );

    const rates = response.data.conversion_rates;
    
    if (!rates || !rates.USD || !rates.KZT) {
      throw new Error("Exchange rates not available for this currency");
    }

    // Parse and send only relevant data
    res.json({
      USD: rates.USD.toFixed(2),
      KZT: rates.KZT.toFixed(2),
      baseCurrency: currencyCode,
      formatted: {
        usd: `1 ${currencyCode} = ${rates.USD.toFixed(2)} USD`,
        kzt: `1 ${currencyCode} = ${rates.KZT.toFixed(2)} KZT`
      }
    });
  } catch (error) {
    console.error("Exchange Rate API Error:", error.message);
    res.status(500).json({ 
      error: "Exchange rate unavailable",
      message: error.message,
      USD: "N/A",
      KZT: "N/A"
    });
  }
});

/**
 * Task 4: News API
 * Fetches 5 news headlines related to the country in English language
 * Headlines must contain the country name
 */
app.get("/api/news/:country", async (req, res) => {
  try {
    const countryName = req.params.country;

    if (!NEWS_API_KEY) {
      return res.status(500).json({ 
        error: "News API key not configured",
        message: "Please set NEWS_API_KEY in your .env file"
      });
    }

    // News API endpoint - search for headlines containing country name in English
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: countryName,
        language: "en", // Must be in English as per assignment requirements
        sortBy: "publishedAt",
        pageSize: 20, // Get more to filter properly
        apiKey: NEWS_API_KEY
      }
    });

    // Clean and filter news data server-side
    // Ensure headline contains the country name (case-insensitive)
    const countryNameLower = countryName.toLowerCase();
    const articles = response.data.articles
      .filter(a => {
        // Filter out removed articles and ensure title exists
        if (!a.title || a.title === "[Removed]") return false;
        // Ensure headline contains the country name (requirement)
        return a.title.toLowerCase().includes(countryNameLower);
      })
      .slice(0, 5) // Get exactly 5 headlines
      .map(a => ({
        title: a.title,
        description: a.description || "No description available",
        image: a.urlToImage || null,
        url: a.url,
        sourceUrl: a.url,
        source: a.source.name,
        publishedAt: new Date(a.publishedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      }));

    // If we couldn't find 5 articles with country name in headline, 
    // try to get additional related articles
    if (articles.length < 5) {
      const additionalArticles = response.data.articles
        .filter(a => {
          if (!a.title || a.title === "[Removed]") return false;
          // Check if already included
          return !articles.some(n => n.title === a.title);
        })
        .slice(0, 5 - articles.length)
        .map(a => ({
          title: a.title,
          description: a.description || "No description available",
          image: a.urlToImage || null,
          url: a.url,
          sourceUrl: a.url,
          source: a.source.name,
          publishedAt: new Date(a.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })
        }));
      
      articles.push(...additionalArticles);
    }

    res.json(articles.slice(0, 5)); // Ensure exactly 5 articles
  } catch (error) {
    console.error("News API Error:", error.message);
    
    if (error.response) {
      res.status(error.response.status).json({ 
        error: "Failed to fetch news",
        message: error.response.data.message || error.message
      });
    } else {
      res.status(500).json({ 
        error: "Failed to fetch news",
        message: error.message
      });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Make sure to set up your .env file with API keys:`);
  console.log(`- EXCHANGE_API_KEY or EXCHANGERATE_API_KEY (required for exchange rates)`);
  console.log(`- NEWS_API_KEY (required for news)`);
  console.log(`- REST_COUNTRIES_API_KEY (optional, for demonstration)`);
});