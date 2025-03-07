// list of all parmeters in each direction. 
let layoutData = {
    "jLayoutName": "", // User enters this
    "timestamp": new Date().toISOString(),
    "userId": "11", // This come from other page
    "junctionID":"56", // This also comes from other page 

// we start by default with 3 lanes per direction. 
        "northArm": {
            "laneCount": 3,
            "pedestrianCrossing": false, 
            "laneDetail": {
                "lane1": "", //Empty at the start, user selects later. 
                "lane2": "",
                "lane3": ""
            },
        },
        "eastArm": {
            "laneCount": 3,
            "pedestrianCrossing": false, 
            "laneDetail": {
                "lane1": "",
                "lane2": "",
                "lane3": ""
            },
        },
        "southArm": {
            "laneCount": 3,
            "pedestrianCrossing": false, 
            "laneDetail": {
                "lane1": "",
                "lane2": "",
                "lane3": "",
            },
        },
        "westArm": {
            "laneCount": 3,
            "pedestrianCrossing": false, 
            "laneDetail": {
                "lane1": "",
                "lane2": "",
                "lane3": ""
            },
        },
}


//Set up the defaults
let  currentDirection = "northArm"; 
let currentLane = 0;


function updateJunctionName() {
    let nameInput = document.getElementById("junctionName").value.trim(); 

    // Check for empty input
    if (nameInput !== "") {
     // validation just allow numbers, letters and spaces
     if (!/^[a-zA-Z0-9\s]+$/.test(nameInput)) {
        alert(" Junction name can only contain letters, numbers, and spaces.");
        document.getElementById("junctionName").value = layoutData["jLayoutName"]; // Revert to previous valid name
        return;
    }
} 
    // Save the junction name
    layoutData["jLayoutName"] = nameInput;


}

// make sure the name updated is stored when changed
document.getElementById("junctionName").addEventListener("input", updateJunctionName)

// Make sure that junction  loads the stored name when we swicth direction
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("junctionName").value = layoutData["jLayoutName"];
})


// This loads the 3 lanes buttons on first load. 
document.addEventListener("DOMContentLoaded", function(){
   
   
     // Ensure North has at least 3 lanes becuase its the first direction that loads and therefore it itrs not covered by the switchLane function
      if (!layoutData["northArm"].laneDetail || Object.keys(layoutData["northArm"].laneDetail).length === 0) {
        layoutData["northArm"].laneDetail = {}; // Initialize as an empty object
        for (let i = 1; i <= 3; i++) {
            layoutData["northArm"].laneDetail[`lane${i}`] = ""; // Default empty string
        }
    }
   
    document.getElementById("lanes").value = 3; 
    generateLaneButtons(3);
    redrawJunction();
 

}) 



// Event listener for the slider so it dynaically adjusts laneDetail
document.getElementById("lanes").addEventListener("input", function(){

    let laneCount = parseInt(this.value) || 3 //  default value of  the slider is 3 

    let directionKey = currentDirection; // Ensure it's correctly named
    if (!layoutData[directionKey]) {
        layoutData[directionKey] = { laneCount: 3, pedestrianCrossing: false, laneDetail: {} };
    }

     // we need to add new lanes (like lane4 and lane5) or removing lanes of yhe suer reduces the count. 
     
    // Ensure `laneDetail` exists
    if (!layoutData[currentDirection].laneDetail) {
        layoutData[currentDirection].laneDetail = {};
    }

    // Update `laneDetail` dynamically to match `numLanes`
    let laneKeys = Object.keys(layoutData[currentDirection].laneDetail);

    // Add missing lanes
    for (let i = 1; i <= laneCount; i++) {
        if (!laneKeys.includes(`lane${i}`)) {
            layoutData[currentDirection].laneDetail[`lane${i}`] = "";
        }
    }

    // Remove extra lanes if the user decreases the number
    for (let i = laneKeys.length; i > laneCount; i--) {
        delete layoutData[currentDirection].laneDetail[`lane${i}`];
    }

 layoutData[currentDirection].laneCount = Object.keys(layoutData[currentDirection].laneDetail).length;
 
// LaneCount of Bassils code gets updated to match mine :) 
 layoutData[currentDirection].laneCount = laneCount;

    // Re-render the SVG
    redrawJunction();

   // Regenerate lane buttons dynamically
   generateLaneButtons(laneCount);


});



 document.addEventListener("DOMContentLoaded", function () {
    let dropdown = document.getElementById("directionOptions");

   updateLaneOptions(); 
    
    if (dropdown) {
        dropdown.addEventListener("change", function () {
            let selectedValue = this.value;

            // Validate lane selection
            if (!validateLaneSettings(selectedValue)) {
                this.value = ""; // Reset dropdown if validation fails
            } 

            // Save selection into layoutData
            let laneKey = `lane${currentLane + 1}`;
            layoutData[currentDirection].laneDetail[laneKey] = selectedValue;

            console.log(`Lane ${currentLane + 1} in ${currentDirection} updated to:`, selectedValue);
        });
    }
}); 

