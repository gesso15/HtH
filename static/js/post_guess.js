// Initialize modal on pageload
$(document).ready(function() {
  $('#myModal').modal('show');
})

// AJAX version of form submission....
// Attach a submit handler to the form
$('#guessForm').submit(function(event){
  
  // Stop form from submitting normally (which would trigger page reload)
  event.preventDefault();
  // Get some values from elements on the page
  var $form = $(this),
  guess = $form.find( "input[name='date_guess']" ).val();
  formURL = $form.attr( "action" );
  console.log(guess); // debug
  
  // the AJAX part
  $.ajax({
    type: 'POST', // HTTP request method (Send the data using post)
    url: formURL, // Where to send the data
    data: {'date_guess': guess}, // Data to be sent
    beforeSend:function(){
      // While we wait to get data back from the server, put a loading gif on the page
      $('#result').html('<div class="loading"><img src="http://www.kyleschaeffer.com/wp-content/uploads/2010/04/loading.gif" alt="Loading..." /></div>');
    },
    success:function(data){
      // If the request was successful, replace the loading gif with the data received
      console.log(data); // debug
      $('#result').empty().append(data);
    },
    error:function(){
      // If the request failed, give feedback to user (replace loading gif with failure message)
      $('#result').html('<p class="error"><strong>Oops!</strong> Try that again in a few moments.</p>');
    }
  });
});


// Toggle date info for debugging
function toggle_visibility(id) {
  var e = document.getElementById(id);
  if(e.style.display == 'block')
    { e.style.display = 'none'; }
  else{ e.style.display = 'block'; }
}

function get_next_art() {
  $.ajax({
    url : "/get_art",
    type: "GET",
    data : "art please",
    success: function(server_data, textStatus, jqXHR)
    {
      var data = JSON.parse(server_data);
      console.log(data); //debug line
      $("#left-box > h1").text(data["name"]); //name
      $("#left-box > p:nth-child(2) > span").text(data["fcp"]); // fcp
      $("#left-box > p:nth-child(3) > span").text(data["assoccult"]); // assoccult
      $("#left-box > p:nth-child(4) > span").text(data["description"]); // description
      $("#left-box > p:nth-child(5) > span").text(data["museum_num"]); // museum_num
      $("#main-img-block > img").attr("src", data["img_URL"]); // img_URL

      $("#answer > p:nth-child(1) > span").text(data["prod_date_begin"]); // prod_date_begin
      $("#answer > p:nth-child(2) > span").text(data["prod_date_end"]); // prod_date_end
      $("#answer > p:nth-child(3) > span").text(data["prod_date_s"]); // prod_date_s
    },
    error: function (jqXHR, textStatus, errorThrown)
    {
      console.log("get fail"); // debug line
    }
  });
}