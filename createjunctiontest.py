import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import pytest
from app import app

# Define the test client
@pytest.fixture
def client():
    with app.test_client() as client:
        yield client


# Tests whether loading the Create junction page is as expected by simulating a get request to /junctionform
def testCreateJunction(client):
    # Simulates sending a get request to /junctionform
    response = client.get('/junctionform')

    # Ensure that the request doesn't fail/break
    assert response.status_code == 200

    # Check that the page loaded is the Create New Junction page. The title for which we are looking is unique to this page
    assert b'<title>Junction Set Creation</title>' in response.data


# Tests whether or not, from the Create Junction page, the home page can successfully be transitioned to
def testCreateJunctionToHome(client):
    # First simulate going to the Create Junction page
    response = client.get('/junctionform')

    # Ensure that the request doesn't fail/break
    assert response.status_code == 200

    # Check that the right page, i.e the Create Junction page, has been arrived at
    assert b'<title>Junction Set Creation</title>' in response.data

    # Simulate sending a get request to /home, mimicking the behaviour of pressing Home on the Create Junction page
    response = client.get('/home')

    # Ensure that the request doesn't fail/break
    assert response.status_code == 200

    # Check that this takes us to the correct html page, i.e that of HomePage.html. This has the unique title of Home, so this can be used as the check
    assert b'<title>Home</title>' in response.data


# Simulates sending some of the values from the Create Junction form to Flask, and subsequently rendering these values as variables in the HTML to see if the values remain unchanged.
def testCreateJunctionToCreateLayout(client):
    # The values of the variables we will simulate sending
    junctionSetName = 'exampleSet'
    AverageWait = '20'
    northVehiclesIn = '100'
    southLeftOut = '40'

    # Create the data in the form in which it will be sent 
    data = {
            'junctionSetName' : junctionSetName,
            'AverageWait' : AverageWait,
            'northVehiclesIn' : northVehiclesIn,
            'southLeftOut' : southLeftOut
        }

    # Simulate a post request to /layoutform with the data being the dictionary in the data variable
    response = client.post('/layoutform', data=data)

    # Check that nothing breaks
    assert response.status_code == 200

    #Check that we are at the correct page. We know that the title of the layout design page is unique to that page, so we will use it
    assert b'<title>Design a Junction</title>' in response.data

    #Check that all variables are sent correctly to Flask and subsequently to the LayoutDesignPage.html page
    assert junctionSetName.encode() in response.data
    assert AverageWait.encode() in response.data
    assert northVehiclesIn.encode() in response.data
    assert southLeftOut.encode() in response.data 
    