// Listen for changes on pedistrian crossing
document.getElementById("pedestrian").addEventListener("change", function() {
    
    // update if changed
    layoutData[currentDirection].pedestrianCrossing = this.checked;

    // redraw to show new visuialisation
    redrawJunction();

});

// Creates the corrent numbe of buttons every time the numbe of lanes changes. 
function generateLaneButtons(laneCount) {
    let container = document.getElementById("laneMenu"); 
    container.innerHTML = ""; // Clear existing buttons

    for (let i = 0; i < laneCount; i++) {
        let button = document.createElement("button");
        button.innerText = `Lane ${i + 1}`;
        button.onclick = () => switchLane(i);
        container.appendChild(button);
    }

}

function resetDropdown() {
    document.getElementById("directionOptions").value = "";
}


/*  lane validation . Here we're also gonna make sure that we cant create any stupid configuations.
  Right/rightStraight lanes cannot be to the left of left/leftStraight lanes. 
  Left/leftStraight lanes cannot be to the right of right/rightStraight lanes.

*/ 

function validateLaneSettings() {
    
     // get the current direction's lane details and sort the lanes by there number 
     const laneDetail = layoutData[currentDirection].laneDetail;
     const laneKeys = Object.keys(laneDetail).sort((a, b) => {
         return parseInt(a.replace('lane', '')) - parseInt(b.replace('lane', ''));
     });

    let rightmostLeftTurn = -1;
    let leftmostRightTurn = Number.MAX_SAFE_INTEGER;

    // scan all lanes to find the rightmost left turn and leftmost right turn
    laneKeys.forEach((key, index) => {
        const laneType = laneDetail[key];
        
        if (!laneType) return;
        
        if (laneType === 'leftOnly' || laneType === 'leftStraight') {
            rightmostLeftTurn = Math.max(rightmostLeftTurn, index);
        }
        
        if (laneType === 'rightOnly' || laneType === 'rightStraight') {
            leftmostRightTurn = Math.min(leftmostRightTurn, index);
        }
    });

 // validate: Right turns should always be to the right of left turns
 if (rightmostLeftTurn >= leftmostRightTurn && leftmostRightTurn < Number.MAX_SAFE_INTEGER) {
    return {
        valid: false,
        message: "Invalid lane configuration: Left turning lanes must be to the left of right turning lanes to prevent traffic crossing."
    };
}

return { valid: true };

}

// function to validate a specific lane
function validateLaneChange(laneIndex, newLaneType) {

    const tempLayoutData = JSON.parse(JSON.stringify(layoutData));
    const laneKey = `lane${laneIndex + 1}`;
    
    tempLayoutData[currentDirection].laneDetail[laneKey] = newLaneType;
    const originalValue = layoutData[currentDirection].laneDetail[laneKey];
    layoutData[currentDirection].laneDetail[laneKey] = newLaneType;
    const result = validateLaneSettings();
    layoutData[currentDirection].laneDetail[laneKey] = originalValue;
    
    return result;
}

