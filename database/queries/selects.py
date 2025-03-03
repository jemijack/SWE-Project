from ..__init__ import connect, createCursor
import psycopg2
import logging  # More flexible than print statements


def getName(jid):
    getNameQuery = """
    SELECT JName
    FROM junctions
    WHERE JID = (%s)"""

    connection = None

    try:
        connection = connect()  # Connect to the database

        # Use context manager to ensure the connection is committed or rolled back safely
        with connection:

            with createCursor(connection) as cursor:

                cursor.execute(getNameQuery, (jid,)) # Execute the query
                JName_tuple = cursor.fetchone()

                # If the query is successful, JName_tuple will be a 1-tuple
                if JName_tuple is not None:

                    JName = JName_tuple[0]
                    logging.info(f"The name forthe junction with jid {jid} has been successfully retrieved: {JName}") 
                    return JName
                
                # The name of the junction could not be found
                return None
            
    # Error handling
    except psycopg2.OperationalError as error:
        logging.error(f"Database operational error in getName on jid: {jid}: {error}")
        return None
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error in getName on jid: {jid}: {error}")
        return None
    finally:
        if connection is not None:
            connection.close()  # Still need to close the connection manually


def checkJState(jid):
    # Natural Joins are considered an anti-pattern
    # as they go against the modularity rule
    # https://stackoverflow.com/questions/6039719/is-natural-join-considered-harmful-in-production-environment
    checkJStateQuery = """
        SELECT st.JStateID, st.JStateName, st.JStateDescription
        FROM junctions AS j
        INNER JOIN junction_states AS st
        ON j.JStateID = st.JStateID
        WHERE j.JID = (%s);
    """

    connection = None

    try:
        connection = connect() # Connect to the database

        # Use context manager to ensure the connection is committed or rolled back safely
        with connection:

            with createCursor(connection) as cursor:

                cursor.execute(checkJStateQuery, (jid,)) # Execute the query
                jState_tuple = cursor.fetchone()

                # If the query is successful, jState_tuple will be a 3-tuple
                if jState_tuple is not None:

                    jStateID, jStateName, jStateDescription = jState_tuple
                    logging.info(f"Current Junction State: {jStateName}: {jStateDescription}")
                    return jStateID

                # The jStateID cannot be found for that particular state
                return None

    # Error handling
    except psycopg2.OperationalError as error:
        logging.error(f"Database operational error in checkJState on jid: {jid}: {error}")
        return None
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error in checkJState on jid: {jid}: {error}")
        return None
    finally:
        if connection is not None:
            connection.close()  # Still need to close the connection manually


def getSimulationResult(jlid):
    getSimulationResultsQuery = """
        SELECT ResultsObject
        FROM simulation_results
        WHERE JLID = (%s)
    """
    connection = None

    try:
        connection = connect()  # Connect to the database

        # Use context manager to ensure the connection is committed or rolled back safely
        with connection:

            with createCursor(connection) as cursor:

                cursor.execute(getSimulationResultsQuery, (jlid,))
                results_tuple = cursor.fetchone()
                # If the query executes successfully, results_tuple will be a 1-tuple
                if results_tuple is not None:
                    # Do stuff regarding the resultsObjects
                    return results_tuple[0]

                # The jlid cannot be found for that particular state
                return None

    # Error handling
    except psycopg2.OperationalError as error:
        logging.error(f"Database operational error in getSimulationResults for jlid: {jlid}: {error}")
        return None
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error in getSimulationResults for jlid: {jlid}: {error}")
        return None
    finally:
        if connection is not None:
            connection.close()  # Connection still needs to be closed manually


