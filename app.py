from flask import Flask, render_template, request, jsonify

app = Flask(__name__) 

@app.route('/')
def index(): 
    return render_template('index.html') #This will be the design a junction page. For now its just /index 

@app.route('/save_junction', methods=['POST']) # The endpoint matches the figma button. This is when the user has finished designing their junction and wants to create a new one. 
def save_junction(): 
    data = request.get_json() # get JSON from frontend 
    print("Recieved JSON:", data) # print statement  because idk what to do with the data for now. mb connect to the database?? 
    return jsonify({"message": "Data received!", "data" : data}) #send back a responce so that i know that backend and front end can talk to eachother. 

if __name__ == '__main__':
    app.run(debug=True)