function validateDirectionSettings(direction){

    let laneDetail = layoutData[direction].laneDetail;
    let laneKeys = Object.keys(laneDetail); 
    
   
    return true;
}

//HTML menu customistations per lane. We want lane1 to ahve the option of being a bus or cycle lanes. We dont want that option to show up else where. 

function updateLaneOptions() {
    let dropdown = document.getElementById("directionOptions");
    let specialOptions = dropdown.querySelectorAll(".special"); // Bus & Cycle options

    if (currentLane === 0) {
        // lane 1- Show Bus & Cycle options
        specialOptions.forEach(option => option.hidden = false);
    } else {
        // other lanes: Hide Bus & Cycle options
        specialOptions.forEach(option => option.hidden = true);

        // if a hidden option was previously selected, reset the dropdown
        if (["busLane", "cycleLane"].includes(dropdown.value)) {
            dropdown.value = "";
        }
    }
}



function redrawJunction() {
    d3.select("#junctionCanvas").selectAll("*").remove(); // Clear SVG
   
   window.initializeJunction(layoutData);

}

// reset everything to its defult state
function resetLayoutForm() {
    // Reset junction name
    document.getElementById("junctionName").value = "";
    layoutData["jLayoutName"] = "";

    // Reset lane count to default
    document.getElementById("lanes").value = 3;
    document.getElementById("lanesValue").innerText = 3;

    // Reset pedestrian crossing
    document.getElementById("pedestrian").checked = false;

    // Reset all directions to default state
    const directions = ["northArm", "eastArm", "southArm", "westArm"];
    directions.forEach(direction => {
        layoutData[direction] = {
            laneCount: 3,
            pedestrianCrossing: false,
            laneDetail: {
                "lane1": "",
                "lane2": "",
                "lane3": ""
            }
        };
    });

    // Reset current direction and lane
    currentDirection = "northArm";
    currentLane = 0;

    // Reset dropdown and generate lane buttons for north arm
    document.getElementById("directionOptions").value = "";
    generateLaneButtons(3);
    updateLaneOptions();

    // Redraw junction
    redrawJunction();
}


// Call this function whenever you switch lanes
 /* document.getElementById("directionOptions").addEventListener("change", function () {
    let selectedValue = this.value;
    
    // temporarliry check if the user is not creating a stupid junction w their  new selection
    const validationResult = validateLaneChange(currentLane, selectedValue);
    
    // warn them if they are
    if (!validationResult.valid) {
        alert(validationResult.message);

        // reset to the prev value if they are
        const laneKey = `lane${currentLane + 1}`;
        this.value = layoutData[currentDirection].laneDetail[laneKey] || "";
        return;
    }

    // Save new selection only if validation passes
    let laneKey = `lane${currentLane + 1}`;
    layoutData[currentDirection].laneDetail[laneKey] = selectedValue;

    console.log(`Lane ${currentLane + 1} in ${currentDirection} updated to:`, selectedValue);

    //redraw juction to show the changes
    redrawJunction();

}); */

document.addEventListener("DOMContentLoaded", function() {
    let dropdown = document.getElementById("directionOptions");
    
    // Make sure we update lane options when the page loads
    updateLaneOptions();
    
    if (dropdown) {
        dropdown.addEventListener("change", function() {
            let selectedValue = this.value;
            
            // Validate the lane configuration with this new selection
            const validationResult = validateLaneChange(currentLane, selectedValue);
            
            if (!validationResult.valid) {
                // Alert the user and revert the selection
                alert(validationResult.message);
                
                // Reset dropdown to the previously valid value
                const laneKey = `lane${currentLane + 1}`;
                this.value = layoutData[currentDirection].laneDetail[laneKey] || "";
                return;
            }
            
            // Save the selection only if validation passes
            let laneKey = `lane${currentLane + 1}`;
            layoutData[currentDirection].laneDetail[laneKey] = selectedValue;
            
            console.log(`Lane ${currentLane + 1} in ${currentDirection} updated to:`, selectedValue);
            
            // Redraw junction to show the changes
            //redrawJunction();
        });
    }
});

