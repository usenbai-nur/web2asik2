// get random user button click handler
document.getElementById("btn").addEventListener("click", async () => {
  const content = document.getElementById("content");
  
  // show loading state
  content.innerHTML = '<div class="loading">Loading user data...</div>';

  try {
    // fetch random user data from server
    const user = await fetch("/api/user").then(res => res.json());
    
    if (user.error) {
      throw new Error(user.error);
    }

    // fetch country information based on user's country
    const country = await fetch(`/api/country/${user.country}`).then(res => res.json());
    
    if (country.error) {
      throw new Error(country.error);
    }

    // fetch exchange rates if currency is available
    let exchange = { USD: "N/A", KZT: "N/A" };
    if (country.hasCurrency && country.currency !== "N/A") {
      exchange = await fetch(`/api/exchange/${country.currency}`).then(res => res.json());
    }

    // fetch news articles about the user's country
    const news = await fetch(`/api/news/${user.country}`).then(res => res.json());

    // display all data in structured cards
    content.innerHTML = `
      <!-- User Profile Card -->
      <div class="card user-profile">
        <h2>User Profile</h2>
        <img src="${user.image}" alt="${user.firstName} ${user.lastName}">
        <div class="user-info">
          <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
          <p><strong>Gender:</strong> ${user.gender}</p>
          <p><strong>Age:</strong> ${user.age} years old</p>
          <p><strong>Date of Birth:</strong> ${new Date(user.dob).toDateString()}</p>
          <p><strong>City:</strong> ${user.city}</p>
          <p><strong>Country:</strong> ${user.country}</p>
          <p><strong>Address:</strong> ${user.address}</p>
        </div>
      </div>

      <!-- Country Information Card -->
      <div class="card">
        <h2>Country Information</h2>
        <div class="country-info">
          <div class="country-flag">
            <img src="${country.flag}" alt="${country.name} flag">
            <h3>${country.name}</h3>
          </div>
          <div class="country-details">
            <p><strong>Capital:</strong> ${country.capital}</p>
            <p><strong>Languages:</strong> ${country.languages}</p>
            <p><strong>Currency:</strong> ${country.currency}</p>
            
            ${country.hasCurrency && country.currency !== "N/A" ? `
              <div class="exchange-rates">
                <h4>Exchange Rates</h4>
                <p>1 ${country.currency} = ${exchange.USD} USD</p>
                <p>1 ${country.currency} = ${exchange.KZT} KZT</p>
              </div>
            ` : '<p class="error">Exchange rates not available for this currency</p>'}
          </div>
        </div>
      </div>

      <!-- News Articles Card -->
      <div class="card">
        <h2>Latest News from ${user.country}</h2>
        <div class="news-section">
          ${Array.isArray(news) && news.length > 0 ? news.map(n => `
            <div class="news-item">
              <h4>${n.title}</h4>
              ${n.image ? `<img src="${n.image}" alt="News image">` : ''}
              <p>${n.description}</p>
              <a href="${n.url}" target="_blank" rel="noopener noreferrer">Read Full Article →</a>
            </div>
          `).join("") : '<p class="error">No news articles available at the moment.</p>'}
        </div>
      </div>
    `;
  } catch (error) {
    // handle errors gracefully
    content.innerHTML = `
      <div class="card">
        <div class="error">
          <h3>⚠️ Error Loading Data</h3>
          <p>${error.message}</p>
          <p>Please try again later.</p>
        </div>
      </div>
    `;
    console.error("Error fetching data:", error);
  }
});