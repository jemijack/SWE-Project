from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import database
from database.Objects import VPHObject, LayoutObject
import logging
from datetime import datetime, timezone
import json
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
    uid = database.insertUser(username)
    if uid is None:
        return jsonify({"error": f"Unable to generate a uid for the username {username}"}), 500

    logging.info(f"The User ID for this session is: {uid}")
    session["uid"] = uid
    # Displays the create new set form page at the specified url
    return render_template("HomePage.html")  


@app.route('/save_junction', methods=['Get', 'POST']) # The endpoint matches the figma button. This is when the user has finished designing their junction and wants to create a new one. 
def save_junction(): 
    # data = request.get_json() # get JSON from frontend 
    # print("Recieved JSON:", data) # print statement  because idk what to do with the data for now. mb connect to the database?? 
    # return jsonify({"message": "Data received!", "data" : data}) #send back a responce so that i know that backend and front end can talk to eachother.
    
    # Get the JSON from the frontend and create it's database Object representation
    data = request.get_json()
    
    jid = session.get("jid")
    data["junctionID"] = jid
    print(json.dumps(obj=data, indent=4))
    confObject = LayoutObject(json=data)

    # If the confObject contains all necessary information, insert it into the database
    if confObject.populateFields():
        jlid = database.insertLayout(confObject)

        # jlid will be the id of the newly inserted junction layout if the query executes successfully
        if jlid is not None:
            logging.info(f"Layout for junction: {jid} inserted with jlid: {jlid}")

            # Store the currently desgined layouts in the session for later use
            jlids = session.get("jlids", [])
            
            # If this is the first configuration made in the session, it is the first configuration
            # made for that junction so it's JStateID should be set to "Not Started" instead of "New"
            if jlids == []:
                changed = database.updateState(id=jid, isJunction=True, stateID=2)  # JState 2 = NOT_STARTED
                if not changed:
                    logging.warning(f"Junction with jid: {jid} failed to update it's state to 'Not Started'")

            jlids.append(jlid)
            session["jlids"] = jlids
            logging.info(f"The jlids in the session are now: {jlids}")
            submissionCount = len(jlids)

            # The user will be allowed to create up to 4 layouts for the same junction
            # Once four have been created, start simulating them
            if submissionCount == 4:
                logging.info(f"The user has now submitted 4 layouts for junction: {jid}, with jlids {jlids}, simulation will begin")
            return jsonify({
                "status": "success",
                "message": "Layout saved with id: {jlid}",
                "submissionCount": submissionCount
            })
        
        else:
            logging.info(f"jlid = {jlid}")
            return jsonify({"error": f"Layout insertion for junction: {jid} failed"}), 500
    else:
        return jsonify({"error": "LayoutObject is missing some key details"}), 400


# Route to handle the form submission (POST request)
@app.route("/junctionform", methods=["POST"])
def junctionForm():
    # # Get the form data
    # junctionSetName = request.form.get("junctionSetName")
    # northVehiclesIn = request.form.get("northVehiclesIn")

    # Checks to see whether there is a pedestrian crossing for each direction, and stores the yes/no value in the variable for each direction. yes = 1, no = 0.
    northPedestrian = request.form.get("northPedestrian")
    southPedestrian = request.form.get("southPedestrian")
    eastPedestrian = request.form.get("eastPedestrian")
    westPedestrian = request.form.get("westPedestrian")
    # Gets the duration of the pedestrian crossings in seconds
    # crossingDuration = request.form.get("crossingDuration")

    if northPedestrian is None:
        northPedestrian = 0

    if southPedestrian is None:
        southPedestrian = 0

    if eastPedestrian is None:
        eastPedestrian = 0

    if westPedestrian is None:
        westPedestrian = 0

    # Finds how many pedestrians are coming from each direction, and if there is no crossing, then we will set the number to -1 to differentiate between cases where we have 0 pedestrians. If a checkbox is unchecked, then the corresponding request frequency textbox will have a None value in Flask 
    northRequestFrequency = request.form.get("northRequestFrequency")
    southRequestFrequency = request.form.get("southRequestFrequency")
    eastRequestFrequency = request.form.get("eastRequestFrequency")
    westRequestFrequency = request.form.get("westRequestFrequency")

    if northPedestrian == 0:
        northRequestFrequency = -1
    
    if southPedestrian == 0:
        southRequestFrequency = -1

    if eastPedestrian == 0:
        eastRequestFrequency = -1

    if westPedestrian == 0:
        westRequestFrequency = -1

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

    # Extract all of the form data into a dictionary representing a predefined JSON Structure
    # Stored in the session for later reference
    
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
                "north": northPedestrian,
                "east": eastPedestrian,
                "south": southPedestrian,
                "west": westPedestrian,
            },
            "rph": {
                "north": northRequestFrequency,
                "east": eastRequestFrequency,
                "south": southRequestFrequency,
                "west": westRequestFrequency
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

    # If the VPHObject contains the necessary information, insert it into the database, and store it in the sess
    if success:
        session["junction"] = vphObject
        jid = database.insertJunction(vphObject)
        if jid is not None:

            session["jid"] = jid  # Store jid into the session for easy access
            logging.info(f"Junction with json {json.dumps(vphObject.json, indent=4)} inserted with jid {jid}")
            return render_template("LayoutDesignPage.html")

        else:
            return jsonify({"error": "Junction insertion failed"}), 500
    else:
        return jsonify({"error": "VPHObject is missing some key details"}), 400


def simulateJunction():

    jlids = session.get("jlids")
    jid = session.get("jid")
    if jid is None:
        return jsonify({"error": "Jid not found"}), 500
    if jlids is None:
        return jsonify({"error": "Jlids not found"})

    # If there are configured layouts for this sessoin, simulate them
    for jlid in jlids:
        # simulate(jid, jlid)
        print("Hmm")


@app.route("/comparison_page")
def comparison_page():
    jid = session.get("jid")
    
    # In the case that jid is None, it means that the user has made a new junction set in
    # this session, meaning that they have pressed the "View Previous Designs" button from
    # the home page, which we have not added functionality for in this prototype
    if jid is None:
        return jsonify({"error": "Not implemented yet"}), 404

    # The comparison page takes two newly formatted JSONs
    junctionlayouts = database.getLayoutObjects(jid)

    # Second JSON - results
    junctionResults = database.getSimulationResults(jid)
    junctionScoreWeights = database.getScoreWeights(jid)
    results = {}


@app.route("/compare_new_kunctoin")
def compare_new_junction():
    jid = session.get("jid")
    if jid is None:
        return jsonify("")

    
if __name__ == "__main__":
    app.run(debug=True)
    database.initialiseDatabase()
