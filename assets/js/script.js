//global

let crd = {};
let userLatitude = [];
let userLongitude = [];
let userCoordinates = document.querySelector("#user-coordinates");
let stationCards = document.querySelector("#station-cards");
let favoriteDiv = document.querySelector("#favorite-div");
let stationName = {};
let stationArray = [];
let stationArrayFiltered = [];
let closestStations = [];
let enterBtn = document.querySelector("#enter-btn");
let startSearchBtn = document.querySelector("#start-search-btn");
let againSearchBtn = document.querySelector("#again-search-btn");
let rentingBtn = document.querySelector("#renting-btn");
let returningBtn = document.querySelector("#returning-btn");
let numberBikes = document.getElementById("num-bike");
let questionDiv = document.querySelector("#question-div");
let errorDiv = document.querySelector("#error-div");
let footerDiv = document.querySelector("#footer-div");
let noSearchDiv = document.querySelector("#no-search-div");
let hootDiv = document.querySelector("#hoot-div");
let searchAgainButton = "";
let leftSide = document.querySelector("#left-side");
let isRenting = false;
let favoriteStations = JSON.parse(localStorage.getItem("favoriteStations")) || [];
let numBikes = 0;
let bikeType = "empty";
let play = document.getElementById("play");

// Grabs Lat Long of User & Creates Array of Station Objects
function requestStations() {
  let requestURL = "https://api.citybik.es/v2/networks/divvy";
  fetch(requestURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };
      function success(pos) {
        crd = pos.coords;
        questionDiv.setAttribute("class", "absolute xl:top-36 top-56 w-4/5 h-80 bg-[#4c0473] flex block");

        userCoordinates.innerHTML = `<div class="m-2 border-2 border-[#4c0473]"><div class="bg-[#4c0473]">Latitude</div><div id="userLatitude" class="py-2 text-lg text-semibold">${crd.latitude}</div></div>`;
        userCoordinates.innerHTML += `<div class="m-2 border-2 border-[#4c0473]"><div class="bg-[#4c0473]">Latitude</div><div id="userLongitude" class="py-2 text-lg text-semibold">${crd.longitude}</div></div>`;
        userCoordinates.innerHTML += `<button id="search-again-button" class="w-5/6 bg-[#4c0473] p-2 justify-center hover:bg-gray-400 hover:text-[#4c0473]">SEARCH AGAIN?</button>`;
        userLatitude = document.querySelector("#userLatitude");
        userLongitude = document.querySelector("#userLongitude");

        for (let i = 0; i < data.network.stations.length; i++) {
          let stationObject = {};
          stationObject.name = data.network.stations[i].name;
          stationObject.empty = data.network.stations[i].empty_slots;
          stationObject.slots = data.network.stations[i].extra.slots;
          stationObject.renting = data.network.stations[i].extra.renting;
          stationObject.city = data.network.location.city;
          stationObject.freeBikes = data.network.stations[i].free_bikes;
          stationObject.returning = data.network.stations[i].extra.returning;
          stationObject.extraSlot = data.network.stations[i].extra.slots;
          stationObject.latitude = data.network.stations[i].latitude;
          stationObject.longitude = data.network.stations[i].longitude;
          stationObject.distance = 3963.0 * Math.acos(Math.sin(crd.latitude / (180 / Math.PI)) * Math.sin(stationObject.latitude / (180 / Math.PI)) + Math.cos(crd.latitude / (180 / Math.PI)) * Math.cos(stationObject.latitude / (180 / Math.PI)) * Math.cos(stationObject.longitude / (180 / Math.PI) - crd.longitude / (180 / Math.PI)));
          if (stationObject.name.includes("Public", 0) === false) {
            stationArray.push(stationObject);
          }
        }
        stationArray.sort((locationA, locationB) => {
          return locationA.distance > locationB.distance ? 1 : -1;
        });
      }
      function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
      }

      navigator.geolocation.getCurrentPosition(success, error, options);
    });
}

