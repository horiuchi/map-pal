(function(){

var name = getParameterByName('name');
var id = getParameterByName('id');
var map;
var marker_list = new google.maps.MVCArray();
var pinImages = {};


function initialize() {
  var myOptions = {
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);

  var displayPosition = function(pos, errorFlag) {
    if (pos) {
      marker_list.forEach(function(marker, index) {
        marker.setMap(null);
      });

      //addMapMarker(pos, name, null);
      map.setCenter(pos);

      $.ajax({
        type: 'GET',
        url: '/loc',
        data: { name: name, id: id, lat: pos.lat(), lng: pos.lng() },
        dataType: 'jsonp',
        complete: function() {
          $(function() {
            addMapMarker(pos, name, null);
            setTimeout(function() {
              getMyPosition(displayPosition);
            }, 5000);
          });
        },
        success: function(data, status) {
          for (var user in data) {
            var detail = data[user];
            console.log(' ' + user + ' ' + detail['now'] + ' ' + detail['lat'] + ' ' + detail['lng']);
            if (name != user) {
              var pos = new google.maps.LatLng(detail['lat'], detail['lng']);
              addMapMarker(pos, user, "0000FF");
            }
          }
        },
        error: function(jqXHR, status) {
          console.log('error: ' + status);
        }
      });
      return pos;
    } else {
      handleNoGeolocation(errorFlag);
      return null;
    }
  };
  getMyPosition(displayPosition);
}

function addMapMarker(pos, name, color) {
  var marker = new google.maps.Marker({
    map: map,
    position: pos,
    title: name
  });
  if (color != null) {
    var images = createPinImage(color);
    if (images) {
      marker.setIcon(images['icon']);
      marker.setShadow(images['shadow']);
    }
  }
  if (name) {
    var info = new google.maps.InfoWindow({
      content: name
    });
    google.maps.event.addListener(marker, 'click', function() {
      info.open(marker.get('map'), marker);
    });
  }
  marker_list.push(marker);
}

function createPinImage(color) {
  var images = pinImages[color];
  if (images) return images;

  images = {
    icon : new google.maps.MarkerImage(
      "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color,
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34)),
    shadow : new google.maps.MarkerImage(
      "http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
      new google.maps.Size(40, 37),
      new google.maps.Point(0, 0),
      new google.maps.Point(12, 35))
  };
  pinImages[color] = images;
  return images;
}

function getMyPosition(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      callback(pos, true);
    }, function() {
      callback(null, true);
    });
  } else {
    // Browser doesn't support Geolocation
    callback(null, false);
  }
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(35.65668, 139.696299),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}

google.maps.event.addDomListener(window, 'load', initialize);

})();
