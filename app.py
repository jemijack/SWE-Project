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

    # Add a timeststamp field for logging purposes
    form_data["timestamp"] = datetime.now(timezone.utc)

    # Add the uid field
    form_data["userId"] = session.get("uid")

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
@app.route('/save_junction', methods=['Get', 'POST'])
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


# This is polls the database for if the simulation is finished
@app.route('/poll')
def poll_route(maxAttempts=20, attempt=0):

    """Recursive polling endpoint"""
    if attempt == maxAttempts:
        return None  # Could create some timeout/unsuccessful page

    # Check if the junction has finished simulating
    jid = session.get("jid")
    if jid is None:
        return jsonify({"error": "A junction has not been created so there's nothing to simulate"})
    if database.isSimulationFinished(jid):
        """UNFINSIHED"""
        return jsonify({"redirect": "/comparison_page"})
        comparison_page()
        return "comparison page html"


    # The simulation has not finished. Wait for a bit, and then try again
    attempt += 1
    time.sleep(10)
    return poll_route(maxAttempts, attempt)


@app.route("/comparison_page")
def comparison_page():
    return render_template("preview.html")
    jid = session.get("jid")
    
    # In the case that jid is None, it means that the user has made a new junction set in
    # this session, meaning that they have pressed the "View Previous Designs" button from
    # the home page, which we have not added functionality for in this prototype
    if jid is None:
        return jsonify({"error": "Not implemented yet"}), 404

    # The comparison page takes two newly formatted JSONs
    resultsObj = database.getComparisonPageResultsObject(jid)
    configsObj = database.getLayoutObjects(jid)


@app.route("/compare_new_kunctoin")
def compare_new_junction():
    jid = session.get("jid")
    if jid is None:
        return jsonify("")

    
if __name__ == "__main__":
    app.run(debug=True)
    database.initialiseDatabase()
