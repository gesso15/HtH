// Initialize modal on pageload
$(document).ready(function() {
  $('#myModal').modal('show');
  $('#close-modal').hide();
  $('#open-exhibit').hide();
  $('#replay-game').hide();
})

// Year selection magic
function submitGuess(){  
  user_guess = mainLine.activePin.year;
  if(user_guess != null){
    console.log("User guessed: " + user_guess); // debug
    postGuess(user_guess);
    mMuseumShipment.removeCrate();
  }
  else {
    console.log("No date selected.");
    reprimandUser();
  }
}

// AJAX date guess post request.
function postGuess(user_guess) {
  $.ajax({
    type: 'POST', // HTTP request method (Send the data using post)
    url: '/', // Where to send the data
    data: {'date_guess': user_guess}, // Data to be sent
    success:function(server_data){
      var data = JSON.parse(server_data);
      console.log(data); // debug
      var guess = data['guess'],
      date_begin = data['date_begin'], 
      date_end = data['date_end'], 
      game_end_flag = data['game_end_flag'];

      // Respond to user
      //var reply = "Your guess: " + guess + ". Correct range: " + date_begin + "-" + date_end;
      // If the game isn't over, show the Next Artifact button.
      if (game_end_flag == false){
        get_next_art();
      }
      else {
        $('#open-exhibit').show();
      }
      // In either case, hide the user's guess and submit button. Display response text.
      $('#user-date').empty(); 
      $('#guess-submit').hide();
    },
    error:function(){
      // If the request failed, give feedback to user (replace loading gif with failure message)
      $('#result').html('<p class="error"><strong>Oops!</strong> Try that again in a few moments.</p>');
    }
  });
}

function reprimandUser() {
    $('#result').text("You didn't select a date?!"); 
}

function displayGuess(current_guess) {
    $('#user-date').text(current_guess); 
}


// Toggle date info for debugging (show/hide)
function toggleVisibility(id) {
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
      mainLine.nextPin();
      var data = JSON.parse(server_data);
      console.log(data); //debug line
      $("#artifact-name").text(data["name"]); // name
      $("#artifact-location > span").text(data["fcp"]); // fcp
      $("#artifact-culture > span").text(data["assoccult"]); // assoccult
      $("#artifact-description > span").text(data["description"]); // description
      $("#artifact-museum-num > span").text(data["museum_num"]); // museum_num
      $("#artifact-image").attr("src", data["img_URL"]); // img_URL

      $("#answer > p:nth-child(1) > span").text(data["prod_date_begin"]); // prod_date_begin
      $("#answer > p:nth-child(2) > span").text(data["prod_date_end"]); // prod_date_end
      $("#answer > p:nth-child(3) > span").text(data["prod_date_s"]); // prod_date_s
      $("#answer").hide(); // make sure answer is hidden again
      $("#result").empty(); // remove feedback from previous card guess
      $("#user-date").empty(); // remove feedback from previous card guess
      $("#guess-submit").show(); // show guess submit button
      $('#next-artifact').hide(); // hide next artifact button
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
      $('#modal-message').html(
        "<p>Thank you, " + name + "!</p>"
        + "<p>Now you can start unboxing the artifacts and identifying their dates of origin.</p>"
        + "<p>When you finish dating the artifacts, we'll open the exhibit.</p>");
      $('#close-modal').show();
      // Hide parts of the form that we don't need
      $('#nameForm > input[name="player_name"]').hide();
      $('#nameForm > input[type="submit"]').hide();
      // Add player name to page.
      $("#user-name").text(name);
    },
    error:function(){
      // If the request failed, give feedback to user (replace loading gif with failure message)
      $('#modal-message').html('<p class="error"><strong>Oops!</strong> Try that again in a few moments.</p>');
    }
  });
});


// AJAX retrieval of player's score
function view_score() {
  $.ajax({
    url : "/get_score",
    type: "GET",
    data : "",
    success: function(server_data, textStatus, jqXHR)
    {
      var data = server_data;
      console.log(data); //debug line
      $('#artifact-header').hide();
      $('#open-exhibit').hide();
      $('#replay-game').show();
    },
    error: function (jqXHR, textStatus, errorThrown)
    {
      console.log("get fail"); // debug line
    }
  });
}