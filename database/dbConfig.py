from configparser import ConfigParser
from pathlib import Path
import psycopg2
import logging


def createDB():
    try:
        # Need to create to the default 'postgres' database in order
        # to create cs261 and make it's schema
        conn = psycopg2.connect(
            database="postgres",
            user="postgres",
            password="password",
            host="localhost",
            port="5432"
        )

        conn.autocommit = True
        cursor = conn.cursor()

        logging.info("Creating Database cs261...")
        cursor.execute("CREATE DATABASE cs261")
        logging.info("Successfully Created Database cs261")
        cursor.close()
        conn.close()

    except psycopg2.OperationalError as error:
        logging.error(f"Operational error during connection: {error}")
    except psycopg2.DatabaseError as error:
        logging.error(f"General database error during connection: {error}")


def dbConfig(filename="cs261database.ini", section="postgresql"):

    # Connect to
    # Use pathlib to resolve filepaths, making the code more robust
    # Get the absolute path of the directory
    script_dir = Path(__file__).resolve().parent

    # Appends the filename argument to the path of the directory containing this script
    absPath = script_dir / filename

    # Create a parser
    parser = ConfigParser()

    # Read config file
    parser.read(absPath)

    # If the section does not exist, return an appropriate error message
    if not parser.has_section(section):
        raise ValueError(f"Section {section} is not found in the {absPath} file")

    # The parser has found what it needs to, so parse the file
    params = parser.items(section)

    # ConfigParser.items() stores the key-value pairs in a list of 2-tuples, this puts it in a dictionary`  1346789`
    database = {}
    for param in params:
        database[param[0]] = param[1]

    # Check the supplied file contains all of the keys necessary
    requiredKeys = ["host", "database", "user", "password", "port"]
    for key in requiredKeys:
        if key not in database:
            raise ValueError(f"Missing required key '{key}' in configuring the database")

    return database
