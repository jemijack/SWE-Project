from flask import Flask, render_template, request, jsonify

app = Flask(__name__) 

@app.route('/')
def index(): 
    return render_template('CreateNewSet.html') #This will be the design a junction page. For now its just /index 

@app.route('/save_junction', methods=['POST']) # The endpoint matches the figma button. This is when the user has finished designing their junction and wants to create a new one. 
def save_junction(): 
    data = request.get_json() # get JSON from frontend 
    print("Recieved JSON:", data) # print statement  because idk what to do with the data for now. mb connect to the database?? 
    return jsonify({"message": "Data received!", "data" : data}) #send back a responce so that i know that backend and front end can talk to eachother. 

if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask, render_template, request

app = Flask(__name__)

# Route for the home page (renders the form)
@app.route("/", methods=["GET"])
def home():
    return render_template("CreateNewSet.html")  # Your form page

# Route to handle the form submission (POST request)
@app.route("/junctionform", methods=["POST"])
def junction_form():
    # Get the form data
    junctionSetName = request.form.get("junctionSetName")

    northVehiclesIn = request.form.get("northVehiclesIn")
    #Exiting West
    northLeftOut = request.form.get("northLeftOut")
    #Exiting North
    northStraightOut = request.form.get("northStraightOut")
    #Exiting East
    northRightOut = request.form.get("northRightOut")
    northCarPercentage = request.form.get("northCarPercentage")
    northBusPercentage = request.form.get("northBusPercentage")
    northCyclePercentage = request.form.get("northCyclePercentage")
    northPriority = request.form.get("northPriority")

    southVehiclesIn = request.form.get("southVehiclesIn")
    #Exiting East
    southLeftOut = request.form.get("southLeftOut")
    #Exiting South
    southStraightOut = request.form.get("southStraightOut")
    #Exiting West
    southRightOut = request.form.get("southRightOut")
    southCarPercentage = request.form.get("southCarPercentage")
    southBusPercentage = request.form.get("southBusPercentage")
    southCyclePercentage = request.form.get("southCyclePercentage")
    southPriority = request.form.get("southPriority")

    eastVehiclesIn = request.form.get("eastVehiclesIn")
    #Exiting North
    eastLeftOut = request.form.get("eastLeftOut")
    #Exiting East
    eastStraightOut = request.form.get("eastStraightOut")
    #Exiting South
    eastRightOut = request.form.get("eastRightOut")
    eastCarPercentage = request.form.get("eastCarPercentage")
    eastBusPercentage = request.form.get("eastBusPercentage")
    eastCyclePercentage = request.form.get("eastCyclePercentage")
    eastPriority = request.form.get("eastPriority")

    westVehiclesIn = request.form.get("westVehiclesIn")
    #Exiting South
    westLeftOut = request.form.get("westLeftOut")
    #Exiting West
    westStraightOut = request.form.get("westStraightOut")
    #Exiting North
    westRightOut = request.form.get("westRightOut")
    westCarPercentage = request.form.get("westCarPercentage")
    westBusPercentage = request.form.get("westBusPercentage")
    westCyclePercentage = request.form.get("westCyclePercentage")
    westPriority = request.form.get("westPriority")

    # Print the data to verify it's received (optional)
    print(f"Junction Set Name: {junctionSetName}")

    print(f"North Vehicles In: {northVehiclesIn}")
    print(f"Vehicles exitig left from North: {northLeftOut}")
    print(f"Vehicles exiting straight from North: {northStraightOut}")
    print(f"Vehicles exiting right from North: {northRightOut}")
    print(f"Percentage of northbound vehicles being cars: {northCarPercentage}")
    print(f"Percentage of northbound vehicles being busses: {northBusPercentage}")
    print(f"Percentage of northbound vehicles being cycles: {northCyclePercentage}")
    print(f"North Priority: {northPriority}")

    print(f"South Vehicles In: {southVehiclesIn}")
    print(f"Vehicles exitig left from South: {southLeftOut}")
    print(f"Vehicles exiting straight from South: {southStraightOut}")
    print(f"Vehicles exiting right from South: {southRightOut}")
    print(f"Percentage of southbound vehicles being cars: {southCarPercentage}")
    print(f"Percentage of southbound vehicles being busses: {southBusPercentage}")
    print(f"Percentage of southbound vehicles being cycles: {southCyclePercentage}")
    print(f"South Priority: {southPriority}")

    print(f"East Vehicles In: {eastVehiclesIn}")
    print(f"Vehicles exitig left from East: {eastLeftOut}")
    print(f"Vehicles exiting straight from East: {eastStraightOut}")
    print(f"Vehicles exiting right from East: {eastRightOut}")
    print(f"Percentage of eastbound vehicles being cars: {eastCarPercentage}")
    print(f"Percentage of eastbound vehicles being busses: {eastBusPercentage}")
    print(f"Percentage of eastbound vehicles being cycles: {eastCyclePercentage}")
    print(f"East Priority: {eastPriority}")

    print(f"West Vehicles In: {westVehiclesIn}")
    print(f"Vehicles exitig left from West: {westLeftOut}")
    print(f"Vehicles exiting straight from West: {westStraightOut}")
    print(f"Vehicles exiting right from West: {westRightOut}")
    print(f"Percentage of westbound vehicles being cars: {westCarPercentage}")
    print(f"Percentage of westbound vehicles being busses: {westBusPercentage}")
    print(f"Percentage of westbound vehicles being cycles: {westCyclePercentage}")
    print(f"West Priority: {westPriority}")

    # Return a message to confirm the form was received
    return "Form received!"

if __name__ == "__main__":
    app.run(debug=True)