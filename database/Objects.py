from dataclasses import dataclass
from typing import Any, Optional
import logging
import json
from datetime import datetime


@dataclass
class VPHObject:
    name: Optional[str] = None
    uid: Optional[int] = None
    timestamp: Optional[str] = None
    json: Optional[dict] = None

    def populateFields(self):
        self.name = self.json["JName"]
        self.uid = self.json["userId"]
        self.timestamp = self.json["timestamp"]
        errOccur = False
        errString = ""
        if self.name is None:
            errString += "Name is None,"
            errOccur = True
        if self.uid is None:
            errString += " Uid is None,"
            errOccur = True
        if self.timestamp is None:
            errString += ""
            errOccur = True
        else:
            # Since psycopg2 can't convert a dictionary to a psql JSONB if
            # it contains a datetime valuie, which json["timestamp"] is
            # of. Since the self.timestamp now contains the field, it
            # should be fine to turn into a string now
            self.json["timestamp"] = self.json["timestamp"].isoformat()

        if errOccur:
            logging.error("Error: " + errString)
            return False
        logging.info(f"Name = {self.name}, UID = {self.uid}, timestamp = {self.timestamp}")
        return True


@dataclass
class LayoutObject:
    name: Optional[str] = None
    timestamp: Optional[str] = None
    uid: Optional[int] = None
    jid: Optional[int] = None
    jlname: Optional[str] = None
    json: Optional[dict] = None

    def populateFields(self):
        self.name = self.json["jLayoutName"]
        self.uid = self.json["userId"]
        self.timestamp = self.json["timestamp"]
        self.jid = self.json["junctionID"]
        self.jlname = self.json["jLayoutName"] # Temporary - it gets changed to it's real value when pulled from the database
        errOccur = False
        errString = ""
        if self.name is None:
            errString += "Name is None,"
            errOccur = True
        if self.uid is None:
            errString += "Uid is None,"
            errOccur = True
        if self.timestamp is None:
            errString += "Timestamp is None,"
            errOccur = True
        # else:
        #     # So that pyscopg2 can convert the json to a psql JSONB
        #     self.json["timestamp"] = self.json["timestamp"].isoformat()

        if self.jid is None:
            errString += "Jid is None"
            errOccur = True
        if errOccur:
            logging.error("Error: " + errString)
            return False
        return True

    # Convert from Ansha's JSON to Aadya's
    def format(self):
        newJson = {}
        newJson["jLayoutName"] = self.json["configurationName"]
        newJson["timestamp"] = self.timestamp
        newJson["userID"] = self.uid
        newJson["junctionID"] = self.jid

        # Arm specifics
        dirs = ["North", "East", "South", "West"]
        arms = ["northArm", "eastArm", "southArm", "westArm"]

        # Iterate through each arm
        for armCounter in range(len(dirs)):
            dir = dirs[armCounter]

            dirArm = {}  # Initialising the new object for each arm
            arm = self.json["configuration"][dir]
            dirArm["laneCount"] = len(arm["lanes"])
            dirArm["pedestrianCrossing"] = arm["pedestrianCrossing"]

            # Fill in the lane detail
            laneDetail = {}
            i = 0
            for lane in arm["lanes"]:
                i += 1

                # Iterates over the keys of the nested object - effectively checking the field of each lane type
                for laneType in lane:
                    if lane[laneType] is True:
                        laneDetail["lane" + str(i)] = laneType

            dirArm["laneDetail"] = laneDetail
            dirArm["priority"] = arm["priority"]
            newJson[arms[armCounter]] = dirArm

        print(json.dumps(newJson, indent=4))


@dataclass
class ResultsObject:
    jlid: Optional[int] = None
    timestamp: Optional[str] = None
    json: Optional[Any] = None
