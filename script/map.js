(function(){

var name = getParameterByName('name');
var id = getParameterByName('id');
var map;
var marker_list = new google.maps.MVCArray();

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

      var marker = new google.maps.Marker({
        map: map,
        position: pos,
        title: name
      });
      marker_list.push(marker);
      map.setCenter(pos);

      $.ajax({
        type: 'GET',
        url: '/loc',
        data: { name: name, id: id, lat: pos.lat(), lon: pos.lng() },
        dataType: 'jsonp',
        complete: function() {
          $(function() {
            setTimeout(function() {
            getMyPosition(displayPosition);
            }, 5000);
          });
        },
        success: function(data, status) {
          console.log('success: ' + data['id'] + ' ' + data['name'] + ' ' + data['now']);
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
