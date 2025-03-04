function initializeJunction(config) {
    /*** Configuration Data ***/
    /** 
    const config = {
        "jLayoutName": "layout1",
        "timestamp": "2025-02-13T12:00:00Z",
        "userId": "11",
        "junctionID": "56",
        "northArm": { "laneCount": 3, "laneDetail": { "lane1": "busLane", "lane2": "straightOnly" }, "pedestrianCrossing": true },
        "eastArm": { "laneCount": 3, "laneDetail": { "lane1": "cycleLane", "lane2": "straightOnly", "lane3": "rightOnly" }, "pedestrianCrossing": true },
        "southArm": { "laneCount": 3, "laneDetail": { "lane1": "leftStraight", "lane2": "rightOnly" }, "pedestrianCrossing": true },
        "westArm": { "laneCount": 3, "laneDetail": { "lane1": "leftStraight", "lane2": "straightOnly", "lane3": "rightOnly" }, "pedestrianCrossing": true }
    };
    */

    /*** SVG Setup & Globals ***/
    window.drawPedestrianCrossing = drawPedestrianCrossing;

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
        (config["eastArm"] ? config["eastArm"].laneCount : 0),
        (config["southArm"] ? config["southArm"].laneCount : 0),
        (config["westArm"] ? config["westArm"].laneCount : 0),
        (config["northArm"] ? config["northArm"].laneCount : 0)
    );

    const intersectionSize = maxLanes * laneWidth * 2;
    const intersectionHalf = intersectionSize / 2;

    /*** Define Grass Pattern ***/
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

    /*** Draw Background (Grass) ***/
    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", svgSize)
        .attr("height", svgSize)
        .attr("fill", "url(#grassPattern)");

    /*** Draw the Intersection ***/
    svg.append("rect")
        .attr("x", centerX - intersectionHalf)
        .attr("y", centerY - intersectionHalf)
        .attr("width", intersectionSize)
        .attr("height", intersectionSize)
        .attr("fill", "black")
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    /*** Helper Functions ***/

    function buildDashArray(dashLen, gapLen, totalLen) {
        const patternSize = dashLen + gapLen;
        const repeats = Math.floor(totalLen / patternSize);
        let arrParts = [];
        for (let i = 0; i < repeats; i++) {
            arrParts.push(dashLen, gapLen);
        }
        return arrParts.join(",");
    }

    function drawPedestrianCrossing(direction, totalLaneCount, laneWidth, innerX, innerY, innerWidth, innerHeight) {
    
        // Check if pedestrian crossing is enabled for this direction
        const armKey = direction.toLowerCase() + "Arm";
        if (!config[armKey]?.pedestrianCrossing) {
            return;
        }
    
        // Define crossing dimensions and position
        const crossingSize = 100; // Increased size for a larger crossing
        const stripeWidth = 15;
        const stripeGap = 10; // Increased gap to have fewer stripes
        const offsetFromIntersection = 100; // Moved further back from intersection
    
        let crossingX, crossingY, crossingWidth, crossingHeight;


        // Position the crossing based on direction
        switch (direction) {
            case "North":
                crossingX = innerX;
                crossingY = innerY + innerHeight - offsetFromIntersection - crossingSize;
                crossingWidth = innerWidth;
                crossingHeight = crossingSize;
                break;
            case "South":
                crossingX = innerX;
                crossingY = innerY + offsetFromIntersection;
                crossingWidth = innerWidth;
                crossingHeight = crossingSize;
                break;
            case "East":
                crossingX = innerX + offsetFromIntersection;
                crossingY = innerY;
                crossingWidth = crossingSize;
                crossingHeight = innerHeight;
                break;
            case "West":
                crossingX = innerX + innerWidth - offsetFromIntersection - crossingSize;
                crossingY = innerY;
                crossingWidth = crossingSize;
                crossingHeight = innerHeight;
                break;
            default:
                return;
        }
    

        // Draw the black base rectangle
        svg.append("rect")
            .attr("x", crossingX)
            .attr("y", crossingY)
            .attr("width", crossingWidth)
            .attr("height", crossingHeight)
            .attr("fill", "black");
           
      
     
        
            // Determine stripe orientation: parallel to lanes
        const isHorizontal = (direction === "North" || direction === "South");
        const stripeDimension = isHorizontal ? crossingWidth : crossingHeight;
        const stripeCount = Math.floor(stripeDimension / (stripeWidth + stripeGap));
    
       

        // Draw stripes parallel to the lanes
        for (let i = 0.2; i < stripeCount; i++) {
            if (isHorizontal) {
                // North/South: Vertical stripes
                const stripeX = crossingX + i * (stripeWidth + stripeGap);
                svg.append("rect")
                    .attr("x", stripeX)
                    .attr("y", crossingY)
                    .attr("width", stripeWidth)
                    .attr("height", crossingHeight)
                    .attr("fill", "white");
            } else {
                // East/West: Horizontal stripes
                const stripeY = crossingY + i * (stripeWidth + stripeGap);
                svg.append("rect")
                    .attr("x", crossingX)
                    .attr("y", stripeY)
                    .attr("width", crossingWidth)
                    .attr("height", stripeWidth)
                    .attr("fill", "white");
            }
        }
    }

    function drawLaneDividers(x, y, width, height, totalLanes, vertical, laneDetail, approachDirection) {
        const enteringLanes = config[approachDirection.toLowerCase() + "Arm"].laneCount;
        // Draw boundary dividers (lines between adjacent lanes)
        
        
        for (let i = 1; i < totalLanes; i++) {
            let isDashed = true;
            if (i===totalLanes-enteringLanes && approachDirection!="South") isDashed = false;
            else if (i===enteringLanes && approachDirection=="South") isDashed = false;
            if (vertical) {
                let xpos = x + i * laneWidth;
                let yStart = y, yEnd = y + height;
                svg.append("line")
                    .attr("x1", xpos)
                    .attr("y1", yStart)
                    .attr("x2", xpos)
                    .attr("y2", yEnd)
                    .attr("stroke", "white")
                    .attr("stroke-width", 4)
                    .attr("stroke-dasharray", isDashed ? "10,10" : "none");
            } else {
                let ypos = y + i * laneWidth;
                let xStart = x, xEnd = x + width;
                svg.append("line")
                    .attr("x1", xStart)
                    .attr("y1", ypos)
                    .attr("x2", xEnd)
                    .attr("y2", ypos)
                    .attr("stroke", "white")
                    .attr("stroke-width", 4)
                    .attr("stroke-dasharray", isDashed ? "10,10" : "none");
            }
        }
    
    }

    function drawIntersectionLines(cx, cy, length, horizontal, doubleLine) {
        const offset = 3, halfLen = length / 2, strokeWidth = 2, dashPattern = "10,10";
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
                svg.append("line").attr("x1", cx - halfLen).attr("y1", cy - offset).attr("x2", cx + halfLen).attr("y2", cy - offset)
                    .attr("stroke", "white").attr("stroke-width", strokeWidth).attr("stroke-dasharray", dashPattern);
                svg.append("line").attr("x1", cx - halfLen).attr("y1", cy + offset).attr("x2", cx + halfLen).attr("y2", cy + offset)
                    .attr("stroke", "white").attr("stroke-width", strokeWidth).attr("stroke-dasharray", dashPattern);
            } else {
                svg.append("line").attr("x1", cx - offset).attr("y1", cy - halfLen).attr("x2", cx - offset).attr("y2", cy + halfLen)
                    .attr("stroke", "white").attr("stroke-width", strokeWidth).attr("stroke-dasharray", dashPattern);
                svg.append("line").attr("x1", cx + offset).attr("y1", cy - halfLen).attr("x2", cx + offset).attr("y2", cy + halfLen)
                    .attr("stroke", "white").attr("stroke-width", strokeWidth).attr("stroke-dasharray", dashPattern);
            }
        }
    }



    /*** Draw the Approaches ***/
    window.drawApproach_North = drawApproach_North;
    function drawApproach_North(laneCount, laneDetail) {
        const lanes = laneCount;
        const totalLanes = lanes + maxLanes;
        const outerHeight = centerY - intersectionHalf;
        const outerWidth = totalLanes * laneWidth + 2 * curbWidth;
        const outerX = centerX - outerWidth / 2;
        const outerY = 0;



        svg.append("rect").attr("x", outerX).attr("y", outerY).attr("width", curbWidth).attr("height", outerHeight).attr("fill", "#333333");
        svg.append("rect").attr("x", outerX + totalLanes * laneWidth + curbWidth).attr("y", outerY).attr("width", curbWidth).attr("height", outerHeight).attr("fill", "#333333");

        const innerX = outerX + curbWidth;
        const innerY = outerY;
        const innerWidth = totalLanes * laneWidth;
        const innerHeight = outerHeight;
        

        svg.append("rect").attr("x", innerX).attr("y", innerY).attr("width", innerWidth).attr("height", innerHeight).attr("fill", "black");
        
        for (let k = 0; k < lanes; k++) {
            let i = totalLanes - 1 - k;
            let laneKey = `lane${k + 1}`;
            let laneType = laneDetail[laneKey];
            if (k === 0 && (laneType === "busLane" || laneType === "cycleLane")) {
                let color = laneType === "busLane" ? "#FF6347" : "#4682B4";
                svg.append("rect")
                    .attr("x", innerX + i * laneWidth)
                    .attr("y", innerY)
                    .attr("width", laneWidth)
                    .attr("height", innerHeight)
                    .attr("fill", color);
                let imgX = innerX + (i + 0.5) * laneWidth;
                let imgY = innerY + innerHeight - 80;
                let imgWidth = laneWidth * 0.8;
                let imgHeight = laneWidth * 0.8;
                let icon = laneType === "busLane" ? "busLane.png" : "cycle.png";
                let transform = `rotate(180, ${imgX}, ${imgY})`;
                svg.append("image")
                    .attr("xlink:href", `static/images/${icon}`)
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", transform);
            } else if (laneType) {
                let imgX = innerX + (i + 0.5) * laneWidth;
                let imgY = innerY + innerHeight - 80;
                let imgWidth = laneWidth * 0.8;
                let imgHeight = laneWidth * 0.8;
                svg.append("image")
                    .attr("xlink:href", `static/images/${laneType}.png`)
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", `rotate(180, ${imgX}, ${imgY})`);
            }
        }

        drawLaneDividers(innerX, innerY, innerWidth, innerHeight, totalLanes, true, laneDetail, "North");


        const exitingCount = lanes;
        const markY = innerY + innerHeight;
        const markLen = 30;
        for (let i = 0; i < totalLanes; i++) {
            const isDouble = (i >= totalLanes - exitingCount);
            const laneCenterX = innerX + (i + 0.5) * laneWidth;
            drawIntersectionLines(laneCenterX, markY, markLen, true, isDouble);
        }

        // Deficit calculation
        const deficit = intersectionSize - innerWidth  - (2 * curbWidth); // -30
        if (deficit !== 0) {
            // Top rectangle (covers curb area y=340-350)
            svg.append("rect")
                .attr("x",centerX-intersectionHalf)
                .attr("y", outerY)
                .attr("width",(intersectionSize  - totalLanes*laneWidth)/2)
                .attr("height",outerHeight ) // 10 units
                .attr("fill", "#333333");
   
            // Bottom rectangle (covers curb area y=650-660)
            svg.append("rect")
                .attr("x", outerX + totalLanes * laneWidth + 2*curbWidth)
                .attr("y", outerY)
                .attr("width", (intersectionSize  - totalLanes*laneWidth)/2)
                .attr("height", outerHeight)
               .attr("fill", "#333333");
        
           }

        drawPedestrianCrossing("North", totalLanes, laneWidth, innerX, innerY, innerWidth, innerHeight);
        
    }

    window.drawApproach_East = drawApproach_East;
    function drawApproach_East(laneCount, laneDetail) {
        const lanes = laneCount;
        const totalLanes = lanes + maxLanes;
        const outerWidth = centerX - intersectionHalf;
        const outerHeight = totalLanes * laneWidth + 2 * curbWidth;
        const outerX = centerX + intersectionHalf;
        const outerY = centerY - outerHeight / 2;

        svg.append("rect").attr("x", outerX).attr("y", outerY).attr("width", outerWidth).attr("height", curbWidth).attr("fill", "#333333");
        svg.append("rect").attr("x", outerX).attr("y", outerY + totalLanes * laneWidth + curbWidth).attr("width", outerWidth).attr("height", curbWidth).attr("fill", "#333333");

        const innerX = outerX;
        const innerY = outerY + curbWidth;
        const innerWidth = outerWidth;
        const innerHeight = totalLanes * laneWidth;

        svg.append("rect").attr("x", innerX).attr("y", innerY).attr("width", innerWidth).attr("height", innerHeight).attr("fill", "black");

        for (let k = 0; k < lanes; k++) {
            let i = totalLanes - 1 - k;
            let laneKey = `lane${k + 1}`;
            let laneType = laneDetail[laneKey];
            if (k === 0 && (laneType === "busLane" || laneType === "cycleLane")) {
                let color = laneType === "busLane" ? "#FF6347" : "#4682B4";
                svg.append("rect")
                    .attr("x", innerX)
                    .attr("y", innerY + i * laneWidth)
                    .attr("width", innerWidth)
                    .attr("height", laneWidth)
                    .attr("fill", color);
                let imgX = innerX + 80;
                let imgY = innerY + (i + 0.5) * laneWidth;
                let imgWidth = laneWidth * 0.8;
                let imgHeight = laneWidth * 0.8;
                let icon = laneType === "busLane" ? "busLane.png" : "cycle.png";
                let transform = `rotate(270, ${imgX}, ${imgY})`;
                svg.append("image")
                    .attr("xlink:href", `static/images/${icon}`)
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", transform);
            } else if (laneType) {
                let imgX = innerX + 80;
                let imgY = innerY + (i + 0.5) * laneWidth;
                let imgWidth = laneWidth * 0.8;
                let imgHeight = laneWidth * 0.8;
                svg.append("image")
                    .attr("xlink:href", `static/images/${laneType}.png`)
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", `rotate(270, ${imgX}, ${imgY})`);
            }
        }

        drawLaneDividers(innerX, innerY, innerWidth, innerHeight, totalLanes, false, laneDetail, "East");

        const exitingCount = lanes;
        const markX = innerX;
        const markLen = 30;
        for (let i = 0; i < totalLanes; i++) {
            const isDouble = (i >= totalLanes - exitingCount);
            const laneCenterY = innerY + (i + 0.5) * laneWidth;
            drawIntersectionLines(markX, laneCenterY, markLen, false, isDouble);
        }

        // Deficit calculation
        const deficit = intersectionSize - innerWidth  - (2 * curbWidth); // -30
        if (deficit !== 0) {
            // Top rectangle (covers curb area y=340-350)
            svg.append("rect")
                .attr("x", outerX)
                .attr("y", centerY - intersectionHalf) // 340
                .attr("width", outerWidth)
                .attr("height", (intersectionSize  - totalLanes*laneWidth)/2 ) // 10 units
                .attr("fill", "#333333");
   
            // Bottom rectangle (covers curb area y=650-660)
            svg.append("rect")
                .attr("x", outerX)
                .attr("y",outerY + totalLanes * laneWidth + curbWidth)
                .attr("width", outerWidth)
                .attr("height", (intersectionSize  - totalLanes*laneWidth)/2)
               .attr("fill", "#333333");
        
           }
    
    
        drawPedestrianCrossing("East", totalLanes, laneWidth, innerX, innerY, innerWidth, innerHeight);
    
    
    }
    
    window.drawApproach_South = drawApproach_South;
    function drawApproach_South(laneCount, laneDetail) {
        const lanes = laneCount;
        const totalLanes = lanes + maxLanes;
        const outerHeight = centerY - intersectionHalf;
        const outerWidth = totalLanes * laneWidth + 2 * curbWidth;
        const outerX = centerX - outerWidth / 2;
        const outerY = centerY + intersectionHalf;

        svg.append("rect").attr("x", outerX).attr("y", outerY).attr("width", curbWidth).attr("height", outerHeight).attr("fill", "#333333");
        svg.append("rect").attr("x", outerX + totalLanes * laneWidth + curbWidth).attr("y", outerY).attr("width", curbWidth).attr("height", outerHeight).attr("fill", "#333333");

        const innerX = outerX + curbWidth;
        const innerY = outerY;
        const innerWidth = totalLanes * laneWidth;
        const innerHeight = outerHeight;

        svg.append("rect").attr("x", innerX).attr("y", innerY).attr("width", innerWidth).attr("height", innerHeight).attr("fill", "black");

        for (let k = 0; k < lanes; k++) {
            let i = k;
            let laneKey = `lane${k + 1}`;
            let laneType = laneDetail[laneKey];
            if (k === 0 && (laneType === "busLane" || laneType === "cycleLane")) {
                let color = laneType === "busLane" ? "#FF6347" : "#4682B4";
                svg.append("rect")
                    .attr("x", innerX + i * laneWidth)
                    .attr("y", innerY)
                    .attr("width", laneWidth)
                    .attr("height", innerHeight)
                    .attr("fill", color);
                let imgX = innerX + (i + 0.5) * laneWidth;
                let imgY = innerY + 80;
                let imgWidth = laneWidth * 0.8;
                let imgHeight = laneWidth * 0.8;
                let icon = laneType === "busLane" ? "busLane.png" : "cycle.png";
                let transform = `rotate(0, ${imgX}, ${imgY})`;
                svg.append("image")
                    .attr("xlink:href", `static/images/${icon}`)
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", transform);
            } else if (laneType) {
                let imgX = innerX + (i + 0.5) * laneWidth;
                let imgY = innerY + 80;
                let imgWidth = laneWidth * 0.8;
                let imgHeight = laneWidth * 0.8;
                svg.append("image")
                    .attr("xlink:href", `static/images/${laneType}.png`)
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", `rotate(0, ${imgX}, ${imgY})`);
            }
        }

        drawLaneDividers(innerX, innerY, innerWidth, innerHeight, totalLanes, true, laneDetail, "South");

        const exitingCount = lanes;
        const markY = innerY;
        const markLen = 30;
        for (let i = 0; i < totalLanes; i++) {
            const isDouble = (i < exitingCount);
            const laneCenterX = innerX + (i + 0.5) * laneWidth;
            drawIntersectionLines(laneCenterX, markY, markLen, true, isDouble);
        }
    
        drawPedestrianCrossing("South", totalLanes, laneWidth, innerX, innerY, innerWidth, innerHeight);
        
            
         // Deficit calculation
         const deficit = intersectionSize - innerWidth  - (2 * curbWidth); // -30
         if (deficit !== 0) {
             // Top rectangle (covers curb area y=340-350)
             svg.append("rect")
                 .attr("x",centerX-intersectionHalf)
                 .attr("y", outerY)
                 .attr("width",(intersectionSize  - totalLanes*laneWidth)/2)
                 .attr("height",outerHeight ) // 10 units
                 .attr("fill", "#333333");
    
             // Bottom rectangle (covers curb area y=650-660)
             svg.append("rect")
                 .attr("x", outerX + totalLanes * laneWidth + 2*curbWidth)
                 .attr("y", outerY)
                 .attr("width", (intersectionSize  - totalLanes*laneWidth)/2)
                 .attr("height", outerHeight)
                .attr("fill", "#333333");
         
            }

        
    
    }
    
    window.drawApproach_West = drawApproach_West;
    function drawApproach_West(laneCount, laneDetail) {
        const lanes = laneCount;
        const totalLanes = lanes + maxLanes;
        const outerWidth = centerX - intersectionHalf;
        const outerHeight = totalLanes * laneWidth + 2 * curbWidth;
        const outerX = 0;
        const outerY = centerY - outerHeight / 2;

        svg.append("rect").attr("x", outerX).attr("y", outerY).attr("width", outerWidth).attr("height", curbWidth).attr("fill", "#333333");
        svg.append("rect").attr("x", outerX).attr("y", outerY + totalLanes * laneWidth + curbWidth).attr("width", outerWidth).attr("height", curbWidth).attr("fill", "#333333");

        const innerX = outerX;
        const innerY = outerY + curbWidth;
        const innerWidth = outerWidth;
        const innerHeight = totalLanes * laneWidth;

        svg.append("rect").attr("x", innerX).attr("y", innerY).attr("width", innerWidth).attr("height", innerHeight).attr("fill", "black");

        for (let k = 0; k < lanes; k++) {
            let i = k;
            let laneKey = `lane${k + 1}`;
            let laneType = laneDetail[laneKey];
            if (k === 0 && (laneType === "busLane" || laneType === "cycleLane")) {
                let color = laneType === "busLane" ? "#FF6347" : "#4682B4";
                svg.append("rect")
                    .attr("x", innerX)
                    .attr("y", innerY + i * laneWidth)
                    .attr("width", innerWidth)
                    .attr("height", laneWidth)
                    .attr("fill", color);
                let imgX = innerX + innerWidth - 80;
                let imgY = innerY + (i + 0.5) * laneWidth;
                let imgWidth = laneWidth * 0.8;
                let imgHeight = laneWidth * 0.8;
                let icon = laneType === "busLane" ? "busLane.png" : "cycle.png";
                let transform = `rotate(90, ${imgX}, ${imgY})`;
                svg.append("image")
                    .attr("xlink:href", `static/images/${icon}`)
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", transform);
            } else if (laneType) {
                let imgX = innerX + innerWidth - 80;
                let imgY = innerY + (i + 0.5) * laneWidth;
                let imgWidth = laneWidth * 0.8;
                let imgHeight = laneWidth * 0.8;
                svg.append("image")
                    .attr("xlink:href", `static/images/${laneType}.png`)
                    .attr("x", imgX - imgWidth / 2)
                    .attr("y", imgY - imgHeight / 2)
                    .attr("width", imgWidth)
                    .attr("height", imgHeight)
                    .attr("transform", `rotate(90, ${imgX}, ${imgY})`);
            }
        }

        drawLaneDividers(innerX, innerY, innerWidth, innerHeight, totalLanes, false, laneDetail, "West");

        const exitingCount = lanes;
        const markX = innerX + innerWidth;
        const markLen = 30;
        for (let i = 0; i < totalLanes; i++) {
            const isDouble = (i >= totalLanes - exitingCount);
            const laneCenterY = innerY + (i + 0.5) * laneWidth;
            drawIntersectionLines(markX, laneCenterY, markLen, false, isDouble);
        }

         // Deficit calculation
         const deficit = intersectionSize - innerWidth  - (2 * curbWidth); // -30
         if (deficit !== 0) {
             // Top rectangle (covers curb area y=340-350)
             svg.append("rect")
                 .attr("x", outerX)
                 .attr("y", centerY - intersectionHalf) // 340
                 .attr("width", outerWidth)
                 .attr("height", (intersectionSize  - totalLanes*laneWidth)/2 ) // 10 units
                 .attr("fill", "#333333");
    
             // Bottom rectangle (covers curb area y=650-660)
             svg.append("rect")
                 .attr("x", outerX)
                 .attr("y",outerY + totalLanes * laneWidth + curbWidth)
                 .attr("width", outerWidth)
                 .attr("height", (intersectionSize  - totalLanes*laneWidth)/2)
                .attr("fill", "#333333");
         
            }


        
        
        drawPedestrianCrossing("West", totalLanes, laneWidth, innerX, innerY, innerWidth, innerHeight);
    
    }

    /*** Render Approaches ***/
    if (config["northArm"]) drawApproach_North(config["northArm"].laneCount, config["northArm"].laneDetail);
    if (config["eastArm"]) drawApproach_East(config["eastArm"].laneCount, config["eastArm"].laneDetail);
    if (config["southArm"]) drawApproach_South(config["southArm"].laneCount, config["southArm"].laneDetail);
    if (config["westArm"]) drawApproach_West(config["westArm"].laneCount, config["westArm"].laneDetail);

}

/*** Make Function Globally Available ***/
window.initializeJunction = initializeJunction;

/*** Automatically Run When DOM Loads ***/
document.addEventListener("DOMContentLoaded", initializeJunction);

