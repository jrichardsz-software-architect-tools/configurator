$(document).ready(function($) {
  $("#selectApplicationComponent").on('change', function() {
    console.log(this.value);
    document.location.href = "/application-variable?application_id="+this.value;
  });
});