// Displays Results on Screen
function displayResults() {
  stationCards.innerHTML = "";
  stationArrayFiltered = [];
  stationArray.forEach((station) => {
    if (station[bikeType] > numBikes) {
      stationArrayFiltered.push(station);
      console.log(station);
    }
  });

  // cuts results to just 10
  closestStations = stationArrayFiltered.slice(0, 10);

  // Adding each Station to its own Div
  if (closestStations.length === 0) {
    leftSide.setAttribute("class", "flex flex-col xl:w-1/5 w-3/5 hidden xl:py-0 p-2 xl:mb-4");
    noSearchDiv.setAttribute("class", "absolute xl:top-36 top-56 w-4/5 h-80 bg-[#4c0473] flex block");
    stationCards.innerHTML = "";
  } else {
    closestStations.forEach((station) => {
      stationCards.innerHTML += ` 
          <div class="flex flex-col px-2 mb-4">
              <div class="justify-center text-center flex bg-gray-400 font-bold text-lg text-[#4c0473]">${station.name}</div>
              <div class="bg-[#4c0473] p-4 flex xl:flex-row flex-col justify-around text-white ">
                  <div class="text-xl font-bold my-auto">
                      <div class="p-4 text-center">${station.city}</div><div class="p-4 text-center">Distance: ${station.distance.toFixed(2)} Miles</div>
                  </div>
                  <div class="flex flex-col gap-2">
                      <button class="bg-gray-400 font-bold text-lg text-[#4c0473] p-4 hover:bg-[#FAA6FF]" data-long="${station.longitude}" data-lat="${station.latitude}" data-station="${station.name}">ADD AS FAVORITE</button>
                      <a class="bg-gray-400 cursor-pointer font-bold text-lg text-[#4c0473] p-4 text-center hover:bg-[#FAA6FF]" onclick="window.location = 'https://www.google.com/maps/dir/${userLatitude.innerHTML},+${userLongitude.innerHTML}/${station.latitude},+${station.longitude}/@${station.latitude},${station.longitude}'">NAVIGATE</a>
                  </div>
              </div>
              <div class="flex justify-evenly flex-col xl:flex-row bg-[#4c0473] w-100 py-4">
                    <div class="p-4">
                          <div class="flex-wrap flex justify-center" id="${station.name}div1Head"></div>
                          <div id="${station.name}div1"></div>
                    </div>
                    <div class="p-4">
                          <div class="flex-wrap flex justify-center" id="${station.name}div2Head"></div>
                          <div id="${station.name}div2"></div>
                    </div>
                    <div class="p-4">
                          <div class="flex-wrap flex justify-center" id="${station.name}div3Head"></div>
                          <div id="${station.name}div3"></div>
                    </div>
              </div>
          </div>`;

      // loops to add bike Icons in boxes based off renting or returning
      if (isRenting === false) {
        if (station.empty !== 0) {
          let bikeSlotDiv1Head = document.getElementById(`${station.name}div1Head`);
          bikeSlotDiv1Head.innerHTML = `<h3 class="text-white w-full text-center">EMPTY SLOTS</h3>`;
        }
        if (station.renting !== 0) {
          let bikeSlotDiv2Head = document.getElementById(`${station.name}div2Head`);
          bikeSlotDiv2Head.innerHTML = `<h3 class="text-white w-full text-center">RENTING BIKES</h3>`;
        }
        if (station.freeBikes !== 0) {
          let bikeSlotDiv3Head = document.getElementById(`${station.name}div3Head`);
          bikeSlotDiv3Head.innerHTML = `<h3 class="text-white w-full text-center">BIKES AVAILABLE</h3>`;
        }
        for (let i = 0; i < station.empty; i++) {
          let bikeSlotDiv = document.getElementById(`${station.name}div1`);
          let bikeImage = document.createElement("img");
          bikeImage.setAttribute("src", "./assets/img/Black_Bike.png");
          bikeImage.setAttribute("alt", "empty slot");
          bikeImage.setAttribute("class", "h-6 w-6 mx-1 flex");
          bikeSlotDiv.appendChild(bikeImage);
          bikeSlotDiv.setAttribute("class", "flex-wrap flex bg-[#FAA6FF] justify-center p-3");
        }
        for (let i = 0; i < station.renting; i++) {
          let bikeSlotDiv = document.getElementById(`${station.name}div2`);
          let bikeImage = document.createElement("img");
          bikeImage.setAttribute("src", "./assets/img/Red_Bike.png");
          bikeImage.setAttribute("alt", "renting bikes");
          bikeImage.setAttribute("class", " h-6 w-6 mx-1 flex");
          bikeSlotDiv.appendChild(bikeImage);
          bikeSlotDiv.setAttribute("class", "flex-wrap flex bg-[#FAA6FF] justify-center p-3");
        }
        for (let i = 0; i < station.freeBikes; i++) {
          let bikeSlotDiv = document.getElementById(`${station.name}div3`);
          let bikeImage = document.createElement("img");
          bikeImage.setAttribute("src", "./assets/img/Green_Bike.png");
          bikeImage.setAttribute("alt", "free bikes");
          bikeImage.setAttribute("class", " h-6 w-6 mx-1 flex");
          bikeSlotDiv.appendChild(bikeImage);
          bikeSlotDiv.setAttribute("class", "flex-wrap flex bg-[#FAA6FF] justify-center p-3");
        }
      } else if (isRenting === true) {
        if (station.empty !== 0) {
          let bikeSlotDiv1Head = document.getElementById(`${station.name}div3Head`);
          bikeSlotDiv1Head.innerHTML = `<h3 class="text-white w-full text-center">EMPTY SLOTS</h3>`;
        }
        if (station.renting !== 0) {
          let bikeSlotDiv2Head = document.getElementById(`${station.name}div2Head`);
          bikeSlotDiv2Head.innerHTML = `<h3 class="text-white w-full text-center">RENTING BIKES</h3>`;
        }
        if (station.freeBikes !== 0) {
          let bikeSlotDiv3Head = document.getElementById(`${station.name}div1Head`);
          bikeSlotDiv3Head.innerHTML = `<h3 class="text-white w-full text-center">BIKES AVAILABLE</h3>`;
        }
        for (let i = 0; i < station.empty; i++) {
          let bikeSlotDiv = document.getElementById(`${station.name}div3`);
          let bikeImage = document.createElement("img");
          bikeImage.setAttribute("src", "./assets/img/Black_Bike.png");
          bikeImage.setAttribute("alt", "empty slot");
          bikeImage.setAttribute("class", "h-6 w-6 mx-1 flex");
          bikeSlotDiv.appendChild(bikeImage);
          bikeSlotDiv.setAttribute("class", "flex-wrap flex bg-[#FAA6FF] justify-center p-3");
        }
        for (let i = 0; i < station.renting; i++) {
          let bikeSlotDiv = document.getElementById(`${station.name}div2`);
          let bikeImage = document.createElement("img");
          bikeImage.setAttribute("src", "./assets/img/Red_Bike.png");
          bikeImage.setAttribute("alt", "renting bikes");
          bikeImage.setAttribute("class", " h-6 w-6 mx-1 flex");
          bikeSlotDiv.appendChild(bikeImage);
          bikeSlotDiv.setAttribute("class", "flex-wrap flex bg-[#FAA6FF] justify-center p-3");
        }
        for (let i = 0; i < station.freeBikes; i++) {
          let bikeSlotDiv = document.getElementById(`${station.name}div1`);
          let bikeImage = document.createElement("img");
          bikeImage.setAttribute("src", "./assets/img/Green_Bike.png");
          bikeImage.setAttribute("alt", "free bikes");
          bikeImage.setAttribute("class", " h-6 w-6 mx-1 flex");
          bikeSlotDiv.appendChild(bikeImage);
          bikeSlotDiv.setAttribute("class", "flex-wrap flex bg-[#FAA6FF] justify-center p-3");
        }
      }
      loadFavorites();
      footerDiv.setAttribute("class", "justify-center flex xl:flex-row flex-col bg-gray-400 font-bold text-lg text-[#4c0473] py-4 w-full block");
    });
  }
}

