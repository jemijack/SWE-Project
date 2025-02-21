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
def junction_form():
    # Get the form data
    junctionSetName = request.form.get("junctionSetName")
    northVehiclesIn = request.form.get("northVehiclesIn")
    
    return render_template("LayoutDesignPage.html")

if __name__ == "__main__":
    app.run(debug=True)