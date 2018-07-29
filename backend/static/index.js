var map = L.map('mapid', {
    maxZoom: 18,
    minZoom: 16,
    maxBounds: [
        //south west
        [46.18, 6.1],
        //north east
        [46.3, 5.95]
        ]
}).setView([46.2363, 6.0412], 16);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);


var eventNames = [];
var selectedEvents = [];
var selectedName = "";

// markers color
var greenIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var redIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var blueIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var violetIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

var icons = {
	"red": redIcon,
	"blue": blueIcon,
	"green": greenIcon,
	"purple": violetIcon,
}

function loadEvents() {

	var layer = $("#list");
	var string = "";

	$.ajax({
		type: "GET",
		url: "/events/",
		success: function(events) {

			var events = JSON.parse(events);
			events.forEach(function(event) {
				string += "<div class=\"item\">"
				+ "<div class=\"ui " + event.colorName + " header\"><input type=\"checkbox\" name=\"" + event.name + "\""
				+ " value=\"" + event.id + "\" onchange=\"saveSelection(this)\"/>&nbsp&nbsp&nbsp"
				+ event.name + "</div>"
				+ event.time + "</div>";
			})
			document.getElementById("list").innerHTML = string
		}
	});

}

function fetchEvents() {

	$.ajax({
        type: "POST",
        dataType: 'json',
        url: "/fetch/",
        contentType: 'application/json',
        data: JSON.stringify(selectedEvents),
        success: function(events) {
			clearMap();
			eventNames = [];
			
			events.forEach(function(element) {
				eventNames.push({title: element.name});
				paintBuilding(element, icons[element.colorName]);
				paintMembers(element.members, element.colorHex);
			});

			$('.ui.search').search({
				source: eventNames
			});
			
		},
    });
}


/** Clears the map from circles and popups */
function clearMap() {

    for (i in map._layers) {

        if (map._layers[i]._path != undefined || map._layers[i]._icon != undefined) {
            try {
                map.removeLayer(map._layers[i]);
            }
            catch(e) {
                console.log("problem with " + e + map._layers[i]);
            }
        }
    }
}


function paintBuilding(info, icon) {
	L.marker(info.location[0], {icon: icon}).addTo(map).on('click', function(e) {
			//open popup;
  			var popup = L.popup()
   				.setLatLng(e.latlng) 
   				.setContent(info.name)
   				.openOn(map);
		});;
}


function paintMembers(members, color) {

	members.forEach( function(element, index) {
		L.circleMarker(element.coordinates, {color: color, title: element.username}).addTo(map).on('click', function(e) {
			//open popup;
  			var popup = L.popup()
   				.setLatLng(e.latlng) 
   				.setContent(element.username)
   				.openOn(map);
		});
	});
}



// ####################################################################

// Not working
function sendLocation(location) {

	$.ajax({
        type: "POST",
        dataType: 'json',
        url: "/upload/",
        contentType: 'application/json',
        data: JSON.stringify({"username": selectedName, "coordinates": [location.latlng.lat, location.latlng.lng], "event_ids": selectedEvents }),
        success: function(response) {
        	console.log("hello");
			//var json = JSON.parse(response);
			console.log(response);
			
		},
		error: function(response) {
        	console.log("hello2");
		},
    });
}


function onLocationFound(e) {
	var radius = e.accuracy / 2;

	L.marker(e.latlng).addTo(map)
		.bindPopup("You are within " + radius + " meters from this point").openPopup();

	L.circle(e.latlng, radius).addTo(map);

	console.log(e.latlng)
	//TODO send this to server
	sendLocation(e)
}


function saveName() {
	selectedName = $("#nameField").val();
}


function saveSelection(e) {

	if (selectedEvents.includes(e.value)) {
		index = selectedEvents.indexOf(e.value);
    	selectedEvents.splice(index, 1);
	}
	else {
		selectedEvents.push(e.value);
	}
}

// Leaflet style get location:
map.locate({setView: false, maxZoom: 16}); // setView: true if we want to set the map to the user position

map.on('locationfound', onLocationFound);

loadEvents();
var fetchInterval = setInterval(fetchEvents, 500);
var cleaningInterval = setInterval(function() { map.closePopup();}, 1500);

