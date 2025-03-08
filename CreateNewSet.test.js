
//This checks the validation section of the validateInteger function. It is not possible to simply import and test this function, since it does not return any value. So, we're testing the pure regular expression checking of that function.
function validateInteger(input) {
    const value = input.value;
    return /^\d+$/.test(value);  // Returns true if the input is a valid integer
}
 
//Test validateInteger works as expected
test('validates integer input correctly', () => {
    let mockInput = { value: '123' };
    expect(validateInteger(mockInput)).toBe(true);

    mockInput = { value: 'abc' };
    expect(validateInteger(mockInput)).toBe(false);

    mockInput = { value: '1.1'};
    expect(validateInteger(mockInput)).toBe(false);
});

//This will check the validation section of the validateDecimal function
function validateDecimal(input){
    const value = input.value;
    return /^[0-9]+(\.[0-9]{1})?$/.test(value)
}

//Test validateDecimal works as expected
test('validates decimal input correctly', () => {
    let mockInput = { value: '123' };
    expect(validateDecimal(mockInput)).toBe(true);

    mockInput = { value: 'abc' };
    expect(validateDecimal(mockInput)).toBe(false);

    mockInput = { value: '1.1'};
    expect(validateDecimal(mockInput)).toBe(true);

    mockInput = { value: '1.12'};
    expect(validateDecimal(mockInput)).toBe(false);
});

