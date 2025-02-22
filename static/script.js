// TO DO 22/2/2025: 
// integration with junction image. 
// test cases to write 
// CSS to write

// list of all parmeters in each direction. 
let junctionData = {
    "North": {
        "lanes": [], // 11/02/2025 Making lane creating dynamic so we need to edit the JSON so lanes is an empty array. 
        "pedestrianCrossing": false
    }, 

    "East": {
        "lanes": [],
        "pedestrianCrossing": false
    }, 

    "South": {
        "lanes": [],
        "pedestrianCrossing": false
    }, 

    "West": {
        "lanes": [],
        "pedestrianCrossing": false
    }

};

//Set up th defaults
let junctionName =""; // Store this globally becuase its not part of the junctionData. 
let  currentDirection = "North"; 
let currentLane = 0; 



function updateJunctionName() {
    let nameInput = document.getElementById("junctionName").value.trim(); 

     // validation just allow numbers, letters and spaces
     if (!/^[a-zA-Z0-9\s]+$/.test(nameInput)) {
        alert("Junction name can only contain letters, numbers, and spaces.");
        document.getElementById("junctionName").value = junctionName; // Revert to previous valid name
        return;
    }

    // Save the junction name
    junctionName = nameInput;


}

// make sure the name is stored when changed
document.getElementById("junctionName").addEventListener("input", updateJunctionName)



// Make sure that junction  loads the stored name when we swicth direction
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("junctionName").value = junctionName;
})



// This loads the 3 lanes buttons first load. 
document.addEventListener("DOMContentLoaded", function(){
   
   
     // Ensure North has at least 3 lanes becuase its the first direction that loads and therefore it itrs not covered by the switchLane function
     if (!junctionData["North"].lanes || junctionData["North"].lanes.length === 0) {
        junctionData["North"].lanes = Array.from({ length: 3 }, () => ({
            leftTurnOnly: false,
            rightTurnOnly: false,
            leftStraight:  false,
            rightStraight:false,
            anyDirection: false,
            bus: false,
            cycle: false
        }));
    }
   

    document.getElementById("lanes").value = 3; 
    generateLaneButtons(3);

}) 

// Event listener for the slider so it adds the same number of lane arrays as the slider    
document.getElementById("lanes").addEventListener("input", function(){

    let numLanes  = parseInt(this.value) || 3 //  default value of  the slider is 3 

     // Ensure the lanes array matches the new lane count
     if (!Array.isArray(junctionData[currentDirection].lanes) || junctionData[currentDirection].lanes.length !== numLanes) {
        junctionData[currentDirection].lanes = Array.from({ length: numLanes }, () => ({
            leftTurnOnly: false,
            rightTurnOnly: false,
            leftStraight:  false,
            rightStraight:false,
            anyDirection: false,
            bus: false,
            cycle: false
        }));
    }

   // Regenerate lane buttons dynamically
   generateLaneButtons(numLanes);
  
});

// Creates the corrent numbe of buttons every time the numbe of lanes changes. 
function generateLaneButtons(numLanes) {
    let container = document.getElementById("laneMenu"); 
    container.innerHTML = ""; // Clear existing buttons

    for (let i = 0; i < numLanes; i++) {
        let button = document.createElement("button");
        button.innerText = `Lane ${i + 1}`;
        button.onclick = () => switchLane(i);
        container.appendChild(button);
    }

}

function resetLaneUI() {
    document.getElementById("leftTurnOnly").checked = false;
    document.getElementById("rightTurnOnly").checked = false;
    document.getElementById("leftStraight").checked = false;
    document.getElementById("rightStraight").checked = false;
    document.getElementById("anyDirection").checked = false;
    document.getElementById("busLane").checked = false;
    document.getElementById("cycleLane").checked = false;
}


