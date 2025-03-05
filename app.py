from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import database
from database.Objects import VPHObject, LayoutObject
import logging
from datetime import datetime, timezone
import json
from os import urandom
import time

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

# Route to handle the junction form submission (POST request)
@app.route("/junctionform", methods=["POST"])
def junctionForm():

    """ Handle the cases where the 'pedestrian crossing' checkbox is unchecked, as other
        otherwise there would be null values in the JSON """
    # Checks to see whether there is a pedestrian crossing for each direction, and stores the yes/no value in the variable for each direction. yes = 1, no = 0.
    northPedestrian = request.form.get("northPedestrian")
    southPedestrian = request.form.get("southPedestrian")
    eastPedestrian = request.form.get("eastPedestrian")
    westPedestrian = request.form.get("westPedestrian")
    # Gets the duration of the pedestrian crossings in seconds

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

    # Extract the now cleansed form data into a dictionary representing
    # a predefined JSON Structure 
    form_data = {
        "JName": request.form.get("junctionSetName"),
        "priorities": {
            "averageWaitPriority": int(request.form.get("AverageWait")),
            "maximumWaitPriority": int(request.form.get("MaxWait")),
            "maximumQueuePriority": int(request.form.get("MaxQueue"))
        },
        "trafficFlows": {
            "north": {
                "totalVph": int(request.form.get("northVehiclesIn")),
                "exitingVPH": {
                    "east": int(request.form.get("northLeftOut")),
                    "south": int(request.form.get("northStraightOut")),
                    "west": int(request.form.get("northRightOut"))
                },
                "vehicleSplit": {
                    "bus": int(request.form.get("northBusPercentage")),
                    "cycle": int(request.form.get("northCyclePercentage")),
                    "car": int(request.form.get("northCarPercentage"))
                },
                "priority": int(request.form.get("northPriority"))
            },
            "east": {
                "totalVPH": int(request.form.get("eastVehiclesIn")),
                "exitingVPH": {
                    "north": int(request.form.get("eastRightOut")),
                    "south": int(request.form.get("eastLeftOut")),
                    "west": int(request.form.get("eastStraightOut")),
                },
                "vehicleSplit": {
                    "carPercentage": int(request.form.get("eastCarPercentage")),
                    "busPercentage": int(request.form.get("eastBusPercentage")),
                    "cyclePercentage": int(request.form.get("eastCyclePercentage"))
                },
                "priority": int(request.form.get("eastPriority"))
            },
            "south": {
                "totalVPH": int(request.form.get("southVehiclesIn")),
                "exitingVPH": {
                    "north": int(request.form.get("southStraightOut")),
                    "east": int(request.form.get("southRightOut")),
                    "west": int(request.form.get("southLeftOut"))
                },
                "vehicleSplit": {
                    "carPercentage": int(request.form.get("southCarPercentage")),
                    "busPercentage": int(request.form.get("southBusPercentage")),
                    "cyclePercentage": int(request.form.get("southCyclePercentage"))
                },
                "priority": int(request.form.get("southPriority"))
            },
            "west": {
                "totalVPH": int(request.form.get("westVehiclesIn")),
                "exitingVPH": {
                    "leftOut": int(request.form.get("westLeftOut")),
                    "straightOut": int(request.form.get("westStraightOut")),
                    "rightOut": int(request.form.get("westRightOut"))
                },
                "vehicleSplit": {
                    "carPercentage": int(request.form.get("westCarPercentage")),
                    "busPercentage": int(request.form.get("westBusPercentage")),
                    "cyclePercentage": int(request.form.get("westCyclePercentage"))
                },
                "priority": int(request.form.get("westPriority"))
            }
        },
        "pedestrianData": {
            "crossingDuration": int(request.form.get("crossingDuration")),
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

    # Add a timeststamp field for logging purposes
    form_data["timestamp"] = datetime.now(timezone.utc)

    # Add the uid field
    form_data["userId"] = str(session.get("uid"))

    # Make a VPHObject
    vphObject = VPHObject(json=form_data)
    success = vphObject.populateFields()

    # If the VPHObject contains all of the the necessary information, that means the junction is
    # accepted and we insert it into the database, store it's resulting ID in the session for later use
    if success:
        session["junction"] = vphObject
        jid = database.insertJunction(vphObject)
        if jid is not None:

            session["jid"] = jid  # Store jid into the session for easy access
            logging.info(f"Junction with json {json.dumps(vphObject.json, indent=4)} inserted with jid {jid}")
            return render_template("LayoutDesignPage.html")

    # Error handling
        else:
            return jsonify({"error": "Junction insertion failed"}), 500
    else:
        return jsonify({"error": "VPHObject is missing some key details"}), 400


# Endpoint for when the user has finished designing the layout for their junction
# and wants to create a new one
@app.route("/save_junction", methods=["Get", "POST"])
def save_junction():

    # Get the JSON from the frontend
    data = request.get_json()
    jid = session.get("jid")

    # We need to know which junction that this is a layout for
    if jid is None:
        return jsonify({"error": "No Junction Set was created in this session so it is unkown which junction set this is meant to be a layout for"})

    # Create the layout's python Object representation for an easier insertion into the database
    data["junctionID"] = jid
    logging.info(f"JSON received from the layout configuration page: {json.dumps(obj=data, indent=4)}")
    confObject = LayoutObject(json=data)

    # Populate Fields is successful if the confObject contains all necessary information
    success = confObject.populateFields()
    if not success:
        logging.error(f"The JSON representing the configured layout is missing some key information: {data}")
        return jsonify({"status": "Error - Layout JSON is missing some necessary details"}), 400

    # The python Object representing the layout has the necessary information, so can be saved in the database
    jlid = database.insertLayout(confObject)

    # jlid will be the id of the newly inserted junction layout
    if jlid is None:
        logging.error(f"Layout insertion for junction: {jid} failed")
        return jsonify({"status": f"Error - Layout insertion for junction: {jid} failed"}), 500

    # jlid exists, so the query executes successfully and the layout is successfully saved
    logging.info(f"Layout for junction: {jid} inserted with jlid: {jlid}")

    # Store the currently desgined layouts in the session for later use
    jlids = session.get("jlids", [])

    # If this is the first configuration made in the session, it is the first configuration
    # made for that junction so it's JStateID should be set to "Not Started" instead of "New"
    if jlids == []:
        changed = database.updateState(id=jid, isJunction=True, stateID=2)  # JState 2 = NOT_STARTED
        if not changed:
            logging.warning(f"Junction with jid: {jid} failed to update it's state to 'Not Started'")

    # Layouts have already been made in the session, so the
    # list of layouts is initialised and we can append to it
    jlids.append(jlid)

    # Reassigning the session key means flask updates the cookie in the browser
    session["jlids"] = jlids
    logging.info(f"The layouts created in this session have the following jlids: {jlids}")

    """This stuff is for when the submissions <= 4 thing was on the server side. Now it's done in script.js"""
    # # The user will be allowed to create up to 4 layouts for the same junction
    # # Once four have been created, start simulating them
    # submissionCount = len(jlids)
    # if submissionCount == 4:
    #     logging.info(f"The user has now submitted 4 layouts for junction: {jid}, with jlids {jlids}, simulation will begin")

    #     """This should redirect them to the simulator, which then redirects to the poller,
    #     # which then redirects to the comparison page. This is temporary"""
    #     return jsonify({
    #         "status": "success",
    #         "message": f"Layout saved with id: {jlid}, There are now 4 junctions, so simulation can commence",
    #         "submissionCount": submissionCount,
    #         "redirect": "/comparison_page"
    #     }), 200

    # The layout has successfully been saved, and the user has created under 4 layouts so they
    # can continue to make more layouts

    # If flask simply returns success or failure messages, it better separates the
    # business logic from the client logic
    return jsonify({"status": "Success - Layout saved to the database"}), 200


# This is where the calls to the simulation process will happen (may be Aadya's code?)
def simulateJunction():

    # Get the IDs of the created junction set and it's configured layouts
    jlids = session.get("jlids")
    jid = session.get("jid")
    if jid is None:
        return jsonify({"error": "Jid not found"}), 400
    if jlids is None:
        return jsonify({"error": "Jlids not found"}), 400
    
    # While I don't have Aadya's code, I'll sort of cheat things a bit and makeup the results

    # If there are configured layouts for this sessoin, simulate them
    for jlid in jlids:
        # simulate(jid, jlid)
        print("Hmm")


# Loading page endpoint
@app.route("/loading_page", methods=["GET"])
def loading_page():
    return render_template("loading.html")


# Polling endpoint
@app.route("/simulation_status", methods=["GET"])
def simulation_status():

    # They need to have created a junction set in order to simulate it
    jid = session.get("jid")
    if jid is None:
        return jsonify({
            "status": "Error: a junction set has not been created - there's no layouts to simulate"
            }), 400

    # Check if the junction has finished simulating
    print("Should be waiting for 20 seconds")
    #if database.isSimulationFinished(jid):
    if database.cheatComparisonPage():
        logging.info("It should have ran")
        database.cheatComparisonPage
        logging.info("It should have finsihed running")
        return jsonify({"status": "complete"}), 200

    # The simulation is still occurring
    return jsonify({"status": "in progress"}), 200


@app.route("/comparison_page", methods=["GET"])
def comparison_page():

    # Get the jid of the created junction set
    jid = session.get("jid")

    # If there is no jid in the session, a junction set must not have been created
    # In a more complete version, this would be where the separate logic is for when
    # they go straight to the comparison page from the homepage. But that will not be
    # a feature in this prototype
    if jid is None:
        return jsonify({
            "status": "Error: a junction set has not been created - there are no results to display"
            }), 400

    # Create the objects that the comparison page needs
    # resobj = database.getComparisonPageResultsObject(jid)
    # confobj = database.getLayoutObjects(jid)
    # json.dump(obj=confobj, fp='/static/data/four-config.json', indent=4)
    # json.dump(obj=resobj, fp='/static/data/four-results.json', indent=4)
    return render_template("preview.html")

  
if __name__ == "__main__":
    database.initialiseDatabase()
    app.run(debug=True)
