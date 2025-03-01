import psycopg2
import logging
from config import config

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Set the logging level to INFO
    format="%(asctime)s - %(levelname)s - %(message)s"  # Formatting is optional
)


def connect():
    try:
        # A config file is used as it makes deployment easier - only the
        # config file will need to be changed rather than the code it self,
        # improving portability
        params = config()
        logging.info("Connecting to the postgreSQL database...")
        connection = psycopg2.connect(**params)
        return connection
    except psycopg2.OperationalError as error:
        logging.error(f"Operational error during connection: {error}")
        # raise  # Raising it means the caller can handle it also
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error during connection: {error}")


def createCursor(connection):
    try:
        cursor = connection.cursor()
        return cursor
    except psycopg2.OperationalError as error:
        logging.error(f"Operational error during cursor creation: {error}")
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error during cursor creation: {error}")


# Executes a .sql file
def executeSqlFile(filePath):

    connection = None
    try:
        connection = connect()
        with connection:

            with createCursor(connection) as cursor:

                with open(filePath, 'r') as file:
                    sql_commands = file.read()
                    cursor.execute(sql_commands)

    except psycopg2.OperationalError as error:
        logging.error(f"Operational error during cursor creation: {error}")
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error during cursor creation: {error}")
    finally:
        if connection:
            connection.close()


def initialiseDatabase():
    # Reading the file is better than the query into psycopg2.executeQuery()
    # because it enables version history to be tracked better, doesn't
    # clutter the python code (making debugging easier) and promotes
    # modularity as this python file can remain focused on application logic
    executeSqlFile("database/schema.sql")
