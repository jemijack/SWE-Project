from ..__init__ import connect, createCursor
from ..Objects import VPHObject, ConfigurationObject
import psycopg2
import logging  # More flexible than print statements
import json

# Hard Coded Junction States
J_NEW = 1
J_NOT_STARTED = 2
J_IN_PROGRESS = 3
J_FINISHED = 4

# Hard Coded Layout States
L_NOT_STARTED = 1
L_IN_PROGRESS = 2
L_FINISHED = 3
L_SIMULATION_ERROR = 4
L_SCORE_CALCULATION_ERROR = 5


def insertUser(username):
    selectUserQuery = """
        SELECT UID
        FROM users
        WHERE Username = (%s)
    """
    insertUserQuery = """
        INSERT INTO users (Username)
        VALUES (%s)
        RETURNING UID
    """
    connection = None

    try:
        connection = connect()

        # Using this "with" syntax makes use of python's context manager with
        # the psycopg2 library. In the psycopg2 context, it commits on a
        # successfuly block exit and rollsback while freeing resources
        # if an exceptions is raised - making it rather handy
        with connection:

            # A cursor lets us perform queries
            with createCursor(connection) as cursor:

                # Check if the user already exists by their email
                # As per the documentation, when positional variable
                # binding (using %s in tuples) the second argument must
                # be a sequence
                cursor.execute(selectUserQuery, (username,))
                uid_tuple = cursor.fetchone()
                if uid_tuple is not None:
                    uid = uid_tuple[0]
                    logging.info(f"User already in database with uid: {uid}")
                    return uid

                # The user does not already exist, so we must add them
                cursor.execute(insertUserQuery, (username,))
                uid_tuple = cursor.fetchone()

                # If the query executes successfully return what's in the tuple
                if uid_tuple is not None:
                    uid = uid_tuple[0]
                    logging.info(f"New user inserted with uid: {uid}")
                    return uid
                else:
                    logging.warning("No uid returned.")
                    return None

    except psycopg2.OperationalError as error:
        logging.error(f"Database operational error in insertUser: {error}")
        return None
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error in insertUser: {error}")
        return None
    finally:
        if connection is not None:
            connection.close()  # Still need to close the connection manually


# Inserts a junction into the database using its VPHObject
def insertJunction(vphObject):
    insertJunctionQuery = """
        INSERT INTO junctions (UID, JName, VPHObject, JStateID, CreatedAt, LastUpdatedAt)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING JID
    """

    jsonString = json.dumps(vphObject.json)
    #print(vphObject.json)

    connection = None

    try:
        connection = connect()  # Connecting to the database

        # Use context manager to ensure the connection is committed or rolled back safely
        with connection:

            # A cursor lets us perform queries
            with createCursor(connection) as cursor:

                # Define data to be inserted
                data = (vphObject.uid, vphObject.name, jsonString, J_NEW,
                        vphObject.timestamp, vphObject.timestamp)

                cursor.execute(insertJunctionQuery, data)

                jid_tuple = cursor.fetchone()  # Query returns one tuple

                # If the query executes successfully return what's in the tuple
                if jid_tuple is not None:
                    jid = jid_tuple[0]
                    logging.info(f"New junction inserted with jid: {jid}")
                    return jid
                else:
                    logging.warning("No junction id returned.")
                    return None

    except psycopg2.OperationalError as error:
        logging.error(f"Database operational error in insertJunction: {error}")
        return None
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error in insertJunction: {error}")
        return None
    finally:
        if connection is not None:
            connection.close()  # Still need to close the connection manually