# Get a list of the results object for each layout for a particular junction - adapted for the layout comparison page
def getSimulationResults(jid):
    getSimulationResultsQuery = """
        SELECT jl.JLID, jl.CreatedAt, sr.ResultsObject
        FROM junction_layouts AS jl
        INNER JOIN simulation_results AS sr ON jl.JLID = sr.JLID
        WHERE jl.JID = (%s)
    """
    connection = None

    try:
        connection = connect()  # Connect to the database

        # Use context manager to ensure the connection is committed or rolled back safely
        with connection:

            with createCursor(connection) as cursor:

                cursor.execute(getSimulationResultsQuery, (jid,))
                resultsObjects = cursor.fetchall()
                # If the query executes successfully, results_tuple will be a list of 3-tuples
                if resultsObjects is not None:
                    # Create a JSON containing all of the results objects in a list
                    json = []
                    for jlid, timestamp, resultsObject in resultsObjects:

                        # Add the metadata to the results
                        detailedResults = {}
                        metadata = {}

                        # Insert layout-unique values
                        metadata["JLID"] = jlid
                        metadata["timestamp"] = timestamp

                        # These values are hard-coded for now, but in future versions of
                        # the product, these measurements may be varied
                        metadata["totalSimulationTime"] = 3600
                        metadata["timeUnit"] = "seconds"
                        metadata["queueLengthUnit"] = "vehicles"

                        # Add the metadata to the results object
                        detailedResults["metadata"] = metadata
                        detailedResults["results"] = resultsObject
                        json.append(resultsObject)

                    return json

                # The jlid cannot be found for that particular state
                return None

    # Error handling
    except psycopg2.OperationalError as error:
        logging.error(f"Database operational error in getSimulationResults for jid: {jid}: {error}")
        return None
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error in getSimulationResults for jid: {jid}: {error}")
        return None
    finally:
        if connection is not None:
            connection.close()  # Connection still needs to be closed manually


def getLayoutObjects(jid):
    getLayoutsObjectsQuery = """
        SELECT JLID, ConfigurationObject
        FROM junction_layouts
        WHERE JID = (%s)
    """
    connection = None

    try:
        connection = connect()  # Connect to the database

        # Use context manager to ensure the connection is committed or rolled back safely
        with connection:

            with createCursor(connection) as cursor:

                cursor.execute(getLayoutsObjectsQuery, (jid,))
                confObjects = cursor.fetchall()
                # If the query executes successfully, confObjectsList will be a list of 2-tuples
                if confObjects is not None:
                    # Create a JSON containing all of the configuration objects in a list
                    json = []
                    for jlid, confObject in confObjects:
                        confObject["JLID"] = jlid  # Add the extra jlid field so it's known which jlid each object represents
                        json.append(confObject)
                    return json

                # The configurationObjects cannot be obtained
                return None

    # Error handling
    except psycopg2.OperationalError as error:
        logging.error(f"Database operational error in getLayoutObjects for jid: {jid}: {error}")
        return None
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error in getLayoutObjects for jid: {jid}: {error}")
        return None
    finally:
        if connection is not None:
            connection.close()  # Connection still needs to be closed manually


def getVphObject(jid):
    getVphObjectQuery = """
        SELECT VPHObject
        FROM junctions
        WHERE JID = (%s)
    """

    connection = None
    try:
        connection = connect()  # Connect to the database

        # Use context manager to ensure the connection is committed or rolled back safely
        with connection:

            with createCursor(connection) as cursor:

                cursor.execute(getVphObjectQuery, (jid,))
                vphObject_tuple = cursor.fetchone()
                # If the query executes successfully, confObjectsList will be a 1-tuple
                if vphObject_tuple is not None:
                    # Create a JSON containing all of the configuration objects in a list
                    vphObject = vphObject_tuple[0]
                    return vphObject

                # The vphObject could not be obtained
                return None

    # Error handling
    except psycopg2.OperationalError as error:
        logging.error(f"Database operational error in getVphObject for jid: {jid}: {error}")
        return None
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error in getVphObject for jid: {jid}: {error}")
        return None
    finally:
        if connection is not None:
            connection.close()  # Connection still needs to be closed manually