// lane validation
function validateLaneSettings(laneData) {

//lane can't be both a bus lane and cycle lane at the same time
if (laneData.bus && laneData.cycle) {
    alert("A lane cannot be both a Bus Lane and a Cycle Lane.");
    return false;
}


// Only ONE of these should be true at a time:
let directionOptions = [
    laneData.leftTurnOnly, 
    laneData.rightTurnOnly, 
    laneData.leftStraight, 
    laneData.rightStraight, 
    laneData.anyDirection
];


let selectedCount = directionOptions.filter(option => option === true).length;

if (selectedCount > 1) {
    alert("A lane can only have one direction restriction: {Dedicated left lane, Dedicated right lane, Left Turn and Straight lane, Right Turn and Straight lane or Any Direction");
    return false;
}

//  if all validation is passed. This validation seems to be working fine. 
return true; 

} 

function validateDirectionSettings(direction){

    let lanes = junctionData[direction].lanes;


if (lanes.length === 1 && !lanes[0].anyDirection) {
    alert(" If there is only one lane in a direction then it must be an any direction lane.");
    return false;
}


// the only lane can't be both a bus lane and cycle lane at the same time
if (lanes[0].bus && lanes[0].cycle) {
    alert("A lane cannot be both a Bus Lane and a Cycle Lane.");
    return false;
}



// Can only have 1 lane of bus lane / cycle lane per direction. 

let busLaneCount = lanes.filter(lane => lane.bus).length;
let cycleLaneCount = lanes.filter(lane => lane.cycle).length;

if (busLaneCount > 1 || cycleLaneCount > 1)  {
    alert("A direction can only have one bus or cycle lane.");
    return false;
}


return true; 

}

// updates settinsg for each lane within a direction (look at the JSON  structure at the begining)
function switchLane(laneIndex){

    let currentLaneData = {
        leftTurnOnly: document.getElementById("leftTurnOnly")?.checked || false,
        rightTurnOnly: document.getElementById("rightTurnOnly")?.checked || false,
        leftStraight: document.getElementById("leftStraight")?.checked || false,
        rightStraight: document.getElementById("rightStraight")?.checked || false,
        anyDirection: document.getElementById("anyDirection")?.checked || false,
        bus: document.getElementById("busLane")?.checked || false,
        cycle: document.getElementById("cycleLane")?.checked || false
    };



// **Validate lane settings before switching**
  if (!validateLaneSettings(currentLaneData)) {
    return; // 
  }

  // Save current lane data before switching
junctionData[currentDirection].lanes[currentLane] = currentLaneData;

// Switch to the new lane
currentLane = laneIndex;


 // Ensure lanes exist
 if (!junctionData[currentDirection].lanes[currentLane]) {
    junctionData[currentDirection].lanes[currentLane] = {
        leftTurnOnly: false,
        rightTurnOnly: false,
        leftStraight: false, 
        rightStraight: false,
        anyDirection:false,
        bus: false,
        cycle: false
    };

 }
 
 let newLaneData = junctionData[currentDirection].lanes[currentLane];

    resetLaneUI()

    console.log(`Switching to Lane ${laneIndex + 1} in ${currentDirection}:`, newLaneData);

    // now load correct values
    document.getElementById("leftTurnOnly").checked = newLaneData.leftTurnOnly;
    document.getElementById("rightTurnOnly").checked = newLaneData.rightTurnOnly;
    document.getElementById("leftStraight").checked = newLaneData.leftStraight;
    document.getElementById("rightStraight").checked = newLaneData.rightStraight;
    document.getElementById("anyDirection").checked = newLaneData.anyDirection;
    document.getElementById("busLane").checked = newLaneData.bus;
    document.getElementById("cycleLane").checked = newLaneData.cycle;

    // debugging 
    console.log(`Switched to Lane ${laneIndex + 1}`, newLaneData);

}

