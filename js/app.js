// Object representing a Nijgmen Place
function Venue(dataObj) {
    var self = this;

    self.name = dataObj.venue.name;
    self.categorieName = dataObj.venue.categories[0].name;
    self.categorieId = dataObj.venue.categories[0].id;
    self.hours = dataObj.venue.hours;
    self.location = dataObj.venue.location;
    self.latitude = parseFloat(dataObj.venue.location.lat);
    self.longitude = parseFloat(dataObj.venue.location.lng);
    self.url = dataObj.venue.url;
    self.price = dataObj.venue.price;

    // Create the map marker for this SubwayStation object
    self.mapMarker = new google.maps.Marker({
        position: {lat: self.latitude, lng: self.longitude},
        map: map,
        title: self.name
    });

    // Create the info window for this SubwayStation object
    self.infoWindow = new google.maps.InfoWindow();


    // Enables marker bounce animation and shows the info window. If another
    // SubwayStation object is active, it is deactivated first, since only one
    // object can be active at a time. This prevents UI clutter.
    self.activate = function () {
        // Check the variable that references the currently active
        // SubwayStation object. If the value is not null and it doesn't point
        // to this object, then run its deactivate method.
        if (Venue.prototype.active) {
            if (Venue.prototype.active !== self) {
                Venue.prototype.active.deactivate();
            }
        }

        // Enable marker bounce animation and show info window
        self.mapMarker.setAnimation(google.maps.Animation.BOUNCE);

        // Set this SubwayStation object as the active one
        Venue.prototype.active = self;
    };

    // Disables marker bounce animation and closes the info window
    self.deactivate = function () {
        // Disable marker bounce and close info window
        self.mapMarker.setAnimation(null);
        self.infoWindow.close();

        // Since this object is being deactivated, the class variable which
        // holds the reference to the active object is set to null
        Venue.prototype.active = null;
    };

    // Centers the map on the requested location, then activates this
    // SubwayStation object. This fires when a listview item is clicked,
    // via Knockout.
    self.focus = function () {
        map.panTo({lat: self.latitude, lng: self.longitude});
        self.activate();
    };

    // Toggles the active state of this SubwayStation object. This is the
    // callback for the marker's click event.
    self.mapMarkerClickHandler = function () {
        // If currently active (marker bouncing, info window visible),
        // deactivate. Otherwise, activate.
        if (Venue.prototype.active === self) {
            self.deactivate();
        } else {
            self.activate();
        }

    };

    // Deactivates this SubwayStation object when the info marker's close
    // button is clicked
    self.infoWindowCloseClickHandler = function () {
        self.deactivate();
    };

    // Sets mapMarkerClickHandler as the click callback for the map marker
    self.mapMarker.addListener('click', self.mapMarkerClickHandler);

    // Sets infoWindowCloseClickHandler as the click callback for the info
    // window's close button
    self.infoWindow.addListener('closeclick', self.infoWindowCloseClickHandler);
}
Venue.prototype.active = null;

// Main list view
function VenuesViewModel() {
    var self = this;
    self.typesOptions = ko.observableArray([]);
    self.message = ko.observable('Loading Places...');
    self.venues = ko.observableArray([]);
    self.filterSelection = ko.observable('');
    self.isVisible = ko.observable(true);


    $.getJSON("https://api.foursquare.com/v2/venues/explore?mode=url&near=Nijmegen&oauth_token=GCWY3EEFV4EWG0KL1GMJS51JNYJCVO4DUMI2NLAQ40UJMGIZ&v=20160830", function (data) {
        var venuesArray = [];
        var typeFilters = [];
        var venue;
        var bounds = new google.maps.LatLngBounds();
        data.response.groups[0].items.forEach(function (dataObj) {

            var option = dataObj.venue.categories[0].name;

            if ($.inArray(option,typeFilters) === -1){
                typeFilters.push(option);
            }


            venue = new Venue(dataObj);
            venuesArray.push(venue);
            bounds.extend(venue.mapMarker.position);

        });

        self.venues(venuesArray);
        self.typesOptions(typeFilters);


        map.fitBounds(bounds);

        self.message(null);
    }).fail(function () {
        self.message('Unable to load data... try refreshing');
        console.log('ERROR: Could not acquire the place Information from the JSON');
    });

    self.filterResults = ko.computed(function () {

        var matches = [];

        if (self.filterSelection() != undefined) {
            var filter = self.filterSelection();
            var re = new RegExp(filter, 'i');
        }

        self.venues().forEach(function (venue) {
            // If it's a match, save it to the list of matches and show its
            // corresponding map marker
            if (venue.categorieName.search(re) !== -1) {
                matches.push(venue);
                venue.mapMarker.setVisible(true);
                // Otherwise, ensure the corresponding map marker is hidden
            } else {
                // Hide marker
                venue.mapMarker.setVisible(false);

                // If this station is active (info window is open), then
                // deactivate it
                if (Venue.prototype.active === venue) {
                    venue.deactivate();
                }
            }
        });

        return matches;
    });

    self.toggleVisibility = function () {
        self.isVisible(!self.isVisible());
    };

    self.clickHandler = function (place) {
        // Hide the list if the viewing area is small
        if (window.innerWidth < 1024) {
            self.isVisible(false);
        }

        // Show the station's map marker and info window
        place.focus();
    };


}

// Callback that initializes the Google Map object and activates Knockout
function initMap() {
    /* position Amsterdam */
    var latlng = new google.maps.LatLng("51.8126", "5.8372");

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

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    marker.setMap(map);

    ko.applyBindings(new VenuesViewModel());

}


// This fires if there's an issue loading the Google Maps API script
function initMapLoadError() {
    alert('Failed to initialize the Google Maps API');
    console.log('Failed to initialize Google Maps API');
}

// Google Map object
var map;