// adds Favorites to Local Storage
function addFavorite(station) {
  favoriteStations = JSON.parse(localStorage.getItem("favoriteStations")) || [];

  const findStation = favoriteStations.find((st) => st.name === station.name) || [];

  if (findStation.length === 0) {
    favoriteStations.unshift(station);
    favoriteStations = favoriteStations.slice(0, 5);
    localStorage.setItem("favoriteStations", JSON.stringify(favoriteStations));
  }
  loadFavorites();
}

// Loads favorites on screen (up to 5)
function loadFavorites() {
  favoriteStations = JSON.parse(localStorage.getItem("favoriteStations")) || [];
  favoriteDiv.innerHTML = `<h3 class="text-center text-[#4c0473] text-xl font-bold">FAVORITE LOCATIONS</h3>`;
  favoriteStations.forEach((station) => {
    let favoriteStationEL = document.createElement("a");
    favoriteStationEL.setAttribute("class", " w-5/6 p-2 bg-[#4c0473] flex my-2 m-auto justify-center hover:bg-gray-400 hover:text-[#4c0473] text-center");
    favoriteStationEL.setAttribute("href", `https://www.google.com/maps/dir/${userLatitude.innerHTML},+${userLongitude.innerHTML}/${station.lat},+${station.long}/@${station.lat},${station.long}`);

    favoriteStationEL.setAttribute("data-lat", station.lat);
    favoriteStationEL.setAttribute("data-long", station.long);
    favoriteStationEL.innerHTML = station.name;
    favoriteDiv.appendChild(favoriteStationEL);
  });
}

