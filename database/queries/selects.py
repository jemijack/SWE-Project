from ..__init__ import connect, createCursor
import psycopg2
import logging  # More flexible than print statements


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


def getSimulationResults(jlid):
    getSimulationResultsQuery = """
        SELECT sr.ResultsObject
        FROM junction_layouts AS jl
        INNER JOIN simulation_results AS sr ON jl.JLID = sr.JLID
        WHERE jl.JLID = (%s)
    """
    connection = None

    try:
        connection = connect() # Connect to the database

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