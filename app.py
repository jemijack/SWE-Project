from flask import Flask, render_template, request, jsonify, session
from database import initialiseDatabase, insertUser, insertJunction
from database.Objects import VPHObject, ConfigurationObject
import logging
from datetime import datetime, timezone
from os import urandom

app = Flask(__name__)
app.secret_key = urandom(32)

# Route for the login page, which will be the start page. Note that dropping the methods parameter means only GET requests will be read, by default
@app.route("/")
def login():
    # Displays the login page at the specified url, i.e /
    return render_template("LoginPage.html")   

# Route to the junction set design page from the home page
@app.route("/setform")
def setForm():
    # Displays the junction set design page at the specified url, i.e setform
    return render_template("CreateNewSet.html")

# Route to get back to the home page from the junction set creation page
@app.route("/home")
def setFormToHome():
    # Displays the home page at the url /home
    return render_template("HomePage.html")


# Route to handle login. Takes user to the home page
@app.route("/home", methods=["POST"])
def loginToHome():
    # Get the username provided by the user
    username = request.form.get("username")
    uid = insertUser(username)
    if uid is None:
        return jsonify({"error": f"Unable to generate a uid for the username {username}"}), 500

    logging.info(f"The User ID for this session is: {uid}")
    session["uid"] = uid
    # Displays the create new set form page at the specified url
    return render_template("HomePage.html")  


@app.route('/save_junction', methods=['POST']) # The endpoint matches the figma button. This is when the user has finished designing their junction and wants to create a new one. 
def save_junction(): 
    data = request.get_json() # get JSON from frontend 
    print("Recieved JSON:", data) # print statement  because idk what to do with the data for now. mb connect to the database?? 
    return jsonify({"message": "Data received!", "data" : data}) #send back a responce so that i know that backend and front end can talk to eachother. 


