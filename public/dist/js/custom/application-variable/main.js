$(document).ready(function($) {
  $("#selectApplicationComponent").on('change', function() {
    console.log(this.value);
    document.location.href = "/application-variable?applicationId="+this.value+"&applicationName="+$(this).find("option:selected").text();
  });
});