// updates settinsg for each lane within a direction (look at the JSON  structure at the begining)
function switchLane(laneIndex){
  
    // Convert laneIndex into the key
  let laneKey = `lane${laneIndex + 1}`;
    
  // Ensure current direction is valid
  if (!layoutData[currentDirection]) {
      layoutData[currentDirection] = { laneCount: 3, pedestrianCrossing: false, laneDetail: {} };
  }
  
  if (!layoutData[currentDirection].laneDetail) {
      layoutData[currentDirection].laneDetail = {};
  }
  
  //  save current lane selection before doing anything else
  if (currentLane !== null) {
      let previousLaneKey = `lane${currentLane + 1}`;
      let currentSelection = document.getElementById("directionOptions").value;
      layoutData[currentDirection].laneDetail[previousLaneKey] = currentSelection;
  }
  
  //  switch to the new lane
  currentLane = laneIndex;
  
  // ensure the new lane exists in data structure
  if (!layoutData[currentDirection].laneDetail[laneKey]) {
      layoutData[currentDirection].laneDetail[laneKey] = "";
  }
  
// Call updateLaneOptions() when switching lanes
    updateLaneOptions();

  //  Reset UI before loading new data
  resetDropdown();

  
  // Load the new lane's data
  let newLaneData = layoutData[currentDirection].laneDetail[laneKey];
  
  //  Update the dropdown with the lane's stored value 
  document.getElementById("directionOptions").value = newLaneData 

  console.log(`Switched to Lane ${laneIndex + 1} in ${currentDirection}:`, newLaneData);   

}

// switches between different junction direction (N,E,S,W) and loads their settings into form
 function switchDirection(direction) {

    let directionKey = direction.toLowerCase() + "Arm"; 
       
    // Validate the current direction **before switching**
       if (!validateDirectionSettings(currentDirection)) {
        return; 
    }
    
 // save the current lane’s selection before switching
 if (currentDirection && currentLane !== null) {
    let previousLaneKey = `lane${currentLane + 1}`;
    let selectDirection = document.getElementById("directionOptions").value;
    layoutData[currentDirection].laneDetail[previousLaneKey] = selectDirection;
}

// Save pedestrian crossing setting
if (currentDirection) {
    layoutData[currentDirection].pedestrianCrossing = document.getElementById("pedestrian").checked;
}

    // Switch to the new direction
    currentDirection = directionKey;
    console.log("Switched to ", directionKey);

   // Get number of lanes in the new direction (default to 3 if not set)
   let laneCount;
   if (layoutData[directionKey].laneDetail) {
       laneCount = Object.keys(layoutData[directionKey].laneDetail).length || 3;
   } else {
       laneCount = 3;
       layoutData[directionKey].laneDetail = {};
   }


    // ensure all lanes exist in `laneDetail` (initialize missing lanes)
    for (let i = 1; i <= laneCount; i++) {
        let laneKey = `lane${i}`;
        if (!layoutData[currentDirection].laneDetail[laneKey]) {
            layoutData[currentDirection].laneDetail[laneKey] = ""; // Default empty string
        }
    }

  // update UI values
  document.getElementById("lanes").value = laneCount;
  document.getElementById("lanesValue").innerText = laneCount;
  document.getElementById("pedestrian").checked = layoutData[directionKey].pedestrianCrossing;

  // generate buttons for each lane
  generateLaneButtons(laneCount);


  
  // switch to the first lane and reset UI
  currentLane = 0;
  resetDropdown();


 //make sure that the drop down updates 
  updateLaneOptions();
 
  let firstLaneData = layoutData[currentDirection].laneDetail["lane1"];
    if (firstLaneData && firstLaneData.trim()) {
        document.getElementById("directionOptions").value = firstLaneData;
    } else {
        // This ensures dropdown shows default text
        document.getElementById("directionOptions").value = "";

    //redrawJunction();

 console.log(`Switched to ${direction}. Current state:`, layoutData[directionKey]);

 }
 
}

