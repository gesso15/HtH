// Initialize modal on pageload
$(document).ready(function() {
  $('#myModal').modal('show');
})

// AJAX version of answer form submission...
// Attach a submit handler to the answer form
$('#guessForm').submit(function(event){
  // Stop form from submitting normally (which would trigger page reload)
  event.preventDefault();

  user_guess = mainLine.selector.year;
  // Verify that the field is populated
  if(user_guess != null){
    // Get some values from elements on the page
    var $form = $(this),
    formURL = $form.attr( "action" );
    console.log("User guessed: " + user_guess); // debug
    post_guess(formURL, user_guess);
  }
  else {
    console.log("WTF user did not select a date?!")
    reprimand_user();
  }
});

function post_guess(formURL, user_guess) {
  // the AJAX part
  $.ajax({
    type: 'POST', // HTTP request method (Send the data using post)
    url: formURL, // Where to send the data
    data: {'date_guess': user_guess}, // Data to be sent
    beforeSend:function(){
      // While we wait to get data back from the server, put a loading gif on the page
      $('#result').html('<div class="loading"><img src="http://www.kyleschaeffer.com/wp-content/uploads/2010/04/loading.gif" alt="Loading..." /></div>');
    },
    success:function(server_data){
      var data = JSON.parse(server_data);
      console.log(data); // debug
      // If the request was successful, replace the loading gif with the data received
      $('#result').empty().append(data["eval"]);
      $("#money-box > p > span").text(data["points"]);
    },
    error:function(){
      // If the request failed, give feedback to user (replace loading gif with failure message)
      $('#result').html('<p class="error"><strong>Oops!</strong> Try that again in a few moments.</p>');
    }
  });
}

// AJAX retrieval of new artifact
function reprimand_user() {
    // remove feedback from previous card guess
    $('#result').text("WTF you didn't select a date?!"); 
}

// Toggle date info for debugging (show/hide)
function toggle_visibility(id) {
  $(id).toggle();
}

// AJAX retrieval of new artifact
function get_next_art() {
  $.ajax({
    url : "/get_art",
    type: "GET",
    data : "",
    success: function(server_data, textStatus, jqXHR)
    {
      var data = JSON.parse(server_data);
      console.log(data); //debug line
      $("#left-box > h1").text(data["name"]); // name
      $("#left-box > p:nth-child(2) > span").text(data["fcp"]); // fcp
      $("#left-box > p:nth-child(3) > span").text(data["assoccult"]); // assoccult
      $("#left-box > p:nth-child(4) > span").text(data["description"]); // description
      $("#left-box > p:nth-child(5) > span").text(data["museum_num"]); // museum_num
      $("#main-img-block > img").attr("src", data["img_URL"]); // img_URL

      $("#answer > p:nth-child(1) > span").text(data["prod_date_begin"]); // prod_date_begin
      $("#answer > p:nth-child(2) > span").text(data["prod_date_end"]); // prod_date_end
      $("#answer > p:nth-child(3) > span").text(data["prod_date_s"]); // prod_date_s
      $("#answer").hide(); // make sure answer is hidden again
      $('#result').empty(); // remove feedback from previous card guess
    },
    error: function (jqXHR, textStatus, errorThrown)
    {
      console.log("get fail"); // debug line
    }
  });
}


// AJAX name form submission...
// Attach a submit handler to the name form
$('#nameForm').submit(function(event){
  
  // Stop form from submitting normally (which would trigger page reload)
  event.preventDefault();
  // Get some values from elements on the page
  var $form = $(this),
  name = $form.find( "input[name='player_name']" ).val(),
  formURL = $form.attr( "action" );
  console.log(name); // debug
  
  // the AJAX part
  $.ajax({
    type: 'POST', // HTTP request method (Send the data using post)
    url: formURL, // Where to send the data
    data: {'name': name}, // Data to be sent
    beforeSend:function(){
      // While we wait to get data back from the server, put a loading gif on the page
      $('#modal-message').html('<div class="loading"><img src="http://www.kyleschaeffer.com/wp-content/uploads/2010/04/loading.gif" alt="Loading..." /></div>');
    },
    success:function(server_data){
      console.log(server_data); // debug
      // If the request was successful, welcome the player
      $('#modal-message').html("<p> Welcome " + name + "!</p>");
      // Hide parts of the form that we don't need
      $('#nameForm > input[name="player_name"]').hide();
      $('#nameForm > input[type="submit"]').hide();
      // Add player name to page.
      $("#right-box > p:nth-child(1) > span").text(name);
    },
    error:function(){
      // If the request failed, give feedback to user (replace loading gif with failure message)
      $('#modal-message').html('<p class="error"><strong>Oops!</strong> Try that again in a few moments.</p>');
    }
  });
});