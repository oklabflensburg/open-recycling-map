fetch('/flensburg_altglas_container.geojson', {
  method: 'GET'
})
.then((response) => {
  return response.json()
})
.then((data) => {
  marker(data);
})
.catch(function (error) {
  console.log(error);
});


const map = L.map('map').setView([54.7836, 9.4321], 15);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let geocoder = L.Control.Geocoder.nominatim();

if (typeof URLSearchParams !== 'undefined' && location.search) {
    // parse /?geocoder=nominatim from URL
    let params = new URLSearchParams(location.search);
    let geocoderString = params.get('geocoder');

    if (geocoderString && L.Control.Geocoder[geocoderString]) {
        console.log('Using geocoder', geocoderString);
        geocoder = L.Control.Geocoder[geocoderString]();
    } else if (geocoderString) {
        console.warn('Unsupported geocoder', geocoderString);
    }
}

const osmGeocoder = new L.Control.geocoder({
    query: 'Flensburg',
    position: 'topright',
    placeholder: 'Adresse oder Ort',
    defaultMarkGeocode: false
}).addTo(map);

osmGeocoder.on('markgeocode', e => {
    const bounds = L.latLngBounds(e.geocode.bbox._southWest, e.geocode.bbox._northEast);
    map.fitBounds(bounds);
});


function marker(data) {
    let markers = L.markerClusterGroup({
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 17
    });

    const geojsonGroup = L.geoJSON(data, {
        onEachFeature: function (feature, layer) {
            layer.on('click', function (e) {
                document.getElementById('filter').scrollTo({
                    top: 0,
                    left: 0
                });

                map.setView(e.latlng, 17)
            })
        },
        pointToLayer: function (feature, latlng) {
            const label = String(feature.properties.location);

            const customIcon = L.icon({
                iconUrl: '/assets/marker-icon-orange.png',
                shadowUrl: '/assets/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                tooltipAnchor: [0, -38],
                shadowSize: [41, 41]
            });

            return L.marker(latlng, {icon: customIcon}).bindTooltip(label, {
                permanent: false,
                direction: 'top'
            }).openTooltip();
        }
    });

    markers.addLayer(geojsonGroup);
    map.addLayer(markers);
}
