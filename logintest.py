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

# Test that going from the login to home page works, and the data sent maintains integrity
def testLoginToHome(client):
    username_input = 'exampleuser'
    # Simulates the sending of the username exampleuser to Flask by pressing the Login button, i.e a post request
    response = client.post('/home', data={'username': username_input})

    # Check that the response status code is 200
    assert response.status_code == 200

    # Checks if the username received by Flask is the correct one. encode() converts the string value of the variable into a byte string to compare with response.data, as it is a byte string
    assert username_input.encode() in response.data  

    # Checks if we have successfully navigated to the home page, meaning that the html is correct. This class is exclusive to the home page's html, so we know we've reached it if that class is present
    assert b'class="previousDesigns-button"' in response.data


def testLogin(client):
    # Simulate get reqyest to /, where the Login page should then be rendered
    response = client.get('/')

    # Assert the status code is 200 (OK)
    assert response.status_code == 200

    # Assert that the login page contains specific content (e.g., username field)
    assert b'<title>Login</title>' in response.data



