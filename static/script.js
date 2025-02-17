// TO DO: ADD Junction set
// Make save button appea only when all sets are done 
//Go back to last active junction when we hot teh previous lane. 


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

// updates settinsg for each lane within a direction (look at the JSON  structure at the begining)
function switchLane(laneIndex){
   
// save current lane data before switching
    if (currentLane !== null ) {
        junctionData[currentDirection].lanes[currentLane] = {
            ...junctionData[currentDirection].lanes[currentLane],
            leftTurnOnly: document.getElementById("leftTurnOnly")?.checked || false,
            rightTurnOnly: document.getElementById("rightTurnOnly")?.checked || false,
            leftStraight: document.getElementById("leftStraight")?.checked || false,
            rightStraight: document.getElementById("rightStraight")?.checked || false,
            anyDirection:  document.getElementById("anyDirection")?.checked || false, 
            bus: document.getElementById("busLane")?.checked || false,
            cycle: document.getElementById("cycleLane")?.checked || false
        };
    }     
       
    // switch to the new lane 
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
 
 let laneData = junctionData[currentDirection].lanes[currentLane];

    resetLaneUI()

    // now load correct values
    document.getElementById("leftTurnOnly").checked = laneData.leftTurnOnly;
    document.getElementById("rightTurnOnly").checked = laneData.rightTurnOnly;
    document.getElementById("leftStraight").checked = laneData.leftStraight;
    document.getElementById("rightStraight").checked = laneData.rightStraight;
    document.getElementById("anyDirection").checked = laneData.anyDirection;
    document.getElementById("busLane").checked = laneData.bus;
    document.getElementById("cycleLane").checked = laneData.cycle;

    // debugging 
    console.log(`Switched to Lane ${laneIndex + 1}`, laneData);

}


// switches between different junction direction (N,E,S,W) and loads their settings into form
 function switchDirection(direction) {
   
 // save current lane settings before switching direction
 if (currentDirection !== null && currentLane !== null) {
    junctionData[currentDirection].lanes[currentLane] = {
        ...junctionData[currentDirection].lanes[currentLane],
        leftTurnOnly: document.getElementById("leftTurnOnly")?.checked || false,
        rightTurnOnly: document.getElementById("rightTurnOnly")?.checked || false,
        leftStraight: document.getElementById("leftStraight")?.checked || false,
        rightStraight: document.getElementById("rightStraight")?.checked || false,
        anyDirection: document.getElementById("anyDirection")?.checked || false,
        bus: document.getElementById("busLane")?.checked || false,
        cycle: document.getElementById("cycleLane")?.checked || false
    };
}

   // save current direction settings before switching
   if (currentDirection !== null ) {
    junctionData[currentDirection] = {
        pedestrianCrossing: document.getElementById("pedestrian").checked
    }
}
   
    // switch to the new direction
    currentDirection = direction;
    console.log("Switched to ", currentDirection);
   

    // Get number of lanes safely. If the no. of lanes in  0 or undefined default to 3 lanes. 
    let numLanes = parseInt(junctionData[direction]?.lanes?.length) || 3; 

    // make sue the direction objects exists. 
    if (!junctionData[currentDirection]) {
        junctionData[currentDirection] = {
            pedestrianCrossing: false,
            lanes: []
        };
    }

   // Make sure all lanes exist
   if (!Array.isArray(junctionData[direction].lanes) || junctionData[direction].lanes.length !== numLanes) {
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

     resetLaneUI()
     // Generate buttons for each lane
     generateLaneButtons(numLanes);
 
     // Load first lane by default
     switchLane(0);

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
 
