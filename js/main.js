
const select = selector => document.querySelector(selector)
const selectAll = selector => Array.from(document.querySelectorAll(selector))
//Vars
//Colors for barbs
const alertColor = '#C53030';
const noWindColor = '#CBD5E0';
const noOptColor = '#2B6CB0';
const optColor = '#2F855A';

const dataSpeedArray = selectAll('[data-speed]')
let initVars;
let key = "status"

//flags
let beginnerFlag = null;
let online = navigator.onLine;


// Storage
function readStorarge() {
  let jsonData = localStorage.getItem(key);
  if (!jsonData) {
    return {};
  } else {
    return JSON.parse(jsonData);
  }

}

function writeStorage(data) {
  let jsonString = JSON.stringify(data);
  localStorage.setItem(key, jsonString);
};

function updateStorage(value) {
  // need a way to look whats inside thestorage we only use one key
  let status = readStorarge();
  status = value;

  writeStorage(status);
}


let beginnerRadio = select('#beginner')
let veteranRadio = select('#veteran')

const beginner ={
  nOpt:3,
  max: 22,
  opt: 8
}

const fortgeschritten ={
  nOpt:3,
  max: 32,
  opt: 13
}



// console.log(initVars)

//#############Functions
//Leaflet draw map with tiles center Berlin, watercolor wont work for the app cause is not an https
// url and he says its insecure :(
// let map = L.map('map',{
// center: [52.49,13.4],
// zoom: 11
// });
// L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png', {
// zoom:{maxZoom:18},
// attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
// }).addTo(map);
// found an alternative https adress
let map = L.map('map',{
center: [52.49,13.4],
zoom: 11
});
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png', {
zoom:{maxZoom:18},
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


// init a layer group for the markers to clear them later easily
let layerGroup = L.layerGroup().addTo(map);

// url for the lon lats of Berlin Badegewässer
const api_url = './berlin/all.geojson';



/*----------  Function to get lat long an give the parameter to the getLocationsWind Fkt  ----------*/
async function getLocationBadegewaesser(initVars) {
  //clear markers because of setIntervall we will draw them again
  layerGroup.clearLayers();
  // ein bisschen Brechstange aber geht
  let status = readStorarge();
  if (status) {
    initVars = beginner;
    beginnerFlag = true;
    beginnerRadio.checked = true;
  } else {
    initVars = fortgeschritten;
    beginnerFlag = false;
    veteranRadio.checked = true
  }

  // writeStorage(beginnerFlag);
  const response = await fetch(api_url)
  const data = await response.json();
  console.log(data)
  data.features.forEach(feature => { //start For Each
    const [lat, lon] = feature.geometry.coordinates;
    getLocationsWind(lat, lon, initVars);
  })//forEach Ende
} //Ende getLocationBadegewaesser()


