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


def testHome(client):
    # Simulate GET request to /home
    response = client.get('/home')  # Assuming the home page is at /home

    # Assert the status code is 200 (OK)
    assert response.status_code == 200

    # Check an element exclusive to the html of the home page
    assert b'class="previousDesigns-button"' in response.data

def testHomeToCreateJunction(client):
    # Simulate GET request to /home
    response = client.get('/home')

    # Assert the status code is 200 (OK)
    assert response.status_code == 200

    #Confirm we've successfully rendered the home page
    assert b'class="previousDesigns-button"' in response.data

    # Simulate GET request to /junctionform
    response = client.get('/junctionform')

    # Confirm that the above caused no problems
    assert response.status_code == 200

    # Confirm that the Create New Junction page has been loaded by looking at the title of the html page. This title is exclusive to the Create new junction page.
    assert b'<title>Junction Set Creation</title>' in response.data

def testHometoLogin(client):
    # Step 1: Simulate GET request to /home
    response = client.get('/home')  

    # Assert the status code is 200 (OK)
    assert response.status_code == 200

    # Confirm we've actually arrived at the home page
    assert b'class="previousDesigns-button"' in response.data

    # Simulate pressing the back to login button from the home page
    response = client.get('/')  

    # Assert that the status code is 200 (OK)
    assert response.status_code == 200

    # Confirm that the login page has been loaded by checking for the Login title field, which is unique to the login page
    assert b'<title>Login</title>' in response.data 