let submittedLayouts = 0;  
function submitData() {
    // Check if junction name is empty
    if (!layoutData["jLayoutName"] || layoutData["jLayoutName"].trim() === "") {
        alert("Junction name cannot be empty. Please enter a valid name before submitting.");
        return;
    }

    // Save the current lane's selection before submitting
    if (currentDirection && currentLane !== null) {
        let previousLaneKey = `lane${currentLane + 1}`;
        let selectDirection = document.getElementById("directionOptions").value;
        layoutData[currentDirection].laneDetail[previousLaneKey] = selectDirection;
    }

    // Make sure pedestrian crossing is saved without overwriting it
    if (currentDirection !== null) {
        layoutData[currentDirection].pedestrianCrossing = document.getElementById("pedestrian")?.checked || false;
    }

    // Validate all lanes in all directions
    const directions = ["northArm", "eastArm", "southArm", "westArm"];
    for (const direction of directions) {
        const laneDetail = layoutData[direction].laneDetail;
        for (const laneKey in laneDetail) {
            if (laneDetail[laneKey] === "") {
                alert(`Please select a lane type for ${laneKey} in ${direction.replace("Arm", "")}.`);

                // Switch to the problematic direction and lane
                const directionName = direction.replace("Arm", "");
                switchDirection(directionName.charAt(0).toUpperCase() + directionName.slice(1));
                switchLane(parseInt(laneKey.replace("lane", "")) - 1);

                return; // Prevent submission
            }
        }
    }

    // Debugging: Log the data being sent
    console.log("Sent data:", layoutData);

   
    fetch('/save_junction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layoutData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Response from backend:", data);

        // Update the global submittedLayouts variable
        submittedLayouts = data.submissionCount || 0;
        console.log("Submission count:", submittedLayouts); // Debugging

        // Update button visibility and state
        const compareButton = document.getElementById("compareButton");
        if (submittedLayouts >= 2) {
            compareButton.style.display = "block"; // Show the button
            compareButton.disabled = false; // Enable the button
        } else if (submittedLayouts === 1) {
            compareButton.style.display = "block"; // Show the button
            compareButton.disabled = true; // Disable the button
        } else {
            compareButton.style.display = "none"; // Hide the button
        }

        // Redirect to comparison page if 4 layouts submitted
        if (data.redirect) {
            window.location.href = data.redirect;
            return;
        }

        
        // Display submission count message
        alert(`Layout ${submittedLayouts}/4 submitted!`);

        // Reset the form and UI for the next layout
        resetLayoutForm();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while submitting the layout. Please try again.');
    });
}



// Update slider value display
document.getElementById("lanes").oninput = function() {
    document.getElementById("lanesValue").innerText = this.value;
};

document.addEventListener("DOMContentLoaded", function () {
    const compareButton = document.getElementById("compareButton");
    if (submittedLayouts >= 2) {
        compareButton.style.display = "block"; // Show the button
        compareButton.disabled = false; // Enable the button
    } else if (submittedLayouts === 1) {
        compareButton.style.display = "block"; // Show the button
        compareButton.disabled = true; // Disable the button
    } else {
        compareButton.style.display = "none"; // Hide the button
    }
});



//update slider value display 
document.getElementById("lanes").oninput = function() {
    document.getElementById("lanesValue").innerText = this.value;

}; 



// Add event listener for the "Compare My Layouts" button and handle its visibility
document.addEventListener("DOMContentLoaded", function () {
    const compareButton = document.getElementById("compareButton");
    let storedLayouts = localStorage.getItem("submittedLayouts");
    
    // Only show compare button if between 2 and 3 layouts
    if (storedLayouts && parseInt(storedLayouts) >= 2 && parseInt(storedLayouts) < 4) {
        compareButton.style.display = "block";
    } else {
        compareButton.style.display = "none";
    }
});