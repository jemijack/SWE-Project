from flask import Flask, render_template, request, jsonify 

app = Flask(__name__) 


# Route for the home page (renders the form)
@app.route("/", methods=["GET"])
def home():
    return render_template("CreateNewSet.html")  # Displays the create new set form page at the specified url


@app.route('/save_junction', methods=['POST']) # The endpoint matches the figma button. This is when the user has finished designing their junction and wants to create a new one. 
def save_junction(): 
    data = request.get_json() # get JSON from frontend 
    print("Recieved JSON:", data) # print statement  because idk what to do with the data for now. mb connect to the database?? 
    return jsonify({"message": "Data received!", "data" : data}) #send back a responce so that i know that backend and front end can talk to eachother. 


# Route to handle the form submission (POST request)
@app.route("/junctionform", methods=["POST"])
def junctionForm():
    # Get the form data
    junctionSetName = request.form.get("junctionSetName")
    northVehiclesIn = request.form.get("northVehiclesIn")
    # Checks to see whether there is a pedestrian crossing for each direction, and stores the yes/no value in the variable for each direction. yes = 1, no = 0.
    northPedestrian = request.form.get("northPedestrian")
    southPedestrian = request.form.get("southPedestrian")
    eastPedestrian = request.form.get("eastPedestrian")
    westPedestrian = request.form.get("westPedestrian")
    # Gets the duration of the pedestrian crossings in seconds
    crossingDuration = request.form.get("crossingDuration")

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

    print(northRequestFrequency)
    print(southRequestFrequency)
    print(eastRequestFrequency)
    print(westRequestFrequency)

    averageWaitPriority = request.form.get("AverageWait")
    maximumWaitPriority = request.form.get("MaxWait")
    maximumQueuePriority = request.form.get("MaxQueue")

    print(averageWaitPriority)
    print(maximumQueuePriority)
    print(maximumWaitPriority)

    
    return render_template("LayoutDesignPage.html")

if __name__ == "__main__":
    app.run(debug=True)
