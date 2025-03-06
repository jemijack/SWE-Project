from .selects import getVphObject, getName, getSimulationResults, getLayoutObjects
from .updates import updateJLState
from ..__init__ import connect, createCursor
from ..Objects import ResultsObject
import psycopg2
import json

""" THIS ENTIRE FILE EXISTS TO TRY AND CHEESE THE TESTING OF THE CREATION OF THE COMPARISON PAGE'S OBJECTS"""
def getComparisonPageResultsObject(jid):

    results = {}  # Initialise the dictionary to be returned

    # Get the name of the junction
    name = getName(jid)

    # Get the reshaped simulation results
    detailedsrs = getSimulationResults(jid)
    rDetailedsrs = reshapeSimulationResults(detailedsrs)

    # Get the other components
    sw = getScoreWeights(jid)
    dp = getDirectionPriorities(jid)

    # Add the direction priorities to the arms of each resultsObject
    # This only works for when ONE junction set is being compared - otherwise instead of using
    # dp |arms| many times, dp will have to be a list of direction prioritisations
    for rdsr in rDetailedsrs:
        rsr = rdsr["results"]  # Don't access the metadata as we don't edit it
        for arm in rsr:
            rsr[arm]["priority"] = dp[arm + "Arm"]

    # Add the scoring weights to each of the resultsObjects
    # For the same reasons, this only works when all layouts are from the same junction set
    # so all have the same scoring weightings
    withWeightings = []
    for rdsr in rDetailedsrs:
        ww = {}
        ww["scoringWeights"] = sw
        ww["metadata"] = rdsr["metadata"]
        del rdsr["metadata"]
        ww["results"] = rdsr["results"]
        withWeightings.append(ww)

    # Put all of the components into the dictionary
    results["JID"] = jid
    results["junctionName"] = name
    results["layouts"] = withWeightings

    return results


# Reshapes a list of simulationResults so that they're in the format required for the comparison page
def reshapeSimulationResults(dsrs):

    # Iterate through each of the detailed simulation results (simulation results with metadata)
    for dsr in dsrs:

        # Access only the results part of the detailed simulation results as we do not change the metadata
        result = dsr["results"]

        # Iterate through each arm of the junction
        for arm in ["north", "south", "east", "west"]:
            armDic = {}  # Dictionary for formatting
            lanes = []  # Will store the results of each lane
            laneNo = 1  # For naming purposes
            laneStats = result[arm + "Arm"]["laneStats"]

            # Restructure the stats for each lane
            for lane in laneStats:
                stats = {}
                stats["laneNumber"] = laneNo
                stats["averageWaitTime"] = laneStats[lane]["average wait time"]
                stats["maxWaitTime"] = laneStats[lane]["max wait time"]
                stats["maxQueueLength"] = laneStats[lane]["max queue length"]

                lanes.append(stats)
                laneNo += 1

            armDic["lanes"] = lanes
            result[arm] = armDic  # Update each arm to their new names and structures
            del result[arm + "Arm"]

        del result["status"]
        dsr["results"] = result

    return dsrs


def getDirectionPriorities(jid):

    # Get the json for the junction
    vphObject = getVphObject(jid)

    # Extract the prioritiy of each arm
    trafficFlows = vphObject["trafficFlows"]
    directionPriorities = {}
    for direction in trafficFlows:
        directionPriorities[direction] = trafficFlows[direction]["priority"]

    return directionPriorities


# Get the score metric wiehgtings for a particular junction, for use in the junction comparison page
def getScoreWeights(jid):
    vphObject = getVphObject(jid)
    priorities = vphObject["priorities"]

    # Normalise the weightings
    for p in priorities:
        priorities[p] = priorities[p] / 100.0
    return vphObject["priorities"]


# Insert hard-coded results while we don't have the simulation working
def cheatComparisonPage(numLayouts):
    # numLayouts is the number of layouts created in that session
    # don't want to be inserting fake for layouts that don't exist

    res = {
        "status": "failure message description",


        "northArm": {
            "laneStats": {
                "lane1": { "average wait time":104, "max wait time" :104, "max queue length": 6},
                "lane2": { "average wait time":104, "max wait time" :104, "max queue length": 6},
                "lane3": { "average wait time":104, "max wait time" :104, "max queue length": 6}
            },
        },
        "eastArm": {
            "laneStats": {
                "lane1": { "average wait time":104, "max wait time" :104, "max queue length": 6},
                "lane2": { "average wait time":104, "max wait time" :104, "max queue length": 6},
                "lane3": { "average wait time":104, "max wait time" :104, "max queue length": 6}
            },
        },
        "southArm": {
            "laneStats": {
                "lane1": { "average wait time":104, "max wait time" :104, "max queue length": 6},
                "lane2": { "average wait time":104, "max wait time" :104, "max queue length": 6},
            },
        },
        "westArm": {
            "laneStats": {
                "lane1": { "average wait time":104, "max wait time" :104, "max queue length": 6},
                "lane2": { "average wait time":104, "max wait time" :104, "max queue length": 6},
                "lane3": { "average wait time":104, "max wait time" :104, "max queue length": 6}
            },
        },
    }

    # Insert the above example ResultsObjects into the database
    def insertRes():

        # Hardcoded JLIDs are used - I believe Aadya's simulation would normally have them
        query = """
            INSERT INTO simulation_results (JLID, ResultsObject)
            VALUES
                (1, (%s)),
                (2, (%s)),
                (3, (%s)),
                (4, (%s))
        """
        resobj = ResultsObject(json=res)
        # Need to stringify the objects in order to insert them into the db as they contain a field of type TIMESTAMP which psycopg2 can't convert into JSONB
        data = (json.dumps(resobj.json), json.dumps(resobj.json), json.dumps(resobj.json), json.dumps(resobj.json))

        connection = None

        try:  # Cheeky bit of context manager action
            connection = connect()
            with connection:
                with createCursor(connection) as cursor:
                    cursor.execute(query, data)
                    if cursor.rowcount != 4:  # Check that all 4 rows have properly inserted
                        return False
                print(cursor.rowcount)
                return True
        except psycopg2.DatabaseError as e:
            print(f"Error {e}")
            return False
        finally:
            if connection:
                connection.close()

    # For use if there is ever under 4 junctions being simulated
    def insertResNew(numLayouts):
        query = """
            INSERT INTO simulation_results (JLID, ResultsObject)
            VALUES (%s, %s)
        """

        resobj = ResultsObject(json=res)
        # Need to stringify the objects in order to insert them into the db as they contain a field of type TIMESTAMP which psycopg2 can't convert into JSONB
        dresobj = json.dumps(resobj.json)

        connection = None

        try:  # Cheeky bit of context manager action
            connection = connect()
            with connection:
                with createCursor(connection) as cursor:
                    for i in range(1, numLayouts + 1):
                        data = (i, dresobj)
                        cursor.execute(query, data)
                        if cursor.rowcount != 1:  # Check that all 4 rows have properly inserted
                            return False
                print(cursor.rowcount)
                return True
        except psycopg2.DatabaseError as e:
            print(f"Error {e}")
            return False
        finally:
            if connection:
                connection.close()

    # if insertRes():
    #     print("The fake results have successfully been inserted")

    if insertResNew(numLayouts):
        print("The fake results have successfully been inserted")

        # Now change the stateIDs of the JLIDs in the DB to say that they have been completed
        for i in range(1, (numLayouts + 1)):
            updateJLState(jlid=i, stid=3)
        return True
    else:
        print("NAY")
        return False