// Filters Array of Station Objects based on number of bikes requested
function runFilter() {
  if (rentingBtn.checked === true && numberBikes.value > 0) {
    isRenting = true;
    bikeType = "freeBikes";
    numBikes = numberBikes.value;
    questionDiv.setAttribute("class", "absolute xl:top-36 top-56 w-4/5 h-80 bg-[#4c0473] flex hidden");
    leftSide.setAttribute("class", "flex flex-col xl:w-1/5 w-3/5 block xl:py-0 p-2 xl:mb-4");
    displayResults();
  } else if (returningBtn.checked === true && numberBikes.value > 0) {
    isRenting = false;
    bikeType = "empty";
    numBikes = numberBikes.value;
    questionDiv.setAttribute("class", "absolute xl:top-36 top-56 w-4/5 h-80 bg-[#4c0473] flex hidden");
    leftSide.setAttribute("class", "flex flex-col xl:w-1/5 w-3/5 block xl:py-0 p-2 xl:mb-4");
    displayResults();
  } else if (numberBikes.value.toLowerCase() === "duck" || numberBikes.value.toLowerCase() === "ducks") {
    hootDiv.setAttribute("class", "absolute xl:top-36 top-56 w-4/5 h-80 bg-[#4c0473] flex block");
    play.play();
  } else {
    // ERROR DIV REVEAL
    errorDiv.setAttribute("class", "absolute xl:top-36 top-56 w-4/5 h-80 bg-[#4c0473] flex block");
    // HIDE Question DIV
    questionDiv.setAttribute("class", "absolute xl:top-36 top-56 w-1/5 h-80 bg-[#4c0473] flex hidden");
  }
}

// Puts Search Div back on screen
function searchAgain(event) {
  if (event.target.tagName.toLowerCase() === "button") {
    questionDiv.setAttribute("class", "absolute xl:top-36 top-56 w-4/5 h-80 bg-[#4c0473] flex block");
    errorDiv.setAttribute("class", "absolute xl:top-36 top-56 w-1/5 h-80 bg-[#4c0473] flex hidden");
    leftSide.setAttribute("class", "flex flex-col xl:w-1/5 w-3/5 hidden xl:py-0 p-2 xl:mb-4");
    noSearchDiv.setAttribute("class", "absolute xl:top-36 top-56 w-4/5 h-80 bg-[#4c0473] flex hidden");
    footerDiv.setAttribute("class", "justify-center flex xl:flex-row flex-col bg-gray-400 font-bold text-lg text-[#4c0473] py-4 w-full hidden");

    stationCards.innerHTML = "";
  }
}

// Runs on Load
function init() {
  requestStations();
}

//event listeners
init();

stationCards.addEventListener("click", function (event) {
  event.preventDefault();

  stationName.name = event.target.getAttribute("data-station");
  stationName.lat = event.target.getAttribute("data-lat");
  stationName.long = event.target.getAttribute("data-long");
  if (stationName.name !== null) {
    addFavorite(stationName);
  }
});

enterBtn.addEventListener("click", runFilter);
startSearchBtn.addEventListener("click", searchAgain);
againSearchBtn.addEventListener("click", searchAgain);
userCoordinates.addEventListener("click", searchAgain);
