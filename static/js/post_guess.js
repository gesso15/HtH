// Initialize modal on pageload
$(document).ready(function() {
  $('#myModal').modal('show');
  $('#next-artifact').hide();
})

// Year selection magic
function submitGuess(){  
  user_guess = mainLine.selector.year;
  if(user_guess != null){
    console.log("User guessed: " + user_guess); // debug
    postGuess(user_guess);
    mainLine.selector.reset();
  }
  else {
    console.log("WTF user did not select a date?!");
    reprimandUser();
  }
}

// AJAX date guess post request.
function postGuess(user_guess) {
  $.ajax({
    type: 'POST', // HTTP request method (Send the data using post)
    url: '/', // Where to send the data
    data: {'date_guess': user_guess}, // Data to be sent
    beforeSend:function(){
      // While we wait to get data back from the server, put a loading gif on the page
      $('#result').html('<div class="loading"><img src="http://www.kyleschaeffer.com/wp-content/uploads/2010/04/loading.gif" alt="Loading..." /></div>');
    },
    success:function(server_data){
      replyGuess();
      var data = JSON.parse(server_data);
      console.log(data); // debug
      var guess = data['guess'],
      date_begin = data['date_begin'], 
      date_end = data['date_end'], 
      game_end_flag = data['game_end_flag']; 
    },
    error:function(){
      // If the request failed, give feedback to user (replace loading gif with failure message)
      $('#result').html('<p class="error"><strong>Oops!</strong> Try that again in a few moments.</p>');
    }
  });
}

function reprimandUser() {
    $('#result').text("WTF you didn't select a date?!"); 
}

function replyGuess() {
    $('#result').text("Thank you for your submission.");
    $('#next-artifact').show();
    $('#user_guess').hide(); 
    $('#guess-submit').hide(); 
}

function displayGuess(current_guess) {
    $('#user_guess').text(current_guess); 
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
      $("#result").empty(); // remove feedback from previous card guess
      $("#user_guess").empty(); // remove feedback from previous card guess
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
