from configparser import ConfigParser
from pathlib import Path


def dbConfig(filename="cs261database.ini", section="postgresql"):

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
