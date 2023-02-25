mapboxgl.accessToken = mbxToken;
const map = new mapboxgl.Map({
    container: "single-camp-map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: coords,
    zoom: 10
});

const campMarker = new mapboxgl.Marker({ color: "red" })
    .setLngLat(coords)
    .setPopup(
        new mapboxgl.Popup({ offset: 24 })
            .setHTML(`<strong>${title}</strong>`)
    )
    .addTo(map);

map.addControl(new mapboxgl.NavigationControl());