def insertLayout(layoutObject):
    insertLayoutQuery = """
        INSERT INTO junction_layouts (JID, ConfigurationObject, JLStateID, CreatedAt, LastUpdatedAt)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING JLID
    """

    # Define data to be inserted
    data = (layoutObject.jid, layoutObject, L_NOT_STARTED,
            layoutObject.timestamp, layoutObject.timestamp)

    connection = None

    try:
        connection = connect()  # Connecting to the database

        # Use context manager to ensure the connection is committed or rolled back safely
        with connection:

            # A cursor lets us perform queries
            with createCursor(connection) as cursor:

                cursor.execute(insertLayoutQuery, data)
                jlid_tuple = cursor.fetchone()  # Query returns one tuple

                # If the query executes successfully return what's in the tuple
                if jlid_tuple is not None:
                    jlid = jlid_tuple[0]
                    logging.info(f"New junction layout inserted with jlid: {jlid}")
                    return jlid
                else:
                    logging.warning("No junction layout id returned.")
                    return None

    except psycopg2.OperationalError as error:
        logging.error(f"Database operational error in insertLayout: {error}")
        return None
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error in insertLayout: {error}")
        return None
    finally:
        if connection is not None:
            connection.close()  # Still need to close the connection manually


def insertSimulationResults(resultsObject):
    insertSimResQuery = """
        INSERT INTO simulation_results (JLID, ResultsObject)
        VALUES (%s, %s)
        RETURNING JID
    """
    data = (resultsObject.jlid, resultsObject)
    connection = None

    try:
        connection = connect()

        # Use context manager to ensure the connection is committed or rolled back safely        
        with connection:

            # A cursor lets us perform queries
            with createCursor(connection) as cursor:

                cursor.execute(insertSimResQuery, data)

                sid_tuple = cursor.fetchone()  # Query returns one tuple

                # If the query executes successfully return what's in the tuple
                if sid_tuple is not None:
                    sid = sid_tuple[0]
                    logging.info(f"New simulation result inserted with sid: {sid}")
                    return sid
                else:
                    logging.warning("No simulation id returned.")
                    return None

    except psycopg2.OperationalError as error:
        logging.error(f"Database operational error in insertSimulationResults: {error}")
        return None
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error in insertSimulationResults: {error}")
        return None
    finally:
        if connection is not None:
            connection.close()  # Still need to close the connection manually


def insertJunctionState(jState):
    insertJStateQuery = """
        INSERT INTO junction_states (JStateName, JStateDescription)
        VALUES (%s, %s)
        RETURNING JStateID
    """
    data = (jState.name, jState.description)
    connection = None

    try:
        connection = connect()

        with connection:

            # A cursor lets us perform queries
            with createCursor(connection) as cursor:

                cursor.execute(insertJStateQuery, data)

                jStateID_tuple = cursor.fetchone()  # Query returns one tuple

                # If the query executes successfully return what's in the tuple
                if jStateID_tuple is not None:
                    jStateID = jStateID_tuple[0]
                    logging.info(f"New junction state inserted with JStateID: {jStateID}")
                    return jStateID
                else:
                    logging.warning("No Junction State ID returned.")
                    return None

    except psycopg2.OperationalError as error:
        logging.error(f"Database operational error in insertJunctionState: {error}")
        return None
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error in insertJunctionState: {error}")
        return None
    finally:
        if connection is not None:
            connection.close()  # Still need to close the connection manually


def insertJunctionLayoutState(jlState):
    insertJLStateQuery = """
        INSERT INTO junction_layout_states (JLStateName, JLStateDescription)
        VALUES (%s, %s)
        RETURNING JLStateID
    """
    data = (jlState.name, jlState.description)
    connection = None

    try:
        connection = connect()

        with connection:

            # A cursor lets us perform queries
            with createCursor(connection) as cursor:

                cursor.execute(insertJLStateQuery, data)

                jlStateID_tuple = cursor.fetchone()  # Query returns one tuple

                # If the query executes successfully return what's in the tuple
                if jlStateID_tuple is not None:
                    jlStateID = jlStateID_tuple[0]
                    logging.info(f"New junction state inserted with JLStateID: {jlStateID}")
                    return jlStateID
                else:
                    logging.warning("No Junction Layout State ID returned.")
                    return None

    except psycopg2.OperationalError as error:
        logging.error(f"Database operational error in insertJunctionLayoutState: {error}")
        return None
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error in insertJunctionLayoutState: {error}")
        return None
    finally:
        if connection is not None:
            connection.close()  # Still need to close the connection manually