// Provide the entire html from CreateNewJunctionSet.html so that when this testing file reads the CreateNewSetScript.js, no problems arise
document.body.innerHTML = `
    <form id="junctionForm" method="POST" action="/layoutform" onsubmit="return validateForm()">

    <!-- Direction buttons to show input forms for each direction -->
    <div class="direction-sidebar">
      <!-- Return to home page -->
      <button type="button" onclick="window.location.href = '/home'" class="back-to-home">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span class="dm-sans-bold-sidebar">Home</span>
      </button>

      <button type="button" id="northButton" class="direction-button" onclick="showDirectionForm('north')">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
        <span class="dm-sans-bold-sidebar">North Arm</span>
      </button>
      <button type="button" id="eastButton" class="direction-button" onclick="showDirectionForm('east')">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
        <span class="dm-sans-bold-sidebar">East Arm</span>
      </button>
      <button type="button" id="southButton" class="direction-button" onclick="showDirectionForm('south')">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
        <span class="dm-sans-bold-sidebar">South Arm</span>
      </button>
      <button type="button" id="westButton" class="direction-button" onclick="showDirectionForm('west')">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span class="dm-sans-bold-sidebar">West Arm</span>
      </button>
    </div>
    <div class="form-content">
      <h1 class="dm-sans-bold-header">Create New Junction</h1>
      <div class="body-text">The values you provide the below fields dictate the general form your function will take. You will then use this general form to create specific junction layouts for comparison.</div>
      <!-- Junction Set Name -->
      <div class="junction-set-group">
        <label class="poppins-medium" for="junctionSetName">Junction Set Name:</label>
        <input class="poppins-regular" type="text" id="junctionSetName" name="junctionSetName">
      </div>
      <!-- Crossing duration for pedestrians -->
      <br>
      <div class="form-group">
        <label class="poppins-medium" for="crossingDuration">Pedestrian Crossing Duration (in seconds):</label>
        <input type="text" id="crossingDuration" name="crossingDuration" oninput="validateDecimal(this)">
        <div class="text-danger poppins-regular" id="crossingDurationError"></div>
      </div>
      <div class="body-text">The below fields represent how you prioritise the key attributes of the junction, as a percentage, with the sum of all percentages provided being 100.</div>
      <!-- User priorities of key junction attributes-->
      <div class="form-group">
        <label class="poppins-medium" for="AverageWait">Average Wait Time Priority (%):</label>
        <input class="poppins-regular" type="text" id="AverageWait" name="AverageWait" oninput="validateInteger(this)">
        <div id="AverageWaitError" class="text-danger poppins-regular"></div>
      </div>
      <div class="form-group">
        <label class="poppins-medium" for="MaxWait">Maximum Wait Time Priority (%):</label>
        <input class="poppins-regular" type="text" id="MaxWait" name="MaxWait" oninput="validateInteger(this)">
        <div id="MaxWaitError" class="text-danger poppins-regular"></div>
      </div>
      <div class="form-group">
        <label class="poppins-medium" for="MaxQueue">Maximum Queue Length Priority (%):</label>
        <input class="poppins-regular" type="text" id="MaxQueue" name="MaxQueue" oninput="validateInteger(this)">
        <div id="MaxQueueError" class="text-danger poppins-regular"></div>
      </div>
      <div class="body-text">All of the above fields apply to the entire junction. The below fields apply only to the arm of the junction that is currently selected.</div>

      <!-- North Form Inputs (Only one of these will be visible at a time) -->
      <div id="northForm" class="form-container">
        <div class="form-group">
          <label class="poppins-medium" for="northVehiclesIn">Total Vehicles Incoming (per hour):</label>
          <input class="poppins-regular" type="text" id="northVehiclesIn" name="northVehiclesIn" oninput="validateInteger(this)">
          <div id="northVehiclesInError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="northLeftOut">Total Vehicles Exiting East (per hour):</label>
          <input class="poppins-regular" type="text" id="northLeftOut" name="northLeftOut" oninput="validateInteger(this)">
          <div id="northLeftOutError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="northStraightOut">Total Vehicles Exiting South (per hour):</label>
          <input class="poppins-regular" type="text" id="northStraightOut" name="northStraightOut" oninput="validateInteger(this)">
          <div id="northStraightOutError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="northRightOut">Total Vehicles Exiting West (per hour):</label>
          <input class="poppins-regular" type="text" id="northRightOut" name="northRightOut" oninput="validateInteger(this)">
          <div id="northRightOutError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="northCarPercentage">Percentage of Cars:</label>
          <input class="poppins-regular" type="text" id="northCarPercentage" name="northCarPercentage"  oninput="validateDecimal(this)">
          <div id="northCarPercentageError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="northBusPercentage">Percentage of Buses:</label>
          <input class="poppins-regular" type="text" id="northBusPercentage" name="northBusPercentage"  oninput="validateDecimal(this)">
          <div id="northBusPercentageError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="northCyclePercentage">Percentage of Cycles:</label>
          <input class="poppins-regular" type="text" id="northCyclePercentage" name="northCyclePercentage"  oninput="validateDecimal(this)">
          <div id="northCyclePercentageError" class="text-danger poppins-regular"></div>
        </div>
        <div class="directionpriority-group">
          <label class="poppins-medium" for="northPriority">Direction Priority:</label>
          <input type="range" id="northPriority" name="northPriority" min="0" max="4" value="0" oninput="updatePriorityText('north')">
          <span id="northPriorityText" class="priority-number">0</span>
        </div>
        <!-- Forces a line break -->
        <br>
        <div class="form-group">
          <label class="poppins-medium">
            Pedestrian Crossing:
            <input type="checkbox" id="northPedestrianCheckbox" name="northPedestrian" value="1" onclick="northPedestrianToggle()">
            <span class="toggle"></span>
          </label>     
        </div> 
        <div class="form-group">
          <label class="poppins-medium" id="northPedestrianLabel" for="northPedestrian" style="display:none;">Crossing Requests (per hour):</label>
          <input class="poppins-regular" type="text" id="northPedestrian" name="northRequestFrequency" style="display:none;">
          <div id="northPedestrianError" class="text-danger poppins-regular"></div>
        </div>
      </div>

      <!-- South Form Inputs -->
      <div id="southForm" class="form-container">
        <div class="form-group">
          <label class="poppins-medium" for="southVehiclesIn">Total Vehicles Incoming (per hour):</label>
          <input class="poppins-regular" type="text" id="southVehiclesIn" name="southVehiclesIn" oninput="validateInteger(this)">
          <div id="southVehiclesInError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="southLeftOut">Total Vehicles Exiting West (per hour):</label>
          <input class="poppins-regular" type="text" id="southLeftOut" name="southLeftOut" oninput="validateInteger(this)">
          <div id="southLeftOutError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="southStraightOut">Total Vehicles Exiting North (per hour):</label>
          <input class="poppins-regular" type="text" id="southStraightOut" name="southStraightOut" oninput="validateInteger(this)">
          <div id="southStraightOutError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="southRightOut">Total Vehicles Exiting East (per hour):</label>
          <input class="poppins-regular" type="text" id="southRightOut" name="southRightOut" oninput="validateInteger(this)">
          <div id="southRightOutError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="southCarPercentage">Percentage of Cars:</label>
          <input class="poppins-regular" type="text" id="southCarPercentage" name="southCarPercentage"  oninput="validateDecimal(this)">
          <div id="southCarPercentageError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="southBusPercentage">Percentage of Buses:</label>
          <input class="poppins-regular" type="text" id="southBusPercentage" name="southBusPercentage"  oninput="validateDecimal(this)">
          <div id="southBusPercentageError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="southCyclePercentage">Percentage of Cycles:</label>
          <input class="poppins-regular" type="text" id="southCyclePercentage" name="southCyclePercentage"  oninput="validateDecimal(this)">
          <div id="southCyclePercentageError" class="text-danger poppins-regular"></div>
        </div>
        <div class="directionpriority-group">
          <label class="poppins-medium" for="southPriority">Direction Priority:</label>
          <input type="range" id="southPriority" name="southPriority" min="0" max="4" value="0" oninput="updatePriorityText('south')">
          <span id="southPriorityText" class="priority-number">0</span>
        </div>
        <!-- Forces a line break -->
        <br>
        <div class="form-group">
          <label class="poppins-medium">
            Pedestrian Crossing:
            <input type="checkbox" id="southPedestrianCheckbox" name="southPedestrian" value="1" onclick="southPedestrianToggle()">
            <span class="toggle"></span>
          </label>     
        </div> 
        <div class="form-group">
          <label class="poppins-medium" id="southPedestrianLabel" for="southPedestrian" style="display:none;">Crossing Requests (per hour):</label>
          <input class="poppins-regular" type="text" id="southPedestrian" name="southRequestFrequency" style="display:none;">
          <div id="southPedestrianError" class="text-danger poppins-regular"></div>
        </div>
      </div>

      <!-- East form inputs -->
      <div id="eastForm" class="form-container">
        <div class="form-group">
          <label class="poppins-medium" for="eastVehiclesIn">Total Vehicles Incoming (per hour):</label>
          <input class="poppins-regular" type="text" id="eastVehiclesIn" name="eastVehiclesIn" oninput="validateInteger(this)">
          <div id="eastVehiclesInError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="eastLeftOut">Total Vehicles Exiting South (per hour):</label>
          <input class="poppins-regular" type="text" id="eastLeftOut" name="eastLeftOut" oninput="validateInteger(this)">
          <div id="eastLeftOutError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="eastStraightOut">Total Vehicles Exiting West (per hour):</label>
          <input class="poppins-regular" type="text" id="eastStraightOut" name="eastStraightOut" oninput="validateInteger(this)">
          <div id="eastStraightOutError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="eastRightOut">Total Vehicles Exiting North (per hour):</label>
          <input class="poppins-regular" type="text" id="eastRightOut" name="eastRightOut" oninput="validateInteger(this)">
          <div id="eastRightOutError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="eastCarPercentage">Percentage of Cars:</label>
          <input class="poppins-regular" type="text" id="eastCarPercentage" name="eastCarPercentage"  oninput="validateDecimal(this)">
          <div id="eastCarPercentageError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="eastBusPercentage">Percentage of Buses:</label>
          <input class="poppins-regular" type="text" id="eastBusPercentage" name="eastBusPercentage"  oninput="validateDecimal(this)">
          <div id="eastBusPercentageError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="eastCyclePercentage">Percentage of Cycles:</label>
          <input class="poppins-regular" type="text" id="eastCyclePercentage" name="eastCyclePercentage"  oninput="validateDecimal(this)">
          <div id="eastCyclePercentageError" class="text-danger poppins-regular"></div>
        </div>
        <div class="directionpriority-group">
          <label class="poppins-medium" for="eastPriority">Direction Priority:</label>
          <input type="range" id="eastPriority" name="eastPriority" min="0" max="4" value="0" oninput="updatePriorityText('east')">
          <span id="eastPriorityText" class="priority-number">0</span>
        </div>
        <!-- Forces a line break -->
        <br>
        <div class="form-group">
          <label class="poppins-medium">
            Pedestrian Crossing:
            <input type="checkbox" id="eastPedestrianCheckbox" name="eastPedestrian" value="1" onclick="eastPedestrianToggle()">
            <span class="toggle"></span>
          </label>     
        </div> 
        <div class="form-group">
          <label class="poppins-medium" id="eastPedestrianLabel" for="eastPedestrian" style="display:none;">Crossing Requests (per hour):</label>
          <input class="poppins-regular" type="text" id="eastPedestrian" name="eastRequestFrequency" style="display:none;">
          <div id="eastPedestrianError" class="text-danger poppins-regular"></div>
        </div>
      </div>

      <!-- West form inputs -->
      <div id="westForm" class="form-container">
        <div class="form-group">
          <label class="poppins-medium" for="westVehiclesIn">Total Vehicles Incoming (per hour):</label>
          <input class="poppins-regular" type="text" id="westVehiclesIn" name="westVehiclesIn" oninput="validateInteger(this)">
          <div id="westVehiclesInError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="westLeftOut">Total Vehicles Exiting North (per hour):</label>
          <input class="poppins-regular" type="text" id="westLeftOut" name="westLeftOut" oninput="validateInteger(this)">
          <div id="westLeftOutError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="westStraightOut">Total Vehicles Exiting East (per hour):</label>
          <input class="poppins-regular" type="text" id="westStraightOut" name="westStraightOut" oninput="validateInteger(this)">
          <div id="westStraightOutError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="westRightOut">Total Vehicles Exiting South (per hour):</label>
          <input class="poppins-regular" type="text" id="westRightOut" name="westRightOut" oninput="validateInteger(this)">
          <div id="westRightOutError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="westCarPercentage">Percentage of Cars:</label>
          <input class="poppins-regular" type="text" id="westCarPercentage" name="westCarPercentage"  oninput="validateDecimal(this)">
          <div id="westCarPercentageError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="westBusPercentage">Percentage of Buses:</label>
          <input class="poppins-regular" type="text" id="westBusPercentage" name="westBusPercentage"  oninput="validateDecimal(this)">
          <div id="westBusPercentageError" class="text-danger poppins-regular"></div>
        </div>
        <div class="form-group">
          <label class="poppins-medium" for="westCyclePercentage">Percentage of Cycles:</label>
          <input class="poppins-regular" type="text" id="westCyclePercentage" name="westCyclePercentage"  oninput="validateDecimal(this)">
          <div id="westCyclePercentageError" class="text-danger poppins-regular"></div>
        </div>
        <div class="directionpriority-group">
          <label class="poppins-medium" for="westPriority">Direction Priority:</label>
          <input type="range" id="westPriority" name="westPriority" min="0" max="4" value="0" oninput="updatePriorityText('west')">
          <span id="westPriorityText" class="priority-number">0</span>
        </div>
        <!-- Forces a line break -->
        <br>
        <div class="form-group">
          <label class="poppins-medium">
            Pedestrian Crossing:
            <input type="checkbox" id="westPedestrianCheckbox" name="westPedestrian" value="1" onclick="westPedestrianToggle()">
            <span class="toggle"></span>
          </label>     
        </div> 
        <div class="form-group">
          <label class="poppins-medium" id="westPedestrianLabel" for="westPedestrian" style="display:none;">Crossing Requests (per hour):</label>
          <input class="poppins-regular" type="text" id="westPedestrian" name="westRequestFrequency" style="display:none;">
          <div id="westPedestrianError" class="text-danger poppins-regular"></div>
        </div>
      </div>

      <!-- Submit the form -->
      <button class="submit-button" type="submit">Create Junction</button>
    </div>
  </form>

  <!-- Bootstrap JavaScript -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="{{ url_for('static', filename='CreateNewSetScript.js')}}" defer></script>
    `;

