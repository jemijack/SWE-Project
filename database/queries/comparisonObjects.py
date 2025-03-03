from .selects import getVphObject, getName, getSimulationResults


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
            rsr[arm]["priority"] = dp[arm]

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
    return vphObject["priorities"]
