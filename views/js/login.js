function validate() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  if (username == "admin" && password == "user") {
    alert("login successfully");
    window.location.replace("/adminhomepage");
    return false;
  } else {
    alert("login failed");
  }
}
