function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(window.location.search);
  if (results == null) {
      return "";
  } else {
      return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
}