// Here we get the data from openweathermap and we draw the marker
async function getLocationsWind(lat, lon, initVars) {
  let { opt, nOpt, max } = initVars;
  let api_weather = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=3d5d2f011fe736350cc4a22291d62b0e`
  // let api_weather = `api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_ID}`
  const response = await fetch(api_weather)
  const data = await response.json();
  console.log(response)
  let marker;
  let icon;
  // extract the data we want from the response json
  let {deg, speed} = data.wind

  // speed is m/s we need knots to work with and kmh 
  let knot = speed * 1.94384;
  let kmh = Math.floor(knot * 1.852);

  // start if
  if (knot > max) {
    icon = L.WindBarb.icon({
      lat, deg, speed: knot, pointRadius:
        7, strokeLength: 12, fillColor: alertColor
    })
    marker = L.marker([lat, lon], { icon: icon }).addTo(layerGroup)
  } else if (knot >= opt) {
    icon = L.WindBarb.icon({
      lat, deg, speed: knot, pointRadius:
        7, strokeLength: 12, fillColor: optColor
    })
    marker = L.marker([lat, lon], { icon: icon }).addTo(layerGroup)
  } else if (knot >= nOpt) {
    icon = L.WindBarb.icon({
      lat, deg, speed: knot, pointRadius:
        7, strokeLength: 12, fillColor: noOptColor
    })
    marker = L.marker([lat, lon], { icon: icon }).addTo(layerGroup)
    // console.log(knot)
  }else{
    icon = L.WindBarb.icon({
      lat, deg, speed: knot, pointRadius: 7, strokeLength: 12, fillColor:
        noWindColor
    })
    marker = L.marker([lat, lon], { icon: icon }).addTo(layerGroup)
  }//End if

  // we have the degree from the data and we assign a direction to it
  function degreeToDirection(num) {
  var val = Math.floor((num/22.5) + 0.5);
  var directions =["N","NNO","NO","ONO","O","OSO","SO","SSO","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return directions[val % 16];
}

  let direction = degreeToDirection(deg);

  let content = `
                <p><strong>${kmh}</strong> km/h</p>
                <p><strong>${direction}</strong> Richtung </p>
  `;
  marker.bindPopup(content)

}// end of getLocationsWind

/*----------  Testing  ----------*/
// we cannot make unlimited requests that why i have a test section

// set marker to extract the svg for the legend, had to use figma to get it right
// http://www.aos.wisc.edu/~hopkins/100hold/sfc-anl.htm 
//https://de.wikipedia.org/wiki/Beaufortskala#:~:text=Hier%20wird%20etwa%20Windst%C3%A4rke%200,Gesicht%20sp%C3%BCrbar%20und%20Bl%C3%A4tter%20rascheln.&text=In%20dieser%20Version%20ist%20die,W%C3%B6rterb%C3%BCcher%20und%20Enzyklop%C3%A4dien%20aufgenommen%20worden.
// function setBarbTest(){
//   let lon = 13.4;
//   let lat = 52.49;
//   let deg = 90;
//   let knot = 22;

//     if(knot > max){
//     let icon = L.WindBarb.icon({lat,deg,speed: knot, pointRadius:
//       7,strokeLength:12,fillColor: alertColor})
//     let marker = L.marker([lat,lon],{icon: icon}).addTo(map)
//   }else if(knot >= opt){
//    let icon = L.WindBarb.icon({lat,deg,speed: knot, pointRadius:
//       7,strokeLength:12,fillColor: optColor })
//     let marker = L.marker([lat,lon],{icon: icon}).addTo(map)
//   }else if(knot >= nOpt){
//        let icon = L.WindBarb.icon({lat,deg,speed: knot, pointRadius:
//       7,strokeLength:12,fillColor: noOptColor })
//     let marker = L.marker([lat,lon],{icon: icon}).addTo(map)
//   }else{
//    icon = L.WindBarb.icon({lat,deg,speed: knot, pointRadius: 7,strokeLength:12, fillColor:
//    noWindColor})
//     marker = L.marker([lat,lon],{icon: icon}).addTo(layerGroup)
// }
// }

// when u change the status beginner or veteran, we redraw the map, we need to clear first, or we
// draw mutiple marker ontop
function setStatus(status) {
  if (status == fortgeschritten) {
    beginnerFlag = false;
    updateStorage(beginnerFlag);
  } else {
    beginnerFlag = true;
    updateStorage(beginnerFlag);
  }
  layerGroup.clearLayers();
  getLocationBadegewaesser(status);
  legendBarbColor(dataSpeedArray, status);
}


// The legends barbs will get a specific color
function legendBarbColor(arr, initVars) {
  // here leden wir nochmal aus können wie später in eine andere Fkt auslagern da wie es oben
  // nochmal benutzen
  let status = readStorarge();
  if (status) {
    initVars = beginner;
  } else {
    initVars = fortgeschritten;
  }
  let { opt, nOpt, max } = initVars;
  arr.forEach(svg => {
    if (svg.dataset.speed > max) {
      svg.setAttribute('fill', alertColor);
    } else if (svg.dataset.speed > opt) {
      svg.setAttribute('fill', optColor);
    } else if (svg.dataset.speed > nOpt) {
      svg.setAttribute('fill', noOptColor);
    } else {
      svg.setAttribute('fill', noWindColor);
    }
  })
  // body...
}


beginnerRadio.addEventListener('click', (e) => {
  return setStatus(beginner);
})
veteranRadio.addEventListener('click', (e) => {
  return setStatus(fortgeschritten);
})

// openFullscreen
// openFullscreen(select('body'));

// setBarbTest();
legendBarbColor(dataSpeedArray, initVars);
getLocationBadegewaesser(initVars);

//update the marker all 5min if you have Internet/ set to longer don\t wanna reach limit to fast
if (online) {
  setInterval(getLocationBadegewaesser, 30000000);
}