// Import the showDirectionForm function from the showDirectionForm.js file
const { showDirectionForm } = require('../static/CreateNewsetScript.js');

//Encapsulates all tests for showDirectionForm
describe('showDirectionForm', () => {
test('hides all forms and shows the selected direction form', () => {
    showDirectionForm('north');

    expect(document.getElementById('northForm').style.display).toBe('block');
    expect(document.getElementById('southForm').style.display).toBe('none');
    expect(document.getElementById('eastForm').style.display).toBe('none');
    expect(document.getElementById('westForm').style.display).toBe('none');
});

test('removes active class from all buttons and adds it to the selected direction button', () => {
    // Add active class to all buttons to begin with, to test that selecting one direction successfully makes all other directions inactive
    const buttons = ['northButton', 'southButton', 'eastButton', 'westButton'];
    buttons.forEach(btn => {
    document.getElementById(btn).classList.add('active');
    });
    //Test the impact of pressing the east arm button of the Create New Junction form
    showDirectionForm('east');

    expect(document.getElementById('eastButton').classList.contains('active')).toBe(true);
    expect(document.getElementById('northButton').classList.contains('active')).toBe(false);
    expect(document.getElementById('southButton').classList.contains('active')).toBe(false);
    expect(document.getElementById('westButton').classList.contains('active')).toBe(false);
});
//This tests, for every direction, that at least that direction is active and its form is displayed.
test('Has the intended effect for each direction', () => {
    ['north', 'south', 'east', 'west'].forEach(direction => {
    showDirectionForm(direction);
    
    expect(document.getElementById(direction + 'Form').style.display).toBe('block');
    expect(document.getElementById(direction + 'Button').classList.contains('active')).toBe(true);
    });
});
});


