fetch('./data/collection.geojson', {
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
            const label = String(feature.properties.place)
            const type = feature.properties.type

            if (type == 'glass_bottle_bin') {
                marker_icon_file = 'glass_bottles_marker.png'
                marker_icon_offset = 23
            }
            else if (type == 'clothing_bin') {
                marker_icon_file = 'clothing_bin_marker.png'
                marker_icon_offset = 0
            }
            else {
                marker_icon_file = 'clothing_bin_marker.png'
                marker_icon_offset = 0
            }


            const customIcon = L.icon({
                iconUrl: `/static/${marker_icon_file}`,
                shadowUrl: '/static/marker-shadow.png',
                iconSize: [30, 43],
                iconAnchor: [25 + marker_icon_offset, 43],
                tooltipAnchor: [-11 - marker_icon_offset, -42],
                shadowSize: [40 + marker_icon_offset, 43]
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
