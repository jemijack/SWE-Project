document.addEventListener("DOMContentLoaded", function () {
    /***********************
     * Configuration Data  *
     ***********************/
    const newConfig = {
        "jLayoutName": "layout1",
        "timestamp": "2025-02-13T12:00:00Z",
        "userId": "11",
        "junctionID": "56",
        "pedestrianCrossing": true, // Set to true to enable pedestrian crossings
        "northArm": {
            "laneCount": 3,
            "busLane": false,
            "cycleLane": true,
            "laneDetail": {
                "lane1": "straightOnly",
                "lane2": "leftStraight",
                "lane3": "rightOnly"
            }
        },
        "eastArm": {
            "laneCount": 3,
            "busLane": false,
            "cycleLane": false,
            "laneDetail": {
                "lane1": "leftOnly",
                "lane2": "straightOnly",
                "lane3": "rightOnly"
            }
        },
        "southArm": {
            "laneCount": 3,
            "busLane": false,
            "cycleLane": false,
            "laneDetail": {
                "lane1": "leftStraight",
                "lane2": "rightOnly"
            }
        },
        "westArm": {
            "laneCount": 3,
            "busLane": true,
            "cycleLane": false,
            "laneDetail": {
                "lane1": "leftStraight",
                "lane2": "straightOnly",
                "lane3": "rightOnly"
            }
        }
    };

    /***********************
     * SVG Setup & Globals *
     ***********************/
    const svgSize = 1000;
    const svg = d3.select("#junctionCanvas")
        .attr("width", svgSize)
        .attr("height", svgSize)
        .attr("viewBox", `0 0 ${svgSize} ${svgSize}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const laneWidth = 50;
    const curbWidth = 10;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;

    const maxLanes = Math.max(
        (newConfig["eastArm"] ? newConfig["eastArm"].laneCount : 0),
        (newConfig["southArm"] ? newConfig["southArm"].laneCount : 0),
        (newConfig["westArm"] ? newConfig["westArm"].laneCount : 0)
    );

    const intersectionSize = maxLanes * laneWidth * 2;
    const intersectionHalf = intersectionSize / 2;

    /***********************
     * Define Grass Pattern *
     ***********************/
    const defs = svg.append("defs");
    const pattern = defs.append("pattern")
        .attr("id", "grassPattern")
        .attr("width", 20)
        .attr("height", 20)
        .attr("patternUnits", "userSpaceOnUse");
    pattern.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#66BB66");
    pattern.append("path")
        .attr("d", "M0,5 L5,0 L10,5 L15,0 L20,5")
        .attr("stroke", "#228B22")
        .attr("stroke-width", 2)
        .attr("fill", "none");

    /***********************
     * Draw Background (Grass)
     ***********************/
    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", svgSize)
        .attr("height", svgSize)
        .attr("fill", "url(#grassPattern)");

    /***********************
     * Draw the Intersection
     ***********************/
    svg.append("rect")
        .attr("x", centerX - intersectionHalf)
        .attr("y", centerY - intersectionHalf)
        .attr("width", intersectionSize)
        .attr("height", intersectionSize)
        .attr("fill", "black")
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    /***********************
     * Helper Functions
     ***********************/
    function buildDashArray(dashLen, gapLen, totalLen) {
        const patternSize = dashLen + gapLen;
        const repeats = Math.floor(totalLen / patternSize);
        let arrParts = [];
        for (let i = 0; i < repeats; i++) {
            arrParts.push(dashLen, gapLen);
        }
        return arrParts.join(",");
    }

    function drawCenterLineNoPartial(x1, y1, x2, y2, marginStart, marginEnd, dashLen, gapLen, thickness) {
        let xStart = x1, yStart = y1, xEnd = x2, yEnd = y2;
        if (x1 === x2) { // Vertical
            yStart += marginStart;
            yEnd -= marginEnd;
            const lineLen = Math.abs(yEnd - yStart);
            if (lineLen <= 0) return;
            const dashArray = buildDashArray(dashLen, gapLen, lineLen);
            svg.append("line")
                .attr("x1", x1)
                .attr("y1", yStart)
                .attr("x2", x2)
                .attr("y2", yEnd)
                .attr("stroke", "white")
                .attr("stroke-width", thickness)
                .attr("stroke-dasharray", dashArray);
        } else if (y1 === y2) { // Horizontal
            xStart += marginStart;
            xEnd -= marginEnd;
            const lineLen = Math.abs(xEnd - xStart);
            if (lineLen <= 0) return;
            const dashArray = buildDashArray(dashLen, gapLen, lineLen);
            svg.append("line")
                .attr("x1", xStart)
                .attr("y1", y1)
                .attr("x2", xEnd)
                .attr("y2", y2)
                .attr("stroke", "white")
                .attr("stroke-width", thickness)
                .attr("stroke-dasharray", dashArray);
        }
    }

    function drawLaneDividers(x, y, width, height, lanes, vertical, laneDetail, approachDirection) {
        for (let i = 1; i < lanes; i++) {
            if (vertical) {
                let xpos = x + i * laneWidth;
                svg.append("line")
                    .attr("x1", xpos)
                    .attr("y1", y)
                    .attr("x2", xpos)
                    .attr("y2", y + height)
                    .attr("stroke", "white")
                    .attr("stroke-width", 4)
                    .attr("stroke-dasharray", "10,10");
            } else {
                let ypos = y + i * laneWidth;
                svg.append("line")
                    .attr("x1", x)
                    .attr("y1", ypos)
                    .attr("x2", x + width)
                    .attr("y2", ypos)
                    .attr("stroke", "white")
                    .attr("stroke-width", 4)
                    .attr("stroke-dasharray", "10,10");
            }
        }

        const dashLen = 80, gapLen = 60;
        const thickness = 6;
        const baseMargin = 20;
        const arrowClearance = 130;
        for (let i = 0; i < lanes; i++) {
            const laneKey = `lane${i + 1}`;
            const hasArrow = laneDetail && laneDetail[laneKey];
            if (vertical) {
                let centerLineX = x + i * laneWidth + laneWidth / 2;
                const marginStart = (approachDirection === "South" && hasArrow) ? arrowClearance : baseMargin;
                const marginEnd = (approachDirection === "North" && hasArrow) ? arrowClearance : baseMargin;
                drawCenterLineNoPartial(
                    centerLineX, y,
                    centerLineX, y + height,
                    marginStart, marginEnd, dashLen, gapLen, thickness
                );
            } else {
                let centerLineY = y + i * laneWidth + laneWidth / 2;
                const marginStart = (approachDirection === "East" && hasArrow) ? arrowClearance : baseMargin;
                const marginEnd = (approachDirection === "West" && hasArrow) ? arrowClearance : baseMargin;
                drawCenterLineNoPartial(
                    x, centerLineY,
                    x + width, centerLineY,
                    marginStart, marginEnd, dashLen, gapLen, thickness
                );
            }
        }
    }

    function drawIntersectionLines(cx, cy, length, horizontal, doubleLine) {
        const offset = 3;
        const halfLen = length / 2;
        const strokeWidth = 2;
        const dashPattern = "10,10";

        if (!doubleLine) {
            if (horizontal) {
                svg.append("line")
                    .attr("x1", cx - halfLen)
                    .attr("y1", cy)
                    .attr("x2", cx + halfLen)
                    .attr("y2", cy)
                    .attr("stroke", "white")
                    .attr("stroke-width", strokeWidth)
                    .attr("stroke-dasharray", dashPattern);
            } else {
                svg.append("line")
                    .attr("x1", cx)
                    .attr("y1", cy - halfLen)
                    .attr("x2", cx)
                    .attr("y2", cy + halfLen)
                    .attr("stroke", "white")
                    .attr("stroke-width", strokeWidth)
                    .attr("stroke-dasharray", dashPattern);
            }
        } else {
            if (horizontal) {
                svg.append("line")
                    .attr("x1", cx - halfLen)
                    .attr("y1", cy - offset)
                    .attr("x2", cx + halfLen)
                    .attr("y2", cy - offset)
                    .attr("stroke", "white")
                    .attr("stroke-width", strokeWidth)
                    .attr("stroke-dasharray", dashPattern);
                svg.append("line")
                    .attr("x1", cx - halfLen)
                    .attr("y1", cy + offset)
                    .attr("x2", cx + halfLen)
                    .attr("y2", cy + offset)
                    .attr("stroke", "white")
                    .attr("stroke-width", strokeWidth)
                    .attr("stroke-dasharray", dashPattern);
            } else {
                svg.append("line")
                    .attr("x1", cx - offset)
                    .attr("y1", cy - halfLen)
                    .attr("x2", cx - offset)
                    .attr("y2", cy + halfLen)
                    .attr("stroke", "white")
                    .attr("stroke-width", strokeWidth)
                    .attr("stroke-dasharray", dashPattern);
                svg.append("line")
                    .attr("x1", cx + offset)
                    .attr("y1", cy - halfLen)
                    .attr("x2", cx + offset)
                    .attr("y2", cy + halfLen)
                    .attr("stroke", "white")
                    .attr("stroke-width", strokeWidth)
                    .attr("stroke-dasharray", dashPattern);
            }
        }
    }

    /***********************
     * Pedestrian Crossing Functions
     ***********************/
    function drawZebraCrossing(x, y, width, height, horizontal) {
        const stripeWidth = 10;
        const stripeGap = 10;
        const stripeCount = Math.floor((horizontal ? height : width) / (stripeWidth + stripeGap));
        for (let i = 0; i < stripeCount; i++) {
            if (horizontal) {
                const stripeY = y + i * (stripeWidth + stripeGap);
                svg.append("rect")
                    .attr("x", x)
                    .attr("y", stripeY)
                    .attr("width", width)
                    .attr("height", stripeWidth)
                    .attr("fill", "white");
            } else {
                const stripeX = x + i * (stripeWidth + stripeGap);
                svg.append("rect")
                    .attr("x", stripeX)
                    .attr("y", y)
                    .attr("width", stripeWidth)
                    .attr("height", height)
                    .attr("fill", "white");
            }
        }
    }

    function drawPedestrianCrossing(direction) {
        if (!newConfig.pedestrianCrossing) return;

        const crossingWidth = laneWidth * 2; // Adjusted to a reasonable size
        const crossingHeight = curbWidth;

        switch (direction) {
            case "North":
                const northX = centerX - intersectionHalf;
                const northY = centerY - intersectionHalf - crossingHeight;
                drawZebraCrossing(northX, northY, intersectionSize, crossingHeight, true);
                break;
            case "East":
                const eastX = centerX + intersectionHalf;
                const eastY = centerY - intersectionHalf;
                drawZebraCrossing(eastX, eastY, crossingHeight, intersectionSize, false);
                break;
            case "South":
                const southX = centerX - intersectionHalf;
                const southY = centerY + intersectionHalf;
                drawZebraCrossing(southX, southY, intersectionSize, crossingHeight, true);
                break;
            case "West":
                const westX = centerX - intersectionHalf - crossingHeight;
                const westY = centerY - intersectionHalf;
                drawZebraCrossing(westX, westY, crossingHeight, intersectionSize, false);
                break;
        }
    }

    /***********************
     * Draw the Approaches
     ***********************/
    function drawApproach_North(laneCount, specialKey, laneDetail) {
        const maxLanes = Math.max(
            (newConfig["eastArm"] ? newConfig["eastArm"].laneCount : 0),
            (newConfig["southArm"] ? newConfig["southArm"].laneCount : 0),
            (newConfig["westArm"] ? newConfig["westArm"].laneCount : 0)
        );

        const lanes = laneCount;
        const totalLanes = lanes + maxLanes;
        const outerHeight = centerY - intersectionHalf;
        const outerWidth = totalLanes * laneWidth + 2 * curbWidth;
        const outerX = centerX - outerWidth / 2;
        const outerY = 0;

        svg.append("rect")
            .attr("x", outerX)
            .attr("y", outerY)
            .attr("width", curbWidth)
            .attr("height", outerHeight)
            .attr("fill", "#cccccc");

        svg.append("rect")
            .attr("x", outerX + totalLanes * laneWidth + curbWidth)
            .attr("y", outerY)
            .attr("width", curbWidth)
            .attr("height", outerHeight)
            .attr("fill", "#cccccc");

        const innerX = outerX + curbWidth;
        const innerY = outerY;
        const innerWidth = totalLanes * laneWidth;
        const innerHeight = outerHeight;

        svg.append("rect")
            .attr("x", innerX)
            .attr("y", innerY)
            .attr("width", innerWidth)
            .attr("height", innerHeight)
            .attr("fill", "black");

        drawLaneDividers(innerX, innerY, innerWidth, innerHeight, totalLanes, true, laneDetail, "North");

        const exitingCount = lanes;
        const markY = innerY + innerHeight;
        const markLen = 30;
        for (let i = 0; i < totalLanes; i++) {
            const isDouble = (i >= exitingCount);
            const laneCenterX = innerX + (i + 0.5) * laneWidth;
            drawIntersectionLines(laneCenterX, markY, markLen, true, isDouble);
        }

        for (let i = 0; i < lanes; i++) {
            const laneKey = `lane${i + 1}`;
            const laneType = laneDetail[laneKey];
            if (laneType) {
                const imgX = innerX + (i + 0.5) * laneWidth;
                const imgY = innerY + innerHeight - 60;
                const imgWidth = laneWidth * 0.8;
                const imgHeight = laneWidth * 0.8;
                svg.append("image")
                    .attr("xlink:href", `utils/${laneType}.png`)
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", `rotate(180, ${imgX}, ${imgY})`);
            }
        }

        if (specialKey) {
            const specialX = innerX + innerWidth - laneWidth;
            if (specialKey === "Bus") {
                svg.append("rect")
                    .attr("x", specialX)
                    .attr("y", innerY)
                    .attr("width", laneWidth)
                    .attr("height", innerHeight)
                    .attr("fill", "#FF6347");
                const imgX = specialX + laneWidth / 2;
                const imgY = innerY + innerHeight / 2;
                const imgWidth = laneWidth * 0.8;
                const imgHeight = laneWidth * 0.8;
                svg.append("image")
                    .attr("xlink:href", "utils/busLane.png")
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", `rotate(180, ${imgX}, ${imgY})`);
            } else if (specialKey === "Cycle") {
                svg.append("rect")
                    .attr("x", specialX)
                    .attr("y", innerY)
                    .attr("width", laneWidth)
                    .attr("height", innerHeight)
                    .attr("fill", "#4682B4");
                const imgX = specialX + laneWidth / 2;
                const imgY = innerY + innerHeight / 2;
                const imgWidth = laneWidth * 0.8;
                const imgHeight = laneWidth * 0.8;
                svg.append("image")
                    .attr("xlink:href", "utils/cycle.png")
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", `rotate(270, ${imgX}, ${imgY})`);
            }
        }

        // Draw pedestrian crossing
        drawPedestrianCrossing("North");
    }

    function drawApproach_East(laneCount, specialKey, laneDetail) {
        const maxLanes = Math.max(
            (newConfig["northArm"] ? newConfig["northArm"].laneCount : 0),
            (newConfig["southArm"] ? newConfig["southArm"].laneCount : 0),
            (newConfig["westArm"] ? newConfig["westArm"].laneCount : 0)
        );

        const lanes = laneCount;
        const totalLanes = lanes + maxLanes;
        const outerWidth = svgSize - (centerX + intersectionHalf);
        const outerHeight = totalLanes * laneWidth + 2 * curbWidth;
        const outerX = centerX + intersectionHalf;
        const outerY = centerY - outerHeight / 2;

        svg.append("rect")
            .attr("x", outerX)
            .attr("y", outerY)
            .attr("width", outerWidth)
            .attr("height", curbWidth)
            .attr("fill", "#cccccc");

        svg.append("rect")
            .attr("x", outerX)
            .attr("y", outerY + totalLanes * laneWidth + curbWidth)
            .attr("width", outerWidth)
            .attr("height", curbWidth)
            .attr("fill", "#cccccc");

        const southOuterWidth = totalLanes * laneWidth + 2 * curbWidth;
        const southOuterX = centerX - southOuterWidth / 2;
        const gapLeft = southOuterX - (outerX + outerWidth);
        if (gapLeft > 0) {
            svg.append("rect")
                .attr("x", outerX + outerWidth)
                .attr("y", outerY + lanes * laneWidth + curbWidth)
                .attr("width", gapLeft)
                .attr("height", curbWidth)
                .attr("fill", "#cccccc");
        }

        const innerX = outerX;
        const innerY = outerY + curbWidth;
        const innerWidth = outerWidth;
        const innerHeight = totalLanes * laneWidth;

        svg.append("rect")
            .attr("x", innerX)
            .attr("y", innerY)
            .attr("width", innerWidth)
            .attr("height", innerHeight)
            .attr("fill", "black");

        drawLaneDividers(innerX, innerY, innerWidth, innerHeight, totalLanes, false, laneDetail, "East");

        const enteringCount = lanes;
        const markLen = 30;
        const markX = innerX;
        for (let i = 0; i < totalLanes; i++) {
            const isDouble = (i >= enteringCount);
            const laneCenterY = innerY + (i + 0.5) * laneWidth;
            drawIntersectionLines(markX, laneCenterY, markLen, false, isDouble);
        }

        for (let i = 0; i < lanes; i++) {
            const laneKey = `lane${i + 1}`;
            const laneType = laneDetail[laneKey];
            if (laneType) {
                const imgX = innerX + 60;
                const imgY = innerY + (i + 0.5) * laneWidth;
                const imgWidth = laneWidth * 0.8;
                const imgHeight = laneWidth * 0.8;
                svg.append("image")
                    .attr("xlink:href", `utils/${laneType}.png`)
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", `rotate(270, ${imgX}, ${imgY})`);
            }
        }

        if (specialKey) {
            const specialY = innerY + innerHeight - laneWidth;
            if (specialKey === "Bus") {
                svg.append("rect")
                    .attr("x", innerX)
                    .attr("y", specialY)
                    .attr("width", innerWidth)
                    .attr("height", laneWidth)
                    .attr("fill", "#FF6347");
                const imgX = innerX + innerWidth / 2;
                const imgY = specialY + laneWidth / 2;
                const imgWidth = laneWidth * 0.8;
                const imgHeight = laneWidth * 0.8;
                svg.append("image")
                    .attr("xlink:href", "utils/busLane.png")
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", `rotate(270, ${imgX}, ${imgY})`);
            } else if (specialKey === "Cycle") {
                svg.append("rect")
                    .attr("x", innerX)
                    .attr("y", specialY)
                    .attr("width", innerWidth)
                    .attr("height", laneWidth)
                    .attr("fill", "#4682B4");
                const imgX = innerX + innerWidth / 2;
                const imgY = specialY + laneWidth / 2;
                const imgWidth = laneWidth * 0.8;
                const imgHeight = laneWidth * 0.8;
                svg.append("image")
                    .attr("xlink:href", "utils/cycle.png")
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight);
            }
        }

        // Draw pedestrian crossing
        drawPedestrianCrossing("East");
    }

    function drawApproach_South(laneCount, specialKey, laneDetail) {
        const maxLanes = Math.max(
            (newConfig["northArm"] ? newConfig["northArm"].laneCount : 0),
            (newConfig["eastArm"] ? newConfig["eastArm"].laneCount : 0),
            (newConfig["westArm"] ? newConfig["westArm"].laneCount : 0)
        );

        const lanes = laneCount;
        const totalLanes = lanes + maxLanes;
        const outerHeight = svgSize - (centerY + intersectionHalf);
        const outerWidth = totalLanes * laneWidth + 2 * curbWidth;
        const outerX = centerX - outerWidth / 2;
        const outerY = centerY + intersectionHalf;

        svg.append("rect")
            .attr("x", outerX)
            .attr("y", outerY)
            .attr("width", curbWidth)
            .attr("height", outerHeight)
            .attr("fill", "#cccccc");

        svg.append("rect")
            .attr("x", outerX + totalLanes * laneWidth + curbWidth)
            .attr("y", outerY)
            .attr("width", curbWidth)
            .attr("height", outerHeight)
            .attr("fill", "#cccccc");

        const innerX = outerX + curbWidth;
        const innerY = outerY;
        const innerWidth = totalLanes * laneWidth;
        const innerHeight = outerHeight;

        svg.append("rect")
            .attr("x", innerX)
            .attr("y", innerY)
            .attr("width", innerWidth)
            .attr("height", innerHeight)
            .attr("fill", "black");

        drawLaneDividers(innerX, innerY, innerWidth, innerHeight, totalLanes, true, laneDetail, "South");

        const exitingCount = lanes;
        const markY = innerY;
        const markLen = 30;
        for (let i = 0; i < totalLanes; i++) {
            const isDouble = (i < exitingCount);
            const laneCenterX = innerX + (i + 0.5) * laneWidth;
            drawIntersectionLines(laneCenterX, markY, markLen, true, isDouble);
        }

        for (let i = 0; i < lanes; i++) {
            const laneKey = `lane${i + 1}`;
            const laneType = laneDetail[laneKey];
            if (laneType) {
                const imgX = innerX + (i + 0.5) * laneWidth;
                const imgY = innerY + 60;
                const imgWidth = laneWidth * 0.8;
                const imgHeight = laneWidth * 0.8;
                svg.append("image")
                    .attr("xlink:href", `utils/${laneType}.png`)
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight);
            }
        }

        if (specialKey) {
            const specialX = innerX + innerWidth - laneWidth;
            if (specialKey === "Bus") {
                svg.append("rect")
                    .attr("x", specialX)
                    .attr("y", innerY)
                    .attr("width", laneWidth)
                    .attr("height", innerHeight)
                    .attr("fill", "#FF6347");
                const imgX = specialX + laneWidth / 2;
                const imgY = innerY + innerHeight / 2;
                const imgWidth = laneWidth * 0.8;
                const imgHeight = laneWidth * 0.8;
                svg.append("image")
                    .attr("xlink:href", "utils/busLane.png")
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight);
            } else if (specialKey === "Cycle") {
                svg.append("rect")
                    .attr("x", specialX)
                    .attr("y", innerY)
                    .attr("width", laneWidth)
                    .attr("height", innerHeight)
                    .attr("fill", "#4682B4");
                const imgX = specialX + laneWidth / 2;
                const imgY = innerY + innerHeight / 2;
                const imgWidth = laneWidth * 0.8;
                const imgHeight = laneWidth * 0.8;
                svg.append("image")
                    .attr("xlink:href", "utils/cycle.png")
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", `rotate(90, ${imgX}, ${imgY})`);
            }
        }

        // Draw pedestrian crossing
        drawPedestrianCrossing("South");
    }

    function drawApproach_West(laneCount, specialKey, laneDetail) {
        const maxLanes = Math.max(
            (newConfig["northArm"] ? newConfig["northArm"].laneCount : 0),
            (newConfig["eastArm"] ? newConfig["eastArm"].laneCount : 0),
            (newConfig["southArm"] ? newConfig["southArm"].laneCount : 0),
        );

        const lanes = laneCount;
        const totalLanes = lanes + maxLanes;
        const outerWidth = centerX - intersectionHalf;
        const outerHeight = totalLanes * laneWidth + 2 * curbWidth;
        const outerX = 0;
        const outerY = centerY - outerHeight / 2;

        svg.append("rect")
            .attr("x", outerX)
            .attr("y", outerY)
            .attr("width", outerWidth)
            .attr("height", curbWidth)
            .attr("fill", "#cccccc");

        svg.append("rect")
            .attr("x", outerX)
            .attr("y", outerY + totalLanes * laneWidth + curbWidth)
            .attr("width", outerWidth)
            .attr("height", curbWidth)
            .attr("fill", "#cccccc");

        const innerX = outerX;
        const innerY = outerY + curbWidth;
        const innerWidth = outerWidth;
        const innerHeight = totalLanes * laneWidth;

        svg.append("rect")
            .attr("x", innerX)
            .attr("y", innerY)
            .attr("width", innerWidth)
            .attr("height", innerHeight)
            .attr("fill", "black");

        drawLaneDividers(innerX, innerY, innerWidth, innerHeight, totalLanes, false, laneDetail, "West");

        const enteringCount = lanes;
        const markLen = 30;
        const markX = innerX + innerWidth;
        for (let i = 0; i < totalLanes; i++) {
            const isDouble = (i < enteringCount);
            const laneCenterY = innerY + (i + 0.5) * laneWidth;
            drawIntersectionLines(markX, laneCenterY, markLen, false, isDouble);
        }

        for (let i = 0; i < lanes; i++) {
            const laneKey = `lane${i + 1}`;
            const laneType = laneDetail[laneKey];
            if (laneType) {
                const imgX = innerX + innerWidth - 60;
                const imgY = innerY + (i + 0.5) * laneWidth;
                const imgWidth = laneWidth * 0.8;
                const imgHeight = laneWidth * 0.8;
                svg.append("image")
                    .attr("xlink:href", `utils/${laneType}.png`)
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", `rotate(90, ${imgX}, ${imgY})`);
            }
        }

        if (specialKey) {
            const specialY = innerY + innerHeight - laneWidth;
            if (specialKey === "Bus") {
                svg.append("rect")
                    .attr("x", innerX)
                    .attr("y", specialY)
                    .attr("width", innerWidth)
                    .attr("height", laneWidth)
                    .attr("fill", "#FF6347");
                const imgX = innerX + innerWidth / 2;
                const imgY = specialY + laneWidth / 2;
                const imgWidth = laneWidth * 0.8;
                const imgHeight = laneWidth * 0.8;
                svg.append("image")
                    .attr("xlink:href", "utils/busLane.png")
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", `rotate(90, ${imgX}, ${imgY})`);
            } else if (specialKey === "Cycle") {
                svg.append("rect")
                    .attr("x", innerX)
                    .attr("y", specialY)
                    .attr("width", innerWidth)
                    .attr("height", laneWidth)
                    .attr("fill", "#4682B4");
                const imgX = innerX + innerWidth / 2;
                const imgY = specialY + laneWidth / 2;
                const imgWidth = laneWidth * 0.8;
                const imgHeight = laneWidth * 0.8;
                svg.append("image")
                    .attr("xlink:href", "utils/cycle.png")
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", `rotate(180, ${imgX}, ${imgY})`);
            }
        }

        // Draw pedestrian crossing
        drawPedestrianCrossing("West");
    }

    // Render each approach if it exists
    if (newConfig["northArm"]) {
        const arm = newConfig["northArm"];
        const specialKey = arm.busLane ? "Bus" : (arm.cycleLane ? "Cycle" : null);
        drawApproach_North(arm.laneCount, specialKey, arm.laneDetail);
    }
    if (newConfig["eastArm"]) {
        const arm = newConfig["eastArm"];
        const specialKey = arm.busLane ? "Bus" : (arm.cycleLane ? "Cycle" : null);
        drawApproach_East(arm.laneCount, specialKey, arm.laneDetail);
    }
    if (newConfig["southArm"]) {
        const arm = newConfig["southArm"];
        const specialKey = arm.busLane ? "Bus" : (arm.cycleLane ? "Cycle" : null);
        drawApproach_South(arm.laneCount, specialKey, arm.laneDetail);
    }
    if (newConfig["westArm"]) {
        const arm = newConfig["westArm"];
        const specialKey = arm.busLane ? "Bus" : (arm.cycleLane ? "Cycle" : null);
        drawApproach_West(arm.laneCount, specialKey, arm.laneDetail);
    }
});