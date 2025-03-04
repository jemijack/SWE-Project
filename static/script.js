
// Used to keep track of the number of times the user creates a layout for the jucntion set
// They will be allowed to create up to a maximum of 4
let submissionCount = 0;

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

     // validation just allow numbers, letters and spaces
     if (!/^[a-zA-Z0-9\s]+$/.test(nameInput)) {
        alert("Junction name can only contain letters, numbers, and spaces.");
        document.getElementById("junctionName").value = layoutData["jLayoutName"]; // Revert to previous valid name
        return;
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
 
 // just checking that lane count actually updates. 
 console.log("LaneCount", laneCount); 

// LaneCount of Bassils code gets updated to match mine :) 
 layoutData[currentDirection].laneCount = laneCount;

 console.log("test", layoutData[currentDirection].laneCount); 

    // Re-render the SVG
    redrawJunction();

   // Regenerate lane buttons dynamically
   generateLaneButtons(laneCount);


});

// Listen for changes on pedistrian crossing
document.getElementById("pedestrian").addEventListener("change", function() {
    
    // update if changed
    layoutData[currentDirection].pedestrianCrossing = this.checked;

    // redraw to show new visuialisation
    redrawJunction();

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


// lane validation
function validateLaneSettings(laneData) {
    if (!laneData) {
        alert("Each lane must have a selected direction.");
        return false;
    }
    return true;
}


function validateDirectionSettings(direction){

    let laneDetail = layoutData[direction].laneDetail;
    let laneKeys = Object.keys(laneDetail); 
    
    // Ensure that if there's only one lane, it must be "anyDirs"
    if (laneKeys.length === 1 && laneDetail["lane1"] !== "anyDirs") {
        alert("If there is only one lane, it must allow any direction.");
        return false;
    }

    return true;
}

//HTML menu customistations per lane. We want lane1 to ahve the option of being a bus or cycle lanes. We dont want that option to show up else where. 

function updateLaneOptions() {
    let dropdown = document.getElementById("directionOptions");
    let specialOptions = dropdown.querySelectorAll(".special"); // Bus & Cycle options

    if (currentLane === 0) {
        // Lane 1 (Leftmost): Show Bus & Cycle options
        specialOptions.forEach(option => option.hidden = false);
    } else {
        // Other lanes: Hide Bus & Cycle options
        specialOptions.forEach(option => option.hidden = true);

        // If a hidden option was previously selected, reset the dropdown
        if (["bus", "cycle"].includes(dropdown.value)) {
            dropdown.value = "";
        }
    }
}


function redrawJunction() {
    d3.select("#junctionCanvas").selectAll("*").remove(); // Clear SVG
    /** 
    window.drawApproach_North(layoutData["northArm"].laneCount, "North");
    window.drawApproach_East(layoutData["eastArm"].laneCount, "East");
    window.drawApproach_South(layoutData["southArm"].laneCount, "South");
    window.drawApproach_West(layoutData["westArm"].laneCount, "West");
    */
   window.initializeJunction(layoutData);

   if (layoutData[currentDirection]?.pedestrianCrossing) {
    let totalLaneCount = layoutData[currentDirection]?.laneCount || 3; // Default to 3 lanes
    let laneWidth = 100; // Adjust based on your layout
    let innerX = 0, innerY = 0, innerWidth = 500, innerHeight = 500; //

// Call the function to draw pedestrian crossing
drawPedestrianCrossing(currentDirection, totalLaneCount, laneWidth, innerX, innerY, innerWidth, innerHeight);

   }
} 

// Call this function whenever you switch lanes
document.getElementById("directionOptions").addEventListener("change", function () {
    let selectedValue = this.value;
    
    // Save new selection
    let laneKey = `lane${currentLane + 1}`;
    layoutData[currentDirection].laneDetail[laneKey] = selectedValue;

    console.log(`Lane ${currentLane + 1} in ${currentDirection} updated to:`, selectedValue);
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
  
  //  Update the dropdown with the lane's stored value (or empty if none)
  document.getElementById("directionOptions").value = newLaneData || "";
  
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


 console.log(`Switched to ${direction}. Current state:`, layoutData[directionKey]);

 }
 
}

function submitData() { // refactor after switchDirection is done
    
    // save the current lanes's slection before submitting
    if (currentDirection && currentLane !== null) {
        let previousLaneKey = `lane${currentLane + 1}`;
        let selectDirection = document.getElementById("directionOptions").value;
        layoutData[currentDirection].laneDetail[previousLaneKey] = selectDirection;
    }

// make sure pedistian Crossing is saved without overwriting it. 
    if (currentDirection !== null) {
        layoutData[currentDirection].pedestrianCrossing = document.getElementById("pedestrian")?.checked || false;
    }

    // Debugging
    console.log("Sent data:", layoutData);


        fetch('/save_junction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(layoutData) 
        })
        .then(response => response.json()) // Now expects JSON
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response;
        })
        .then(data => {
            console.log("Response from backend:", data);
        })
        .catch(error => console.error('Error:', error));

        // If the user has created all 4 junctions, redirect them
        submissionCount++;
        console.log(submissionCount)
        if (submissionCount >= 4) {
            window.location.href = '/comparison_page';
        }
 }


//update slider value display 
document.getElementById("lanes").oninput = function() {
    document.getElementById("lanesValue").innerText = this.value;

}; 
