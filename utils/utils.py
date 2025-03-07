from datetime import datetime, timezone


def formatFormData(form, uid):
    formData = {
        "jName": form.get("junctionSetName"),
        "timestamp": datetime.now(timezone.utc),
        "userId": uid,
        "priorities": {
            "averageWaitTime": int(form.get("AverageWait")),
            "maximumWaitTime": int(form.get("MaxWait")),
            "maximumQueueLength": int(form.get("MaxQueue"))
        },
        "pedestrianCrossingDuration": int(form.get("crossingDuration")),
        "trafficFlows": {
            "northArm": {
                "totalVph": int(form.get("northVehiclesIn")),
                "exitingVPH": {
                    "east": int(form.get("northLeftOut")),
                    "south": int(form.get("northStraightOut")),
                    "west": int(form.get("northRightOut"))
                },
                "vehicleSplit": {
                    "bus": int(form.get("northBusPercentage")),
                    "cycle": int(form.get("northCyclePercentage")),
                    "car": int(form.get("northCarPercentage"))
                },
                "pedestrianCrossingRPH": int(form.get("northRequestFrequency")),
                "priority": int(form.get("northPriority"))
            },
            "eastArm": {
                "totalVPH": int(form.get("eastVehiclesIn")),
                "exitingVPH": {
                    "north": int(form.get("eastRightOut")),
                    "south": int(form.get("eastLeftOut")),
                    "west": int(form.get("eastStraightOut")),
                },
                "vehicleSplit": {
                    "car": int(form.get("eastCarPercentage")),
                    "bus": int(form.get("eastBusPercentage")),
                    "cycle": int(form.get("eastCyclePercentage"))
                },
                "pedestrianCrossingRPH": int(form.get("eastRequestFrequency")),
                "priority": int(form.get("eastPriority"))
            },
            "southArm": {
                "totalVPH": int(form.get("southVehiclesIn")),
                "exitingVPH": {
                    "north": int(form.get("southStraightOut")),
                    "east": int(form.get("southRightOut")),
                    "west": int(form.get("southLeftOut"))
                },
                "vehicleSplit": {
                    "car": int(form.get("southCarPercentage")),
                    "bus": int(form.get("southBusPercentage")),
                    "cycle": int(form.get("southCyclePercentage"))
                },
                "pedestrianCrossingRPH": int(form.get("southRequestFrequency")),
                "priority": int(form.get("southPriority"))
            },
            "westArm": {
                "totalVPH": int(form.get("westVehiclesIn")),
                "exitingVPH": {
                    "north": int(form.get("westLeftOut")),
                    "east": int(form.get("westStraightOut")),
                    "south": int(form.get("westRightOut"))
                },
                "vehicleSplit": {
                    "car": int(form.get("westCarPercentage")),
                    "bus": int(form.get("westBusPercentage")),
                    "cycle": int(form.get("westCyclePercentage"))
                },
                "pedestrianCrossingRPH": int(form.get("westRequestFrequency")),
                "priority": int(form.get("westPriority"))
            }
        }
    }
    return formData