// Now we will test the northPedestrianToggle function. We can assume that if its tests pass, then all pedestrian toggle functions will pass.
const { northPedestrianToggle } = require('../static/CreateNewsetScript.js');

describe('northPedestrianToggle', () => {
  
    beforeEach(() => {
      // Resets the elements to their default states to remove any changes that have occured
      const checkbox = document.getElementById("northPedestrianCheckbox");
      const textbox = document.getElementById("northPedestrian");
      const label = document.getElementById("northPedestrianLabel");
      
      checkbox.checked = false;
      textbox.style.display = "none";
      label.style.display = "none";
      textbox.removeAttribute("pattern");
    });
    
    test('shows textbox and label when checkbox is checked', () => {
      // So, here we simulate checking the north pedestrian checkbox.
      const checkbox = document.getElementById("northPedestrianCheckbox");
      checkbox.checked = true;
      
      // Checking the north pedestrian checkbox would call the northPedestrianToggle function, so we must manually do this here
      northPedestrianToggle();
      
      // Check that textbox and label that are associated with the checkbox are displayed
      const textbox = document.getElementById("northPedestrian");
      const label = document.getElementById("northPedestrianLabel");
      
      expect(textbox.style.display).toBe("inline-block");
      expect(label.style.display).toBe("inline-block");
      expect(textbox.getAttribute("pattern")).toBe("^[0-9]+(\.[0-9]{1})?$");
    });
    
    test('hides textbox and label when checkbox is unchecked', () => {
      // Make elements visible to ensure that unchecking the textbox successfully hides them
      const textbox = document.getElementById("northPedestrian");
      const label = document.getElementById("northPedestrianLabel");
      textbox.style.display = "inline-block";
      label.style.display = "inline-block";
      textbox.setAttribute("pattern", "^[0-9]+(\.[0-9]{1})?$");
      
      // Simulates unchecking the north pedestrian checkbox
      const checkbox = document.getElementById("northPedestrianCheckbox");
      checkbox.checked = false;
      
      //Just like with checking the checkbox, unchecking also results in calling the northPedestrianToggle, so we must do this manually
      northPedestrianToggle();
      
      // Check that textbox and label are successfully hidden after calling northPedestrianToggle
      expect(textbox.style.display).toBe("none");
      expect(label.style.display).toBe("none");
      expect(textbox.getAttribute("pattern")).toBeNull();
    });
  });