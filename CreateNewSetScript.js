//This will clear the junction set design form every time the CreateNewSet page is loaded. So, for example, if we navigate back to this page post-submission, we will navigate back to an empty form.
window.addEventListener("pageshow", function() {
    document.getElementById("junctionForm").reset();
});
  //Boolean that tracks whether or not a warning should be flagged upon attempting to leave the current page
  let formChanged = false;

  //This will detect whether or not the user has provided any input to the username textbox.
  document.getElementById("junctionForm").addEventListener("input", function() {
      formChanged = true;
  });

  //In the case that the user presses submit as their means of navigating away from the website, no warning message will appear
  document.getElementById("junctionForm").addEventListener("submit", function() {
      formChanged = false; 
  });
  //This will display a warning message if the user attempts to navigate away from the warning page after having provdided input, indicating progress will be lost
  window.addEventListener("beforeunload", function(event) {
      if (formChanged) { 
          event.preventDefault();
          event.returnValue = "Your progress will be lost if you leave this page.";
      }
  });
  // Initialize the page with the North direction form displayed by default, thus highlighting the North button before the user has pressed any button
  showDirectionForm('north');
  // Validate that input provided is an integer >= 0
  function validateInteger(input) {
  const value = input.value;
  const isValid = /^\d+$/.test(value);  // Matches one or more digits (non-negative integer)
  const errorMessage = document.getElementById(input.id + "Error");

  if (isValid) {
    input.classList.add("valid");
    input.classList.remove("invalid");
    errorMessage.textContent = ""; // Clear error message
  } else {
    input.classList.add("invalid");
    input.classList.remove("valid");
    errorMessage.textContent = "Please enter a non-negative integer."; // Show error message
  }
}

function validateTextboxInput(event) {
  const textbox = event.target;  // The textbox that triggered the 'input' event
  validateDecimal(textbox);  // Pass the textbox to the validation function
}

  //If the checkbox for pedestrian crossing is checked, the user will be prompted to specify the frequency of crossing requests that will occur.
