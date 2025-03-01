from configparser import ConfigParser


def config(filename="cs261database.ini", section="postgresql"):

    # Create a parser
    parser = ConfigParser()

    # Read config file
    parser.read(filename)

    # Store the results in a dictionary
    database = {}

    # If the section does not exist, return an appropriate error message
    if not parser.has_section("postgresql"):
        raise ValueError(f"Section {section} is not found in the {filename} file")
    
    # The parser has found what it needs to, so populate the dictionary
    params = parser.items(section)
    for param in params:
        database[param[0]] = param[1]

    requiredKeys = ["host", "database", "user", "password", "port"]
    for key in requiredKeys:
        if key not in database:
            raise ValueError(f"Missing required key '{key}' in configuring the database")
    return database