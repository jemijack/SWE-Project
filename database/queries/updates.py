from ..__init__ import connect, createCursor
import psycopg2
import logging  # More flexible than print statements

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


def updateJState(jid, stid):
    return updateState(id=jid, isJunction=True, stateID=stid)


def updateJLState(jlid, stid):
    return updateState(id=jlid, isJunction=False, stateID=stid)


def updateState(id, isJunction, stateID):
    updateJStateQuery = """
        UPDATE junctions
        SET JStateID = (%s)
        WHERE JID = (%s)
    """

    updateJLStateQuery = """
        UPDATE junction_layouts
        SET JLStateID = (%s)
        WHERE JLID = (%s)
    """
   
    data = (stateID, id)

    # Select arguments based on whether a junction or junction layout is being updated
    if isJunction:
        query = updateJStateQuery
        subject = "Junction"
    else:
        query = updateJLStateQuery
        subject = "Layout"

    connection = None
    try:
        connection = connect()  # Connect to the database

        # Use context manager to ensure the connection is committed or rolled back safely
        with connection:

            with createCursor(connection) as cursor:

                cursor.execute(query, data)
                rows_affected = cursor.rowcount

                # If the query executes successfully, only one row should change since JID/JLID are primary keys
                if rows_affected == 1:
                    logging.info(f"The StateID for {subject}: {id}, was successfully changed to {stateID}")
                    return True

                logging.error(f"The StateID for {subject}: {id}, failed to change to {stateID}")
                return False

    # Error handling
    except psycopg2.OperationalError as error:
        logging.error(f"Database operational error in updateState on {subject}: {id}: {error}")
        return None
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error in updateState on {subject}: {id}: {error}")
        return None
    finally:
        if connection is not None:
            connection.close()  # Connection still needs to be closed manually