// switches between different junction direction (N,E,S,W) and loads their settings into form
 function switchDirection(direction) {

 //  save current direction's settings
 if (currentDirection && currentLane !== null) {
    // Save current lane settings
    junctionData[currentDirection].lanes[currentLane] = {
        leftTurnOnly: document.getElementById("leftTurnOnly")?.checked || false,
        rightTurnOnly: document.getElementById("rightTurnOnly")?.checked || false,
        leftStraight: document.getElementById("leftStraight")?.checked || false,
        rightStraight: document.getElementById("rightStraight")?.checked || false,
        anyDirection: document.getElementById("anyDirection")?.checked || false,
        bus: document.getElementById("busLane")?.checked || false,
        cycle: document.getElementById("cycleLane")?.checked || false
    };

    // Save pedestrian crossing setting
    junctionData[currentDirection].pedestrianCrossing = document.getElementById("pedestrian").checked;
}


  // Validate direction settings **before switching**
  if (!validateDirectionSettings(currentDirection)) {
    return; //  Stop switching if validation fails
}

    // switch to the new direction
    currentDirection = direction;
    console.log("Switched to ", currentDirection);
   

  // Get number of lanes of the new direction  (default to 3 if not set)
  let numLanes = junctionData[direction].lanes.length || 3;


    // Initialise lanes if they don't exist
    if (junctionData[direction].lanes.length === 0) {
        junctionData[direction].lanes = Array.from({ length: numLanes }, () => ({
            leftTurnOnly: false,
            rightTurnOnly: false,
            leftStraight: false,
            rightStraight: false,
            anyDirection: false,
            bus: false,
            cycle: false
        }));
    }


     // Update UI values
     document.getElementById("lanes").value = numLanes;
     document.getElementById("lanesValue").innerText = numLanes;
     document.getElementById("pedestrian").checked = junctionData[direction].pedestrianCrossing;

   
     // Generate buttons for each lane
     generateLaneButtons(numLanes);
 

    // Switch to first lane and reset UI
    currentLane = 0;
    resetLaneUI();

       // Load the first lane's settings
       if (junctionData[direction].lanes[0]) {
        const laneData = junctionData[direction].lanes[0];
        document.getElementById("leftTurnOnly").checked = laneData.leftTurnOnly;
        document.getElementById("rightTurnOnly").checked = laneData.rightTurnOnly;
        document.getElementById("leftStraight").checked = laneData.leftStraight;
        document.getElementById("rightStraight").checked = laneData.rightStraight;
        document.getElementById("anyDirection").checked = laneData.anyDirection;
        document.getElementById("busLane").checked = laneData.bus;
        document.getElementById("cycleLane").checked = laneData.cycle;
    }

    console.log(`Switched to ${direction}. Current state:`, junctionData[direction]);
}
    


function submitData() {

    if (currentDirection !== null && currentLane !== null) {
        // Save the currently selected lane settings before submitting
        junctionData[currentDirection].lanes[currentLane] = {
            leftTurnOnly: document.getElementById("leftTurnOnly")?.checked || false,
            rightTurnOnly: document.getElementById("rightTurnOnly")?.checked || false,
            leftStraight: document.getElementById("leftStraight")?.checked || false,
            rightStraight: document.getElementById("rightStraight")?.checked || false, 
            anyDirection: document.getElementById("anyDirection")?.checked || false,    
            bus: document.getElementById("busLane")?.checked || false,
            cycle: document.getElementById("cycleLane")?.checked || false
        };
    }

    if (currentDirection !== null) {
        // Update the current direction settings without overwriting lanes
        junctionData[currentDirection] = {
            ...junctionData[currentDirection],
            pedestrianCrossing: document.getElementById("pedestrian")?.checked || false
        };
    }

// pass the junction name along with the submission data to the backend
    let submissionData = {
        junctionName: junctionName,
        junctionData: junctionData
    };

    // Debugging
    console.log("Sent data:", submissionData);


        fetch('/save_junction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(junctionData)
        })

        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        // debuging dont remove because at least I know that we are conncted to the backend!! 
        .then(data => console.log("Response from backend:", data))
        .catch(error => console.error('Error:', error));
 }


//Update slider value display 
document.getElementById("lanes").oninput = function() {
    document.getElementById("lanesValue").innerText = this.value;

}; 
 
