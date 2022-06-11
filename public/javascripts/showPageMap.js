// mapbox token accessed using ejs
// code referred from the docs]

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  center: campgroundMap.geometry.coordinates, // starting position [lng, lat]
  zoom: 9, // starting zoom
});

const marker1 = new mapboxgl.Marker()
  .setLngLat(campgroundMap.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup()
      .setLngLat(campgroundMap.geometry.coordinates)
      .setHTML(`<h4>${campgroundMap.title}</h4><p>${campgroundMap.location}`)
  )
  .addTo(map);

// const popup =
