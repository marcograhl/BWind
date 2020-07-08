const warnung = '#C53030';
const noWind = '#CBD5E0';
const keineOptBed = '#2B6CB0';
const optBed = '#2F855A';
let status;



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

function setStatus(level){
  status = level
return status
}
setStatus(beginner)

let {max, opt, nOpt} = status;



const select = selector => document.querySelector( selector )
const selectAll = selector => Array.from(document.querySelectorAll( selector ))




// const bft0  = select('#bft0');
// const bft2  = select('#bft2')
// const bft3  = select('#bft3')
// const bft4  = select('#bft4')
// const bft5  = select('#bft5')
// const bft6  = select('#bft6')
// const bft7  = select('#bft7')
// const bft8  = select('#bft8')
// const bft9  = select('#bft9')
// const bft10 = select('#bft10')
// const bft11 = select('#bft11')




let map = L.map('map',{
center: [52.49,13.4],
zoom: 11
});
L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png', {
zoom:{maxZoom:18},
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


const api_url = 'berlin/all.geojson';

async function getLocationBadegewaesser(){
const response = await fetch(api_url)
const data = await response.json();

data.features.forEach(feature => {
const [lat,lon] = feature.geometry.coordinates;
const title = feature.properties.title
getLocationsWind(lat,lon);


  })//forEach Ende

} //Ende getLocationBadegewaesser()


async function getLocationsWind(lat,lon){
let api_weather = `http://api.openweathermap.org/data/2.5/weather?lat=${lat.toFixed(2)}&lon=${lon.toFixed(2)}&appid=d9ac5a255242738aaf934b33eb1488fa` 
  const response = await fetch(api_weather)
  const data = await response.json();

  // console.log(data)

  let {deg, speed} = data.wind
  // speed is m/s we need knots to work with the barb -> need img legend
  // let knot = speed * 1.94384;
  let knot = 7;
  let kmh = Math.floor(knot * 1.852);

  // console.log(knot)
  if(knot > max){
    let icon = L.WindBarb.icon({lat,deg,speed: knot, pointRadius:
      7,strokeLength:12,fillColor: warnung})
    let marker = L.marker([lat,lon],{icon: icon}).addTo(map)
    return marker
  }else if(knot > opt){
   let icon = L.WindBarb.icon({lat,deg,speed: knot, pointRadius:
      7,strokeLength:12,fillColor: optBed })
    let marker = L.marker([lat,lon],{icon: icon}).addTo(map)
    return marker
  }else if(knot > nOpt){
       let icon = L.WindBarb.icon({lat,deg,speed: knot, pointRadius:
      7,strokeLength:12,fillColor: keineOptBed})
    let marker = L.marker([lat,lon],{icon: icon}).addTo(map)
    return marker
  }else{
  let icon = L.WindBarb.icon({lat,deg,speed: knot, pointRadius: 7,strokeLength:12, fillColor:
   noWind})
   let marker = L.marker([lat,lon],{icon: icon}).addTo(map)
   return marker
}

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
}

// set marker to extract the svg for the legend, had to use figma to get it right
// http://www.aos.wisc.edu/~hopkins/100hold/sfc-anl.htm 
//https://de.wikipedia.org/wiki/Beaufortskala#:~:text=Hier%20wird%20etwa%20Windst%C3%A4rke%200,Gesicht%20sp%C3%BCrbar%20und%20Bl%C3%A4tter%20rascheln.&text=In%20dieser%20Version%20ist%20die,W%C3%B6rterb%C3%BCcher%20und%20Enzyklop%C3%A4dien%20aufgenommen%20worden.

// function setBarbTest(){
//   let lon = 13.4;
//   let lat = 52.49;
//   let deg = 90;
//   let knot = 43;

//     if(knot > 32){
//     let icon = L.WindBarb.icon({lat,deg,speed: knot, pointRadius:
//       7,strokeLength:12,fillColor: warnung})
//     let marker = L.marker([lat,lon],{icon: icon}).addTo(map)
//   }else if(knot > 17){
//    let icon = L.WindBarb.icon({lat,deg,speed: knot, pointRadius:
//       7,strokeLength:12,fillColor: optBed })
//     let marker = L.marker([lat,lon],{icon: icon}).addTo(map)
//   }else if(knot > 7){
//        let icon = L.WindBarb.icon({lat,deg,speed: knot, pointRadius:
//       7,strokeLength:12,fillColor: keineOptBed })
//     let marker = L.marker([lat,lon],{icon: icon}).addTo(map)
//   }
// }

//test color
// function circleColor() {
//   console.log(this)
//   return "red"
// }


const dataSpeedArray = selectAll('[data-speed]')

dataSpeedArray.forEach(svg =>{
  if(svg.dataset.speed > max){
    svg.setAttribute('fill', warnung);
  }else if(svg.dataset.speed > opt){
    svg.setAttribute('fill', optBed);
  }else if(svg.dataset.speed > nOpt){
    svg.setAttribute('fill', keineOptBed);
  }else{
     svg.setAttribute('fill', noWind);
  }
})

// select('#bft0').setAttribute('fill',circleColor()) //function color get the value
// // // console.log(select('#bft0').dataset.speed)
// select('#bft2').setAttribute('fill',circleColor()) //function color get the value

// setBarbTest();
getLocationBadegewaesser();