function northPedestrianToggle() {
    const checkbox = document.getElementById("northPedestrianCheckbox")
    const textbox = document.getElementById("northPedestrian")
    const textboxLabel = document.getElementById("northPedestrianLabel")
    

    //If the checkbox is checked, show the textbox allowing the user to specify crossing request frequency and the textbox's label
    if (checkbox.checked) {
        textbox.style.display = "inline-block";
        textboxLabel.style.display = "inline-block";
        textbox.setAttribute("pattern", "^[0-9]+(\.[0-9]{1})?$")

        // Add event listener for input validation when the textbox is visible
        textbox.addEventListener("input", validateTextboxInput);

        // Validate immediately when the checkbox is checked (for any pre-existing input)
        validateDecimal(textbox);  // Only pass the textbox
    } else {
        textbox.style.display = "none";
        textboxLabel.style.display = "none";
        textbox.removeAttribute("pattern");  // Remove the pattern when unchecked
        // Remove event listener for validation when the textbox is hidden
        textbox.removeEventListener("input", validateTextboxInput);
        //Revalidate the textbox when the checkbox is unchecked
        resetTextBox(textbox)
    }
  }

  function southPedestrianToggle(){
    const checkbox = document.getElementById("southPedestrianCheckbox")
    const textbox = document.getElementById("southPedestrian")
    const textboxLabel = document.getElementById("southPedestrianLabel")

    //If the checkbox is checked, show the textbox allowing the user to specify crossing request frequency and the textbox's label
    if (checkbox.checked) {
        textbox.style.display = "inline-block";
        textboxLabel.style.display = "inline-block";
        textbox.setAttribute("pattern", "^[0-9]+(\.[0-9]{1})?$")

        // Add event listener for input validation when the textbox is visible
        textbox.addEventListener("input", validateTextboxInput);

        // Validate immediately when the checkbox is checked (for any pre-existing input)
        validateDecimal(textbox);  // Only pass the textbox
    } else {
        textbox.style.display = "none";
        textboxLabel.style.display = "none";
        textbox.removeAttribute("pattern");  // Remove the pattern when unchecked
        // Remove event listener for validation when the textbox is hidden
        textbox.removeEventListener("input", validateTextboxInput);
        //Revalidate the textbox when the checkbox is unchecked
        resetTextBox(textbox)
    }
  }

  function eastPedestrianToggle(){
    const checkbox = document.getElementById("eastPedestrianCheckbox")
    const textbox = document.getElementById("eastPedestrian")
    const textboxLabel = document.getElementById("eastPedestrianLabel")

    //If the checkbox is checked, show the textbox allowing the user to specify crossing request frequency and the textbox's label
    if (checkbox.checked) {
        textbox.style.display = "inline-block";
        textboxLabel.style.display = "inline-block";
        textbox.setAttribute("pattern", "^[0-9]+(\.[0-9]{1})?$")

        // Add event listener for input validation when the textbox is visible
        textbox.addEventListener("input", validateTextboxInput);

        // Validate immediately when the checkbox is checked (for any pre-existing input)
        validateDecimal(textbox);  // Only pass the textbox
    } else {
        textbox.style.display = "none";
        textboxLabel.style.display = "none";
        textbox.removeAttribute("pattern");  // Remove the pattern when unchecked
        // Remove event listener for validation when the textbox is hidden
        textbox.removeEventListener("input", validateTextboxInput);
        //Revalidate the textbox when the checkbox is unchecked
        resetTextBox(textbox)
    }
  }

  function westPedestrianToggle(){
    const checkbox = document.getElementById("westPedestrianCheckbox")
    const textbox = document.getElementById("westPedestrian")
    const textboxLabel = document.getElementById("westPedestrianLabel")

    //If the checkbox is checked, show the textbox allowing the user to specify crossing request frequency and the textbox's label
    if (checkbox.checked) {
        textbox.style.display = "inline-block";
        textboxLabel.style.display = "inline-block";
        textbox.setAttribute("pattern", "^[0-9]+(\.[0-9]{1})?$")

        // Add event listener for input validation when the textbox is visible
        textbox.addEventListener("input", validateTextboxInput);

        // Validate immediately when the checkbox is checked (for any pre-existing input)
        validateDecimal(textbox);  // Only pass the textbox
    } else {
        textbox.style.display = "none";
        textboxLabel.style.display = "none";
        textbox.removeAttribute("pattern");  // Remove the pattern when unchecked
        // Remove event listener for validation when the textbox is hidden
        textbox.removeEventListener("input", validateTextboxInput);
        //Revalidate the textbox when the checkbox is unchecked
        resetTextBox(textbox)
    }
  }

  //When checkbox is unchecked, validate the textbox associated and remove any error message
  function resetTextBox(input){
    const errorMessage = document.getElementById(input.id + "Error");
    input.classList.add("valid");
    input.classList.remove("invalid");
    errorMessage.textContent = ""; // Clear error message
  }

  // Validate for decimal (>= 0, with one decimal place)
  function validateDecimal(input) {
    const value = input.value;
    const isValid = /^[0-9]+(\.[0-9]{1})?$/.test(value);  // Matches decimal with one decimal place
    const errorMessage = document.getElementById(input.id + "Error");

    if (isValid) {
      input.classList.add("valid");
      input.classList.remove("invalid");
      errorMessage.textContent = ""; // Clear error message
    } else {
      input.classList.add("invalid");
      input.classList.remove("valid");
      errorMessage.textContent = "Please enter a non-negative number (up to one decimal place)."; // Show error message
    }
  }
  // Show form for the selected direction (hide others)
  function showDirectionForm(direction) {
    // Hide all forms
    document.querySelectorAll('.form-container').forEach(form => form.style.display = 'none');
    
    // Show the selected direction's form
    document.getElementById(direction + 'Form').style.display = 'block';

    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.direction-buttons button');
    buttons.forEach(button => button.classList.remove('active'));

    // Add active class to the clicked button
    document.getElementById(direction + 'Button').classList.add('active');
  }

  // Update the text span to reflect the current value of the slider
  function updatePriorityText(direction) {
    const slider = document.getElementById(direction + 'Priority');
    const textField = document.getElementById(direction + 'PriorityText');
    textField.innerText = slider.value;
  }

  // Custom form validation to prevent submission if fields are invalid
  function validateForm() {
  // Get all the input fields
  const inputs = document.querySelectorAll('input');
  //Get all textbox input fields
  const textInputs = document.querySelectorAll('input[type="text"]'); // Only textboxes
  //Assume that the form starts of valid
  let isValid = true;

  // Validate each input and prevent form submission if any input is invalid
  inputs.forEach(input => {
    // Trigger input validation
    input.dispatchEvent(new Event('input'));

    // Check if input is valid (doesn't have the invalid class)
    if (input.classList.contains('invalid')) {
      isValid = false;
    }
  });

  if (!document.getElementById("northPedestrianCheckbox").checked) {
      document.getElementById("northPedestrian").value = "0";
  }
  if (!document.getElementById("southPedestrianCheckbox").checked) {
      document.getElementById("southPedestrian").value = "0";
  }
  if (!document.getElementById("eastPedestrianCheckbox").checked) {
      document.getElementById("eastPedestrian").value = "0";
  }
  if (!document.getElementById("westPedestrianCheckbox").checked) {
      document.getElementById("westPedestrian").value = "0";
  }

  //Check if there are any empty textboxes
  let hasEmptyTextbox = false;

  // Check only textboxes for empty values
  textInputs.forEach(input => {

      // Validate only if the textbox isn't linked to an unchecked checkbox
      if (input.value.trim() === "") {
          hasEmptyTextbox = true; // Found an empty, required textbox
          isValid = false;
      }
  });

  // Prevent form submission and show alert if any textbox is empty
  if (hasEmptyTextbox) {
      alert("Please fill in all textboxes.");
  }
  

  // 1. Validate that the percentages add up to 100 for all directions

  //parseFloat is used since value retrieved from the object produced by document.getElementId is a string
  const nCarPercentage = parseFloat(document.getElementById('northCarPercentage').value);
  const nBusPercentage = parseFloat(document.getElementById('northBusPercentage').value);
  const nCyclePercentage = parseFloat(document.getElementById('northCyclePercentage').value);
  const nTotalPercentage = nCarPercentage + nBusPercentage + nCyclePercentage;

  if (nTotalPercentage !== 100) {
    alert("North Direction: The percentages of cars, buses, and cycles must add up to 100.");
    isValid = false;
  }

  const sCarPercentage = parseFloat(document.getElementById('southCarPercentage').value);
  const sBusPercentage = parseFloat(document.getElementById('southBusPercentage').value);
  const sCyclePercentage = parseFloat(document.getElementById('southCyclePercentage').value);
  const sTotalPercentage = sCarPercentage + sBusPercentage + sCyclePercentage;

  if (sTotalPercentage !== 100) {
    alert("South Direction: The percentages of cars, buses, and cycles must add up to 100.");
    isValid = false;
  }

  const eCarPercentage = parseFloat(document.getElementById('eastCarPercentage').value);
  const eBusPercentage = parseFloat(document.getElementById('eastBusPercentage').value);
  const eCyclePercentage = parseFloat(document.getElementById('eastCyclePercentage').value);
  const eTotalPercentage = eCarPercentage + eBusPercentage + eCyclePercentage;

  if (eTotalPercentage !== 100) {
    alert("East Direction: The percentages of cars, buses, and cycles must add up to 100.");
    isValid = false;
  }

  const wCarPercentage = parseFloat(document.getElementById('westCarPercentage').value);
  const wBusPercentage = parseFloat(document.getElementById('westBusPercentage').value);
  const wCyclePercentage = parseFloat(document.getElementById('westCyclePercentage').value);
  const wTotalPercentage = wCarPercentage + wBusPercentage + wCyclePercentage;

  if (wTotalPercentage !== 100) {
    alert("West Direction: The percentages of cars, buses, and cycles must add up to 100.");
    isValid = false;
  }

  // 2. Validate that incoming vehicles = exiting vehicles for every direction
  const nIncoming = parseInt(document.getElementById('northVehiclesIn').value);
  const nLeftOut = parseInt(document.getElementById('northLeftOut').value);
  const nStraightOut = parseInt(document.getElementById('northStraightOut').value);
  const nRightOut = parseInt(document.getElementById('northRightOut').value);
  const nTotalExiting = nLeftOut + nStraightOut + nRightOut;

  if (nIncoming !== nTotalExiting) {
    alert("North Direction: The total incoming vehicles must equal the total exiting vehicles.");
    isValid = false;
  }

  const sIncoming = parseInt(document.getElementById('southVehiclesIn').value);
  const sLeftOut = parseInt(document.getElementById('southLeftOut').value);
  const sStraightOut = parseInt(document.getElementById('southStraightOut').value);
  const sRightOut = parseInt(document.getElementById('southRightOut').value);
  const sTotalExiting = sLeftOut + sStraightOut + sRightOut;

  if (sIncoming !== sTotalExiting) {
    alert("South Direction: The total incoming vehicles must equal the total exiting vehicles.");
    isValid = false;
  }

  const eIncoming = parseInt(document.getElementById('eastVehiclesIn').value);
  const eLeftOut = parseInt(document.getElementById('eastLeftOut').value);
  const eStraightOut = parseInt(document.getElementById('eastStraightOut').value);
  const eRightOut = parseInt(document.getElementById('eastRightOut').value);
  const eTotalExiting = eLeftOut + eStraightOut + eRightOut;

  if (eIncoming !== eTotalExiting) {
    alert("East Direction: The total incoming vehicles must equal the total exiting vehicles.");
    isValid = false;
  }

  const wIncoming = parseInt(document.getElementById('westVehiclesIn').value);
  const wLeftOut = parseInt(document.getElementById('westLeftOut').value);
  const wStraightOut = parseInt(document.getElementById('westStraightOut').value);
  const wRightOut = parseInt(document.getElementById('westRightOut').value);
  const wTotalExiting = wLeftOut + wStraightOut + wRightOut;

  if (wIncoming !== wTotalExiting) {
    alert("West Direction: The total incoming vehicles must equal the total exiting vehicles.");
    isValid = false;
  }

  //Valide that the priorities allocated to the 3 key attributes of the junction add up to 100%
  const avgWait = parseInt(document.getElementById('AverageWait').value);
  const maxWait = parseInt(document.getElementById('MaxWait').value);
  const maxQueue = parseInt(document.getElementById('MaxQueue').value);
  const totalPriority = avgWait + maxWait + maxQueue;

  //Make the isValid variable false to denote that there is an issue with a value that the user has provided to the form, as well as clarifying this issue with an alert
  if (totalPriority != 100){
    alert("The sum of attribute priorities must be 100.");
    isValid = false;
  }

  // Return false to prevent form submission if any invalid input is found across all directions
  if (!isValid) {
    alert("Please correct the invalid fields before submitting.");
    return false;
  }

  return true;
}
// Prevent form submission when the Enter key is pressed
document.getElementById('junctionForm').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission on Enter key press
    }
  });