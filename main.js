let dataObject = null
let cluster = null

fetch('./data/collection.geojson', {
    method: 'GET'
})
.then((response) => {
    return response.json()
})
.then((data) => {
    renderPromise(data, 0, false)
})
.catch(function (error) {
    console.error(error)
})

fetch('./data/flensburg_stadtteile.geojson', {
    method: 'GET'
})
.then((response) => {
    return response.json()
})
.then((data) => {
    addDistrictsLayer(data)
})
.catch(function (error) {
    console.error(error)
})

const map = L.map('map').setView([54.7879075, 9.4334885], 13)

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)

let geocoder = L.Control.Geocoder.nominatim()
let previousSelectedMarker = null

if (typeof URLSearchParams !== 'undefined' && location.search) {
    // parse /?geocoder=nominatim from URL
    let params = new URLSearchParams(location.search)
    let geocoderString = params.get('geocoder')

    if (geocoderString && L.Control.Geocoder[geocoderString]) {
        geocoder = L.Control.Geocoder[geocoderString]()
    } else if (geocoderString) {
        console.warn('Unsupported geocoder', geocoderString)
    }
}

const osmGeocoder = new L.Control.geocoder({
    query: 'Flensburg',
    position: 'topright',
    placeholder: 'Adresse oder Ort',
    defaultMarkGeocode: false
}).addTo(map)

osmGeocoder.on('markgeocode', e => {
    const bounds = L.latLngBounds(e.geocode.bbox._southWest, e.geocode.bbox._northEast)
    map.fitBounds(bounds)
})


const iconDefault = L.icon({
    iconUrl: './static/marker-icon-orange.png',
    shadowUrl: './static/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    tooltipAnchor: [2, -41],
    shadowSize: [45, 41]
})


const iconHighlight = L.icon({
    iconUrl: './static/marker-icon-green.png',
    shadowUrl: './static/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    tooltipAnchor: [2, -41],
    shadowSize: [45, 41]
})


const queryform = document.querySelector('#form')

if (queryform.length) {
    queryform.addEventListener('change', (e) => {
        e.preventDefault()

        let myLocation = false
        let districtId = 0

        const data = new FormData(queryform)
        // const districtId = parseInt(data.get('district'))

        myLocation = /^true$/i.test(data.get('myLocation'))

        renderPromise(dataObject, districtId, myLocation)
    })
}


function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            lat = position.coords.latitude
            lng = position.coords.longitude

            L.marker([lat, lng]).addTo(map)
            map.panTo(new L.LatLng(lat, lng))
        })  
    } else {
        alert('Bitte gebe deinen Standort frei')
    }
}

function addDistrictsLayer(data) {
    L.geoJson(data, {
        style: {
            color: '#fff',
            fillColor: '#185a44',
            fillOpacity: 0.4,
            opacity: 0.6,
            weight: 1
        }
    }).addTo(map)
}


function formatAmountOfTrees(amountOfFeatures) {
    const numberFormat = new Intl.NumberFormat('de-DE');
    const amount = numberFormat.format(amountOfFeatures)

    return amount
}


function renderFeatureDetails(feature) {
    const place = feature.properties.place
    const details = feature.properties.details
    const type = feature.properties.type.split(',')

    let detailOutput = ''

    if (type.length > 1) {
        type_title = type.join(' und ').replace('cat8', 'Altglascontainer').replace('cat7', 'Altkleider-')
    } else {
        type_title = type[0].replace('cat8', 'Altglascontainer').replace('cat7', 'Altkleidercontainer')
    }

    if (place && details) {
        place_description = `${place}, ${details}`
    } else {
        place_description = place
    }

    detailOutput += `<li class="py-2 px-2 pt-1 text-xl"><strong>${type_title}</strong></li>`
    detailOutput += `<li class="last-of-type:pb-2 px-2 pt-2"><strong>Aufstellungsort</strong><br>${place_description}</li>`

    document.querySelector('#details').classList.remove('hidden')
    document.querySelector('#detailList').innerHTML = detailOutput

    document.querySelector('title').innerHTML = `${type_title} - ${place}`
    document.querySelector('meta[property="og:title"]').setAttribute('content', `${type_title} - ${place}`)
}


function renderPromise(data, districtId, myLocation) {
    dataObject = data

    if (cluster) {
        map.removeLayer(cluster)
    }

    if (myLocation === true) {
        getUserLocation()
    }

    const geojsonGroup = L.geoJSON(data, {
        filter: function (feature) {
            if (feature.properties.district_id === districtId) {
                return true
            } else if (districtId === 0) {
                return true
            }
  
        },
        onEachFeature: function (feature, layer) {
            layer.on('click', function (e) {
                document.querySelector('#filter').scrollTo({
                    top: 0,
                    left: 0
                })

                renderFeatureDetails(feature)
                map.setView(e.latlng, 17)
            })
        },
        pointToLayer: function (feature, latlng) {
            let label = String(feature.properties.place)

            return L.marker(latlng, {icon: iconDefault}).bindTooltip(label, {
                permanent: false,
                direction: 'top'
            }).openTooltip()
        }
    })

    cluster = L.markerClusterGroup({
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        disableClusteringAtZoom: 19,
        maxClusterRadius: 50
    })

    cluster.on('click', function (a) {
        if (previousSelectedMarker !== null) {
            previousSelectedMarker.setIcon(iconDefault)
        }

        a.layer.setIcon(iconHighlight)
        previousSelectedMarker = a.layer
    })

    cluster.addLayer(geojsonGroup)
    const lengthFeatures = geojsonGroup.getLayers().length
    const amountOfFeatures = formatAmountOfTrees(lengthFeatures)
    // document.querySelector('#amountTrees').innerHTML = `Anzahl angezeigter Orte ${amountOfFeatures}`

    map.addLayer(cluster)
    map.fitBounds(cluster.getBounds(), {padding: [0, 0, 0, 0]})
}
