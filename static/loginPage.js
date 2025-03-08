//This will clear the login page every time it is loaded. So, for example, if we navigate back to this page post-submission, we will navigate back to a blank page always.
window.addEventListener("pageshow", function() {
    document.getElementById("loginForm").reset();
  });
  //Boolean that tracks whether or not a warning should be flagged upon attempting to leave the current page
  let formChanged = false;

  //This will detect whether or not the user has provided any input to the username textbox.
  document.getElementById("loginForm").addEventListener("input", function() {
      formChanged = true;
  });

  //In the case that the user presses submit as their means of navigating away from the website, no warning message will appear
  document.getElementById("loginForm").addEventListener("submit", function() {
      formChanged = false; 
  });
  //This will display a warning message if the user attempts to navigate away from the warning page after having provdided input, indicating progress will be lost
  window.addEventListener("beforeunload", function(event) {
      if (formChanged) { 
          event.preventDefault();
          event.returnValue = "Your progress will be lost if you leave this page.";
      }
  });