

document.addEventListener("DOMContentLoaded", function () {
    /***********************
     * Configuration Data  *
     ***********************/
    const junctionConfigurations = [
      {
        configurationName: "JunctionName1",
        configuration: {
          "North": {
            lanes: 3,
            leftTurnLane: false,
            rightTurnLane: false,
            specialLane: { "Bus": { vph: 30 } },
            pedestrianCrossing: false,
            priority: 1
          },
          "East": {
            lanes: 3,
            leftTurnLane: false,
            rightTurnLane: false,
            specialLane: { "Cycle": { vph: 120 } },
            pedestrianCrossing: false,
            priority: 2
          },
          "West": {
            lanes: 3,
            leftTurnLane: false,
            rightTurnLane: false,
            specialLane: null,
            pedestrianCrossing: true,
            priority: 3
          }
          ,
          "South": {
            lanes: 3,
            leftTurnLane: false,
            rightTurnLane: false,
            specialLane: null,
            pedestrianCrossing: true,
            priority: 3
          }
          // No "South" approach
        }
      }
    ];
    const config = junctionConfigurations[0].configuration;
  
  
    /***********************
     * SVG Setup & Globals *
     ***********************/
    const svgSize = 1000;
    const svg = d3.select("#junctionCanvas")
      .attr("width", svgSize)
      .attr("height", svgSize)
      .attr("viewBox", `0 0 ${svgSize} ${svgSize}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
  
  
    // Dimensions
    const laneWidth = 50;  
    const curbWidth = 10;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
  
  
    // Intersection size = max number of lanes * laneWidth
    const maxLanes = Math.max(
      (config["North"] ? config["North"].lanes : 0),
      (config["East"] ? config["East"].lanes : 0),
      (config["West"] ? config["West"].lanes : 0)
    );
    const intersectionSize = maxLanes * laneWidth;
    const intersectionHalf = intersectionSize / 2;
  
  
    /***********************
     * Draw Background (Grass)
     ***********************/
    svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", svgSize)
      .attr("height", svgSize)
      .attr("fill", "#66BB66"); // Darker green
  
  
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
  
  
    // If no "South" approach, curb that edge
    if (!config["South"]) {
      svg.append("rect")
        .attr("x", centerX - intersectionHalf)
        .attr("y", centerY + intersectionHalf)
        .attr("width", intersectionSize)
        .attr("height", curbWidth)
        .attr("fill", "#cccccc");
    }
  
  
    /***********************
     * Helper Functions
     ***********************/
  
  
    /**
     * Build a stroke-dasharray string that ensures no partial dashes.
     * - dashLen, gapLen: each dash and gap length
     * - totalLen: length of the line to be dashed
     * - We only repeat the pattern as many full times as fits in totalLen (omitting leftovers).
     */
    function buildDashArray(dashLen, gapLen, totalLen) {
      // Number of full repeats we can fit
      const patternSize = dashLen + gapLen;
      const repeats = Math.floor(totalLen / patternSize);
      // Build repeated pattern
      let arrParts = [];
      for (let i = 0; i < repeats; i++) {
        arrParts.push(dashLen, gapLen);
      }
      // stroke-dasharray is a comma-separated list
      return arrParts.join(",");
    }
  
  
    /**
     * Draw a center line with no partial dashes.
     * - margin: gap from each edge so it doesn't start/end at the rectangle boundary
     * - dashLen, gapLen: lengths of dash and gap
     * - thickness: stroke-width
     */
    function drawCenterLineNoPartial(x1, y1, x2, y2, margin, dashLen, gapLen, thickness) {
      // We'll reduce the line length by margin on each end
      // Then compute how many full dashes we can fit
      let xStart = x1, yStart = y1, xEnd = x2, yEnd = y2;
      // If it's vertical
      if (x1 === x2) {
        // Move yStart + margin, yEnd - margin
        yStart += margin;
        yEnd -= margin;
        const lineLen = Math.abs(yEnd - yStart);
        if (lineLen <= 0) return; // margin too large => no line
        const dashArray = buildDashArray(dashLen, gapLen, lineLen);
        svg.append("line")
          .attr("x1", x1)
          .attr("y1", yStart)
          .attr("x2", x2)
          .attr("y2", yEnd)
          .attr("stroke", "white")
          .attr("stroke-width", thickness)
          .attr("stroke-dasharray", dashArray);
      }
      else if (y1 === y2) {
        // horizontal line
        xStart += margin;
        xEnd -= margin;
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
  
  
    /**
     * Draw internal lane dividers + a center dashed line in each lane.
     * - Boundary dividers: stroke-width=4, dash="10,10"
     * - Center lines: stroke-width=6, with bigger dash/gap, no partial dash
     */
    function drawLaneDividers(x, y, width, height, lanes, vertical) {
      // 1) Lane boundary dividers (like before)
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
  
  
      // 2) Center dashed line in EACH lane, with no partial dashes
      //    We define big dashLen/gapLen, e.g. dashLen=80, gapLen=60
      const dashLen = 80, gapLen = 60;
      const thickness = 6;
      const margin = 20; // gap from each edge
  
  
      for (let i = 0; i < lanes; i++) {
        if (vertical) {
          let centerLineX = x + i * laneWidth + laneWidth / 2;
          drawCenterLineNoPartial(
            centerLineX, y,
            centerLineX, y + height,
            margin, dashLen, gapLen, thickness
          );
        } else {
          let centerLineY = y + i * laneWidth + laneWidth / 2;
          drawCenterLineNoPartial(
            x, centerLineY,
            x + width, centerLineY,
            margin, dashLen, gapLen, thickness
          );
        }
      }
    }
  
  
    /**
     * Draw single or double lines physically (NOT just a dash pattern) at the intersection edge.
     * - If single => one dashed line
     * - If double => two parallel dashed lines
     */
    function drawIntersectionLines(cx, cy, length, horizontal, doubleLine) {
      const offset = 3; // gap between the two parallel lines if double
      const halfLen = length / 2;
      const strokeWidth = 2; // intersection lines remain thinner
      const dashPattern = "10,10"; // keep the old intersection style
  
  
      if (!doubleLine) {
        // Single line
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
          // Vertical
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
        // Double lines => two parallel lines offset by 'offset'
        if (horizontal) {
          // Two horizontal lines offset in Y
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
          // Two vertical lines offset in X
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
     * Draw the Approaches
     ***********************/
  
  
    /**
     * North approach (vertical).
     */
    function drawApproach_North(lanes, specialLane) {
      const outerHeight = centerY - intersectionHalf;
      const outerWidth = lanes * laneWidth + 2 * curbWidth;
      const outerX = centerX - outerWidth / 2;
      const outerY = 0;
  
  
      // Gray curb
      svg.append("rect")
        .attr("x", outerX)
        .attr("y", outerY)
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .attr("fill", "#cccccc");
  
  
      // Inner black road flush at bottom with intersection
      const innerX = outerX + curbWidth;
      const innerY = outerY + curbWidth;
      const innerWidth = lanes * laneWidth;
      const innerHeight = outerHeight - curbWidth;
  
  
      svg.append("rect")
        .attr("x", innerX)
        .attr("y", innerY)
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", "black");
  
  
      // Lane dividers + center lines
      drawLaneDividers(innerX, innerY, innerWidth, innerHeight, lanes, true);
  
  
      // Intersection-edge lines
      const exitingCount = Math.floor(lanes / 2);
      const markY = innerY + innerHeight;  
      const markLen = 30;
      for (let i = 0; i < lanes; i++) {
        const isDouble = (i < exitingCount);
        const laneCenterX = innerX + (i + 0.5) * laneWidth;
        drawIntersectionLines(laneCenterX, markY, markLen, true, isDouble);
      }
  
  
      // Special lane in the rightmost lane
      if (specialLane) {
        const specialKey = Object.keys(specialLane)[0];
        const specialColor = (specialKey.toLowerCase() === "bus") ? "yellow"
          : (specialKey.toLowerCase() === "cycle") ? "dodgerblue"
          : "orange";
        const specialX = innerX + innerWidth - laneWidth;
        svg.append("rect")
          .attr("x", specialX)
          .attr("y", innerY)
          .attr("width", laneWidth)
          .attr("height", innerHeight)
          .attr("fill", specialColor);
  
  
        // Rotated label
        svg.append("text")
          .attr("x", specialX + laneWidth / 2)
          .attr("y", innerY + innerHeight / 2)
          .attr("fill", "white")
          .attr("font-size", "16px")
          .attr("font-weight", "bold")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("transform", `rotate(90, ${specialX + laneWidth / 2}, ${innerY + innerHeight / 2})`)
          .text(specialKey.toUpperCase() + " LANE");
      }
    }
  
  
    /**
     * East approach (horizontal).
     */
    function drawApproach_East(lanes, specialLane) {
      const outerWidth = svgSize - (centerX + intersectionHalf);
      const outerHeight = lanes * laneWidth + 2 * curbWidth;
      const outerX = centerX + intersectionHalf;
      const outerY = centerY - outerHeight / 2;
  
  
      svg.append("rect")
        .attr("x", outerX)
        .attr("y", outerY)
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .attr("fill", "#cccccc");
  
  
      // Inner black road flush on the left with intersection
      const innerX = outerX;
      const innerY = outerY + curbWidth;
      const innerWidth = outerWidth - curbWidth;
      const innerHeight = lanes * laneWidth;
  
  
      svg.append("rect")
        .attr("x", innerX)
        .attr("y", innerY)
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", "black");
  
  
      // Lane dividers + center lines
      drawLaneDividers(innerX, innerY, innerWidth, innerHeight, lanes, false);
  
  
      // Intersection-edge lines (left side)
      const enteringCount = Math.ceil(lanes / 2);
      const markLen = 30;
      const markX = innerX;
      for (let i = 0; i < lanes; i++) {
        const isDouble = (i >= enteringCount);
        const laneCenterY = innerY + (i + 0.5) * laneWidth;
        drawIntersectionLines(markX, laneCenterY, markLen, false, isDouble);
      }
  
  
      // Special lane in the bottom lane
      if (specialLane) {
        const specialKey = Object.keys(specialLane)[0];
        const specialColor = (specialKey.toLowerCase() === "bus") ? "yellow"
          : (specialKey.toLowerCase() === "cycle") ? "dodgerblue"
          : "orange";
        const specialX = innerX;
        const specialY = innerY + innerHeight - laneWidth;
        svg.append("rect")
          .attr("x", specialX)
          .attr("y", specialY)
          .attr("width", innerWidth)
          .attr("height", laneWidth)
          .attr("fill", specialColor);
  
  
        svg.append("text")
          .attr("x", specialX + innerWidth / 2)
          .attr("y", specialY + laneWidth / 2)
          .attr("fill", "white")
          .attr("font-size", "16px")
          .attr("font-weight", "bold")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .text(specialKey.toUpperCase() + " LANE");
      }
    }
  
  
    /**
     * West approach (horizontal).
     */
    function drawApproach_West(lanes, specialLane) {
      const outerWidth = centerX - intersectionHalf;
      const outerHeight = lanes * laneWidth + 2 * curbWidth;
      const outerX = 0;
      const outerY = centerY - outerHeight / 2;
  
  
      svg.append("rect")
        .attr("x", outerX)
        .attr("y", outerY)
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .attr("fill", "#cccccc");
  
  
      // Inner black road flush on the right with intersection
      const innerX = outerX + curbWidth;
      const innerY = outerY + curbWidth;
      const innerWidth = outerWidth - curbWidth;
      const innerHeight = lanes * laneWidth;
  
  
      svg.append("rect")
        .attr("x", innerX)
        .attr("y", innerY)
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", "black");
  
  
      // Lane dividers + center lines
      drawLaneDividers(innerX, innerY, innerWidth, innerHeight, lanes, false);
  
  
      // Intersection-edge lines (right side)
      const exitingCount = Math.floor(lanes / 2);
      const markLen = 30;
      const markX = innerX + innerWidth;
      for (let i = 0; i < lanes; i++) {
        const isDouble = (i < exitingCount);
        const laneCenterY = innerY + (i + 0.5) * laneWidth;
        drawIntersectionLines(markX, laneCenterY, markLen, false, isDouble);
      }
  
  
      // Special lane in the top lane
      if (specialLane) {
        const specialKey = Object.keys(specialLane)[0];
        const specialColor = (specialKey.toLowerCase() === "bus") ? "yellow"
          : (specialKey.toLowerCase() === "cycle") ? "dodgerblue"
          : "orange";
        const specialX = innerX;
        const specialY = innerY;
        const specialW = innerWidth;
        const specialH = laneWidth;
        svg.append("rect")
          .attr("x", specialX)
          .attr("y", specialY)
          .attr("width", specialW)
          .attr("height", specialH)
          .attr("fill", specialColor);
  
  
        svg.append("text")
          .attr("x", specialX + specialW / 2)
          .attr("y", specialY + specialH / 2)
          .attr("fill", "white")
          .attr("font-size", "16px")
          .attr("font-weight", "bold")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .text(specialKey.toUpperCase() + " LANE");
      }
    }
  
  
    // Render each approach if it exists
    if (config["North"]) {
      drawApproach_North(config["North"].lanes, config["North"].specialLane);
    }
    if (config["East"]) {
      drawApproach_East(config["East"].lanes, config["East"].specialLane);
    }
    if (config["West"]) {
      drawApproach_West(config["West"].lanes, config["West"].specialLane);
    }
  });
  