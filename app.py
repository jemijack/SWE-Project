from flask import Flask, render_template, request, jsonify, session, url_for, redirect
import database
from database.Objects import VPHObject, LayoutObject
import logging
from utils import utils
import json
from os import urandom

app = Flask(__name__)
app.secret_key = urandom(32)


# Route for the login page, which will be the start page. Note that dropping the methods parameter means only GET requests will be read, by default
@app.route("/")
def login():
    # Displays the login page at the specified url, i.e /
    return render_template("loginPage.html")  


# Route to get back to the home page from the junction set creation page
@app.route("/home", methods=["GET"])
def junctionFormToHome():
    # Displays the home page at the url /home
    return render_template("homePage.html")


# Route to handle login. Takes user to the home page
@app.route("/home", methods=["POST"])
def loginToHome():
    # Get the username provided by the user
    username = request.form.get("username")
    uid = database.insertUser(username)
    if uid is None:
        return jsonify({"status": f"Error: unable to generate a uid for the username {username}"}), 500

    logging.info(f"The User ID for this session is: {uid}")
    session["uid"] = uid
    # Displays the create new set form page at the specified url
    return render_template("homePage.html") 


# Route to the junction set design page from the home page
@app.route("/junction-creation-page", methods=["GET"])
def junctionForm():
    # Displays the junction set design page at the specified url, i.e /junctionform
    return render_template("createNewSet.html")


# Store the junction form in the database and render the layout configuration page
@app.route("/junction-creation-page", methods=["POST"])
def handleJuncionForm():
    # Get the uid for the user that's created the junction
    uid = session.get("uid")
    if uid is None:
        return jsonify({"status": "Error - the user has to login in order to be able to create a junction"})

    # Form a predefined JSON object representing a junction set from the data
    formData = utils.formatFormData(request.form, uid)

    # Make a VPHObject
    vphObject = VPHObject(json=formData)
    success = vphObject.populateFields()

    # If the VPHObject contains all of the the necessary information, the junction is accepted
    # and we insert it into the database, storing it's resulting ID in the session for later use
    if success:
        session["junction"] = vphObject
        jid = database.insertJunction(vphObject)
        if jid is not None:

            session["jid"] = jid  # Store jid into the session for easy access
            session["jlids"] = []  # Initialise the array to store the layout IDs for this junction set
            logging.info(f"Junction with json {json.dumps(vphObject.json, indent=4)} inserted with jid {jid}")
            return redirect(url_for('renderLayoutForm'))

    # Error handling
        else:
            return jsonify({"status": "Error - junction insertion failed"}), 500
    else:
        return jsonify({"status": "Error - VPHObject is missing some key details"}), 400


# Route to handle the junction form submission (POST request)
@app.route("/layout-design-page", methods=["GET"])
def renderLayoutForm():
    # Render the layout configuration page
    return render_template("layoutDesignPage.html")


# Endpoint for when the user has finished designing the layout for their junction
# and wants to create a new one
@app.route('/layout-design-page', methods=['POST'])
def saveJunction():

    # Get the JSON from the frontend
    data = request.get_json()
    jid = session.get("jid")

    # We need to know which junction that this is a layout for
    if jid is None:
        return jsonify({"error": "No Junction Set was created in this session so it is unkown which junction set this is meant to be a layout for"})

    # Create the layout's python Object representation for an easier insertion into the database
    data["junctionId"] = jid
    data["userId"] = int(data["userId"])
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

    # Response from the backend
    responseData = {
        "status": "Success - Layout saved to the database",
        "submissionCount": len(jlids)
    }

    # If 4 layouts have been submitted, prepare for simulation/comparison
    if len(jlids) >= 4:
        responseData["redirect"] = "/loading-page"

    return jsonify(responseData), 200


# Loading page endpoint
@app.route("/loading-page", methods=["GET"])
def loadingPage():

    # Get the number of layouts that have been created for this current session
    jlids = session.get("jlids")
    if jlids is None:
        return jsonify({"status": "Error - no layouts were created in this session so there is nothing to simulate"})
    numLayouts = len(jlids)
    # Cheat and insert premade results into the database
    logging.info(f"The result of the new cheatComparisonPage is: {database.cheatComparisonPage(numLayouts)}")

    """Aadya I think your calls to the simulation could be done here. The jid and list
    of jlids are all stored in session e.g. jid = session["jid"], jlids = session["jlids"]"""

    # Start the polling process if they're complete
    return render_template("loading.html")


# Polling endpoint
@app.route("/simulationStatus", methods=["GET"])
def simulationStatus():

    # They need to have created a junction set in order to simulate it
    jid = session.get("jid")
    if jid is None:
        return jsonify({
            "status": "Error -  a junction set has not been created so there are no layouts to simulate"
            }), 400

    if database.isSimulationFinished(jid):
        # Return a message saying that its complete
        return jsonify({"status": "complete"}), 200

    # The simulation is still occurring
    return jsonify({"status": "in progress"}), 200


@app.route("/comparison-page", methods=["GET"])
def comparisonPage():

    # Get the jid of the created junction set
    jid = session.get("jid")

    # If there is no jid in the session, a junction set must not have been created
    # In a more complete version, this would be where the separate logic is for when
    # they go straight to the comparison page from the homepage. But that will not be
    # a feature in this prototype
    if jid is None:
        return jsonify({
            "status": "Error - a junction set has not been created - there are no results to display"
            }), 400

    # The simulation has finished, so the data that we need is in the database
    # and we can create the objects that the comparison page needs - a custom resultsJSON,
    # which combines attributes from all three database objects for a junction with its
    # layouts and a list of normal configurationObjects for those layouts as a JSON

    # Create the resultsJSON
    resultsJSON = database.getComparisonPageResultsObject(jid)
    logging.info(f"ResultsJSON obtained: {json.dumps(obj=resultsJSON, indent=4)}")  # For logging reasons

    # Create the configJSON
    layoutObjects = database.getLayoutObjects(jid)
    logging.info(f"configJSON obtained: {json.dumps(obj=layoutObjects, indent=4)}")  # For logging reasons

    # Render the comparisons page, passing it the JSONs it needs with Jinja templating
    return render_template("comparisonPage.html", configData=layoutObjects, resultsData=resultsJSON)


if __name__ == "__main__":
    database.initialiseDatabase()
    app.run(debug=True)
