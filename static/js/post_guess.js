
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