# Route to handle the form submission (POST request)
@app.route("/junctionform", methods=["POST"])
def junctionForm():
    # # Get the form data
    # junctionSetName = request.form.get("junctionSetName")
    # northVehiclesIn = request.form.get("northVehiclesIn")
    # # Checks to see whether there is a pedestrian crossing for each direction, and stores the yes/no value in the variable for each direction. yes = 1, no = 0.
    # northPedestrian = request.form.get("northPedestrian")
    # southPedestrian = request.form.get("southPedestrian")
    # eastPedestrian = request.form.get("eastPedestrian")
    # westPedestrian = request.form.get("westPedestrian")
    # # Gets the duration of the pedestrian crossings in seconds
    # crossingDuration = request.form.get("crossingDuration")

    # if northPedestrian is None:
    #     northPedestrian = 0

    # if southPedestrian is None:
    #     southPedestrian = 0

    # if eastPedestrian is None:
    #     eastPedestrian = 0

    # if westPedestrian is None:
    #     westPedestrian = 0

    # # Finds how many pedestrians are coming from each direction, and if there is no crossing, then we will set the number to -1 to differentiate between cases where we have 0 pedestrians. If a checkbox is unchecked, then the corresponding request frequency textbox will have a None value in Flask 
    # northRequestFrequency = request.form.get("northRequestFrequency")
    # southRequestFrequency = request.form.get("southRequestFrequency")
    # eastRequestFrequency = request.form.get("eastRequestFrequency")
    # westRequestFrequency = request.form.get("westRequestFrequency")

    # if northPedestrian == 0:
    #     northRequestFrequency = -1
    
    # if southPedestrian == 0:
    #     southRequestFrequency = -1

    # if eastPedestrian == 0:
    #     eastRequestFrequency = -1

    # if westPedestrian == 0:
    #     westRequestFrequency = -1

    # print(northRequestFrequency)
    # print(southRequestFrequency)
    # print(eastRequestFrequency)
    # print(westRequestFrequency)

    # averageWaitPriority = request.form.get("AverageWait")
    # maximumWaitPriority = request.form.get("MaxWait")
    # maximumQueuePriority = request.form.get("MaxQueue")

    # print(averageWaitPriority)
    # print(maximumQueuePriority)
    # print(maximumWaitPriority)

    # Extract all of the form data into a dictionary
    form_data = {
        "JName": request.form.get("junctionSetName"),
        "priorities": {
            "averageWaitPriority": request.form.get("AverageWait"),
            "maximumWaitPriority": request.form.get("MaxWait"),
            "maximumQueuePriority": request.form.get("MaxQueue")
        },
        "trafficFlows": {
            "north": {
                "totalVph": request.form.get("northVehiclesIn"),
                "exitingVPH": {
                    "east": request.form.get("northLeftOut"),
                    "south": request.form.get("northStraightOut"),
                    "west": request.form.get("northRightOut")
                },
                "vehicleSplit": {
                    "bus": request.form.get("northBusPercentage"),
                    "cycle": request.form.get("northCyclePercentage"),
                    "car": request.form.get("northCarPercentage")
                },
                "priority": request.form.get("northPriority")
            },
            "east": {
                "totalVPH": request.form.get("eastVehiclesIn"),
                "exitingVPH": {
                    "north": request.form.get("eastRightOut"),
                    "south": request.form.get("eastLeftOut"),
                    "west": request.form.get("eastStraightOut"),
                },
                "vehicleSplit": {
                    "carPercentage": request.form.get("eastCarPercentage"),
                    "busPercentage": request.form.get("eastBusPercentage"),
                    "cyclePercentage": request.form.get("eastCyclePercentage")
                },
                "priority": request.form.get("eastPriority")
            },
            "south": {
                "totalVPH": request.form.get("southVehiclesIn"),
                "exitingVPH": {
                    "north": request.form.get("southStraightOut"),
                    "east": request.form.get("southRightOut"),
                    "west": request.form.get("southLeftOut")
                },
                "vehicleSplit": {
                    "carPercentage": request.form.get("southCarPercentage"),
                    "busPercentage": request.form.get("southBusPercentage"),
                    "cyclePercentage": request.form.get("southCyclePercentage")
                },
                "priority": request.form.get("southPriority")
            },
            "west": {
                "totalVPH": request.form.get("westVehiclesIn"),
                "exitingVPH": {
                    "leftOut": request.form.get("westLeftOut"),
                    "straightOut": request.form.get("westStraightOut"),
                    "rightOut": request.form.get("westRightOut")
                },
                "vehicleSplit": {
                    "carPercentage": request.form.get("westCarPercentage"),
                    "busPercentage": request.form.get("westBusPercentage"),
                    "cyclePercentage": request.form.get("westCyclePercentage")
                },
                "priority": request.form.get("westPriority")
            }
        },
        "pedestrianData": {
            "crossingDuration": request.form.get("crossingDuration"),
            "hasCrossing": {
                "north": request.form.get("northPedestrian"),
                "east": request.form.get("eastPedestrian"),
                "south": request.form.get("southPedestrian"),
                "west": request.form.get("westPedestrian"),
            },
            "rph": {
                "north": request.form.get("northRequestFrequency"),
                "east": request.form.get("eastRequestFrequency"),
                "south": request.form.get("southRequestFrequency"),
                "west": request.form.get("westRequestFrequency")
            }
        }
    }

    # Add the timeststamp field
    form_data["timestamp"] = datetime.now(timezone.utc)

    # Add the uid field
    form_data["userId"] = session.get("uid")

    # Make a VPHObject
    vphObject = VPHObject(json=form_data)
    success = vphObject.populateFields()

    # If the VPHObject contains the necessary information, insert it into the database
    if success:
        # Converts the dictionary to a JSON string, indent for readibility
        # json_data = json.dumps(vphObject.json, indent=4)
        # print(json_data)
        jid = insertJunction(vphObject)
        if jid is not None:
            session["jid"] = jid
            return jsonify({
                "jid": jid,
                "message": "Junction Ready"
            }), 201
        else:
            return jsonify({"error": "Junction insertion failed"}), 500
    else:
        return jsonify({"error": "VPHObject is missing some key details"}), 400

    #return render_template("LayoutDesignPage.html")


if __name__ == "__main__":
    app.run(debug=True)
    initialiseDatabase()
