// Callback that initializes the Google Map object and activates Knockout
function initMap() {
    /* position Amsterdam */
    var latlng = new google.maps.LatLng(52.3731, 4.8922);

    var mapOptions = {
        center: latlng,
        scrollWheel: false,
        zoom: 13
    };

    var marker = new google.maps.Marker({
        position: latlng,
        url: '/',
        animation: google.maps.Animation.DROP
    });

    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    marker.setMap(map);
}


// This fires if there's an issue loading the Google Maps API script
function initMapLoadError() {
    alert('Failed to initialize the Google Maps API');
    console.log('Failed to initialize Google Maps API');
}


// Google Map object
var map;

