document.addEventListener("DOMContentLoaded", function () {
    // Global variables
    let junctionData = null;
    let junctionConfigs = null;
    let currentLayoutIndex = 0;
    const chartObjects = {};
    let comparisonChartObjects = {};  // For layout comparison charts

    // Fetch junction data and configurations
    function fetchJunctionData() {
        // Fetch junction performance data
        const fetchPerformanceData = fetch('/static/data/junction-data.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response not ok for junction data');
                }
                return response.json();
            });
            
        // Fetch junction configuration data
        const fetchConfigData = fetch('/static/data/configs.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response not ok for configuration data');
                }
                return response.json();
            });
            
        // Wait for both fetches to complete
        Promise.all([fetchPerformanceData, fetchConfigData])
            .then(([performanceData, configData]) => {
                junctionData = performanceData;
                junctionConfigs = configData;
                initializeDashboard();
            })
            .catch(error => {
                console.error('Error loading data:', error);
                document.getElementById('junction-info').textContent = 'Error loading junction data. Please try again.';
            });
    }

    // Initialize the dashboard
    function initializeDashboard() {
        // Update junction info
        document.getElementById('junction-info').textContent = `${junctionData.junctionName} (ID: ${junctionData.JID})`;
        
        // Set up layout selector
        const layoutSelect = document.getElementById('layout-select');
        junctionData.layouts.forEach((layout, index) => {
            // Find matching configuration for this layout
            const layoutJLID = layout.metadata.JLID;
            const matchingConfig = junctionConfigs.find(config => config.JLID === layoutJLID);
            const layoutName = matchingConfig ? matchingConfig.jLayoutName : `Layout ${index + 1}`;
            
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${layoutName} (${layout.metadata.JLID})`;
            layoutSelect.appendChild(option);
        });
        
        // Set up event listener for layout selection
        layoutSelect.addEventListener('change', function() {
            currentLayoutIndex = parseInt(this.value);
            updateDashboard();
        });
        
        // Initial dashboard render
        updateDashboard();
        
        // Add layout comparison section
        addLayoutComparisonCharts();
    }

    // Update dashboard with selected layout data
    function updateDashboard() {
        const layout = junctionData.layouts[currentLayoutIndex];
        const layoutDisplay = document.getElementById('layout-display');
        
        // Clear previous content (preserving comparison charts if they exist)
        const comparisonContainer = document.querySelector('.layout-comparison-container');
        if (comparisonContainer) {
            comparisonContainer.remove();  // Temporarily remove
        }
        
        layoutDisplay.innerHTML = '';
        
        // Create layout container
        const layoutContainer = document.createElement('div');
        layoutContainer.className = 'layout-container';
        
        // Find matching configuration for this layout
        const layoutJLID = layout.metadata.JLID;
        const matchingConfig = junctionConfigs.find(config => config.JLID === layoutJLID);
        const layoutName = matchingConfig ? matchingConfig.jLayoutName : `Layout ${currentLayoutIndex + 1}`;
        
        // Add layout header
        const layoutHeader = document.createElement('div');
        layoutHeader.className = 'layout-header';
        layoutHeader.innerHTML = `
            <h2>${layoutName} (ID: ${layout.metadata.JLID})</h2>
            <p>Simulation time: ${layout.metadata.totalSimulationTime} ${layout.metadata.timeUnit} | Timestamp: ${new Date(layout.metadata.timestamp).toLocaleString()}</p>
        `;
        layoutContainer.appendChild(layoutHeader);
        
        // Create content container
        const layoutContent = document.createElement('div');
        layoutContent.className = 'layout-content';
        
        // Add junction visualization section
        const junctionSection = document.createElement('div');
        junctionSection.className = 'junction-section';
        junctionSection.innerHTML = `
            <h3>Junction Layout</h3>
            <div id="junction-visualization-${currentLayoutIndex}"></div>
        `;
        layoutContent.appendChild(junctionSection);
        
        // Add metrics section
        const metricsSection = document.createElement('div');
        metricsSection.className = 'metrics-section';
        
        // Add summary metrics
        const metricsSummary = createMetricsSummary(layout);
        metricsSection.appendChild(metricsSummary);
        
        // Add charts container
        const chartsContainer = document.createElement('div');
        chartsContainer.className = 'charts-container';
        
        // Add average wait time chart
        const avgWaitTimeChart = document.createElement('div');
        avgWaitTimeChart.className = 'chart-wrapper';
        avgWaitTimeChart.innerHTML = `
            <div class="chart-title">Average Wait Time by Direction</div>
            <canvas id="avg-wait-chart-${currentLayoutIndex}"></canvas>
        `;
        chartsContainer.appendChild(avgWaitTimeChart);
        
        // Add max wait time chart
        const maxWaitTimeChart = document.createElement('div');
        maxWaitTimeChart.className = 'chart-wrapper';
        maxWaitTimeChart.innerHTML = `
            <div class="chart-title">Maximum Wait Time by Direction</div>
            <canvas id="max-wait-chart-${currentLayoutIndex}"></canvas>
        `;
        chartsContainer.appendChild(maxWaitTimeChart);
        
        // Add max queue length chart
        const maxQueueChart = document.createElement('div');
        maxQueueChart.className = 'chart-wrapper';
        maxQueueChart.innerHTML = `
            <div class="chart-title">Maximum Queue Length by Direction</div>
            <canvas id="max-queue-chart-${currentLayoutIndex}"></canvas>
        `;
        chartsContainer.appendChild(maxQueueChart);
        
        // Add performance score chart
        const scoreChart = document.createElement('div');
        scoreChart.className = 'chart-wrapper';
        scoreChart.innerHTML = `
            <div class="chart-title">Performance Score by Direction</div>
            <canvas id="score-chart-${currentLayoutIndex}"></canvas>
        `;
        chartsContainer.appendChild(scoreChart);
        
        // Add charts to metrics section
        metricsSection.appendChild(chartsContainer);
        
        // Add metrics section to layout content
        layoutContent.appendChild(metricsSection);
        
        // Add layout content to layout container
        layoutContainer.appendChild(layoutContent);
        
        // Add layout container to display
        layoutDisplay.appendChild(layoutContainer);
        
        // Re-add comparison charts if they existed
        if (comparisonContainer) {
            layoutDisplay.appendChild(comparisonContainer);
        }
        
        // Create junction visualization
        createJunctionVisualization(currentLayoutIndex);
        
        // Create charts
        createCharts(layout, currentLayoutIndex);
    }

    // Create metrics summary section
    function createMetricsSummary(layout) {
        const metricsSummary = document.createElement('div');
        metricsSummary.className = 'metrics-summary';
        
        // Calculate overall averages
        const directions = ['north', 'south', 'east', 'west'];
        let totalAvgWaitTime = 0;
        let totalMaxWaitTime = 0;
        let totalMaxQueueLength = 0;
        let laneCount = 0;
        
        directions.forEach(direction => {
            if (layout.results[direction]) {
                layout.results[direction].lanes.forEach(lane => {
                    totalAvgWaitTime += lane.averageWaitTime;
                    totalMaxWaitTime = Math.max(totalMaxWaitTime, lane.maxWaitTime);
                    totalMaxQueueLength = Math.max(totalMaxQueueLength, lane.maxQueueLength);
                    laneCount++;
                });
            }
        });
        
        const overallAvgWaitTime = (totalAvgWaitTime / laneCount).toFixed(1);
        
        // Create metrics row
        const metricsRow = document.createElement('div');
        metricsRow.className = 'metrics-row';
        
        // Overall average wait time
        const avgWaitMetric = document.createElement('div');
        avgWaitMetric.className = 'metric-card';
        avgWaitMetric.innerHTML = `
            <div class="metric-title">Overall Average Wait Time</div>
            <div class="metric-value">${overallAvgWaitTime} ${layout.metadata.timeUnit}</div>
        `;
        metricsRow.appendChild(avgWaitMetric);
        
        // Maximum wait time
        const maxWaitMetric = document.createElement('div');
        maxWaitMetric.className = 'metric-card';
        maxWaitMetric.innerHTML = `
            <div class="metric-title">Maximum Wait Time</div>
            <div class="metric-value">${totalMaxWaitTime.toFixed(1)} ${layout.metadata.timeUnit}</div>
        `;
        metricsRow.appendChild(maxWaitMetric);
        
        // Maximum queue length
        const maxQueueMetric = document.createElement('div');
        maxQueueMetric.className = 'metric-card';
        maxQueueMetric.innerHTML = `
            <div class="metric-title">Maximum Queue Length</div>
            <div class="metric-value">${totalMaxQueueLength} ${layout.metadata.queueLengthUnit}</div>
        `;
        metricsRow.appendChild(maxQueueMetric);
        
        // Add metrics row to summary
        metricsSummary.appendChild(metricsRow);
        
        // Add weights information
        const weightsInfo = document.createElement('div');
        weightsInfo.style.margin = '20px 0';
        weightsInfo.style.padding = '10px';
        weightsInfo.style.backgroundColor = 'var(--light-gray)';
        weightsInfo.style.borderRadius = '4px';
        weightsInfo.innerHTML = `
            <strong>Scoring Weights:</strong> 
            Average Wait Time: ${layout.scoringWeights.averageWaitTime}, 
            Max Wait Time: ${layout.scoringWeights.maxWaitTime}, 
            Max Queue Length: ${layout.scoringWeights.maxQueueLength}
        `;
        metricsSummary.appendChild(weightsInfo);
        
        return metricsSummary;
    }

    // Create charts using Chart.js
    function createCharts(layout, layoutIndex) {
        const directions = ['north', 'south', 'east', 'west'];
        const directionsCapitalized = ['North', 'South', 'East', 'West'];
        
        // Destroy existing charts if they exist
        if (chartObjects[layoutIndex]) {
            Object.values(chartObjects[layoutIndex]).forEach(chart => chart.destroy());
        }
        
        chartObjects[layoutIndex] = {};
        
        // Prepare data
        const chartData = {
            avgWaitTime: [],
            maxWaitTime: [],
            maxQueueLength: [],
            scores: []
        };
        
        // Calculate direction averages and scores
        let allRawScores = []; // Array to collect just the raw scores

        directions.forEach((direction, i) => {
            if (!layout.results[direction]) return;
            
            const lanes = layout.results[direction].lanes;
            
            // Calculate direction averages
            let totalAvgWait = 0;
            let maxWait = 0;
            let maxQueue = 0;
            
            lanes.forEach(lane => {
                totalAvgWait += lane.averageWaitTime;
                maxWait = Math.max(maxWait, lane.maxWaitTime);
                maxQueue = Math.max(maxQueue, lane.maxQueueLength);
            });
            
            const avgWait = totalAvgWait / lanes.length;
            
            // Calculate raw direction score
            const rawScore = (
                (avgWait * layout.scoringWeights.averageWaitTime) +
                (maxWait * layout.scoringWeights.maxWaitTime) +
                (maxQueue * layout.scoringWeights.maxQueueLength)
            ) * layout.results[direction].priority;
            
            // Store raw score for normalization
            allRawScores.push({
                direction: directionsCapitalized[i],
                rawScore: rawScore
            });
            
            // Store other metrics directly (unchanged)
            chartData.avgWaitTime.push({
                direction: directionsCapitalized[i],
                value: avgWait.toFixed(1)
            });
            
            chartData.maxWaitTime.push({
                direction: directionsCapitalized[i],
                value: maxWait.toFixed(1)
            });
            
            chartData.maxQueueLength.push({
                direction: directionsCapitalized[i],
                value: maxQueue
            });
        });

        // Find the worst (highest) score
        const worstScore = Math.max(...allRawScores.map(item => item.rawScore));

        // Now normalize and store just the scores
        allRawScores.forEach(item => {
            // Normalize score (0-1 scale where 1 is worst)
            const normalizedScore = item.rawScore / worstScore;
            
            // Store normalized score data
            chartData.scores.push({
                direction: item.direction,
                value: normalizedScore.toFixed(1)
            });
        });
        
        // Create average wait time chart
        chartObjects[layoutIndex].avgWaitChart = createBarChart(
            `avg-wait-chart-${layoutIndex}`,
            chartData.avgWaitTime,
            'Average Wait Time (seconds)',
            'rgba(54, 162, 235, 0.8)'
        );
        
        // Create max wait time chart
        chartObjects[layoutIndex].maxWaitChart = createBarChart(
            `max-wait-chart-${layoutIndex}`,
            chartData.maxWaitTime,
            'Maximum Wait Time (seconds)',
            'rgba(255, 99, 132, 0.8)'
        );
        
        // Create max queue length chart
        chartObjects[layoutIndex].maxQueueChart = createBarChart(
            `max-queue-chart-${layoutIndex}`,
            chartData.maxQueueLength,
            'Maximum Queue Length (vehicles)',
            'rgba(75, 192, 192, 0.8)'
        );
        
        // Create score chart
        chartObjects[layoutIndex].scoreChart = createBarChart(
            `score-chart-${layoutIndex}`,
            chartData.scores,
            'Performance Score (lower is better)',
            'rgba(153, 102, 255, 0.8)'
        );
    }

    // Helper function to create a bar chart
    function createBarChart(canvasId, data, label, backgroundColor) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.direction),
                datasets: [{
                    label: label,
                    data: data.map(item => item.value),
                    backgroundColor: backgroundColor,
                    borderColor: backgroundColor.replace('0.8', '1'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Create junction visualization based on configuration
    function createJunctionVisualization(layoutIndex) {
        // Get the layout ID (JLID) from the current layout
        const layoutJLID = junctionData.layouts[layoutIndex].metadata.JLID;
        
        // Find the matching junction configuration from configs.json
        const matchingConfig = junctionConfigs.find(config => config.JLID === layoutJLID);
        
        if (!matchingConfig) {
            console.error(`No matching junction configuration found for JLID: ${layoutJLID}`);
            
            // Display error message in the visualization container
            const svgContainer = document.getElementById(`junction-visualization-${layoutIndex}`);
            svgContainer.innerHTML = `
                <div class="error-message">
                    <p>No matching junction configuration found for layout ID: ${layoutJLID}</p>
                    <p>Please check that configs.json includes this layout configuration.</p>
                </div>
            `;
            return;
        }
        
        // Get or create the SVG element
        const svgContainer = document.getElementById(`junction-visualization-${layoutIndex}`);
        
        // Clear any existing content
        svgContainer.innerHTML = '';
        
        // Create new SVG element
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.id = `junction-canvas-${layoutIndex}`;
        svgElement.classList.add('junction-svg');
        svgContainer.appendChild(svgElement);
        
        // Add layout name as a label
        const layoutLabel = document.createElement('div');
        layoutLabel.className = 'junction-layout-name';
        layoutLabel.textContent = matchingConfig.jLayoutName || `Layout ${layoutIndex + 1}`;
        layoutLabel.style.textAlign = 'center';
        layoutLabel.style.marginTop = '10px';
        layoutLabel.style.fontWeight = 'bold';
        svgContainer.appendChild(layoutLabel);
        
        // Call the junction visualization function with the matching config
        createJunctionSVG(matchingConfig, svgElement);
    }

    // Function to add layout comparison section with charts
    function addLayoutComparisonCharts() {
        // Create container for comparison charts
        const layoutComparisonContainer = document.createElement('div');
        layoutComparisonContainer.className = 'layout-container layout-comparison-container';
        
        // Add header
        const comparisonHeader = document.createElement('div');
        comparisonHeader.className = 'layout-header';
        comparisonHeader.innerHTML = `
            <h2>Layout Comparison</h2>
            <p>Comparing metrics across different junction layouts</p>
        `;
        layoutComparisonContainer.appendChild(comparisonHeader);
        
        // Create charts container
        const comparisonCharts = document.createElement('div');
        comparisonCharts.className = 'charts-container';
        comparisonCharts.style.padding = '20px';
        
        // Average wait time comparison chart
        const avgWaitChart = document.createElement('div');
        avgWaitChart.className = 'chart-wrapper';
        avgWaitChart.style.flex = '1 1 45%';
        avgWaitChart.style.margin = '10px';
        avgWaitChart.innerHTML = `
            <div class="chart-title">Average Wait Time by Layout</div>
            <canvas id="comparison-avg-wait-chart"></canvas>
        `;
        comparisonCharts.appendChild(avgWaitChart);
        
        // Maximum wait time comparison chart
        const maxWaitChart = document.createElement('div');
        maxWaitChart.className = 'chart-wrapper';
        maxWaitChart.style.flex = '1 1 45%';
        maxWaitChart.style.margin = '10px';
        maxWaitChart.innerHTML = `
            <div class="chart-title">Maximum Wait Time by Layout</div>
            <canvas id="comparison-max-wait-chart"></canvas>
        `;
        comparisonCharts.appendChild(maxWaitChart);
        
        // Maximum queue length comparison chart
        const maxQueueChart = document.createElement('div');
        maxQueueChart.className = 'chart-wrapper';
        maxQueueChart.style.flex = '1 1 45%';
        maxQueueChart.style.margin = '10px';
        maxQueueChart.innerHTML = `
            <div class="chart-title">Maximum Queue Length by Layout</div>
            <canvas id="comparison-max-queue-chart"></canvas>
        `;
        comparisonCharts.appendChild(maxQueueChart);
        
        // Performance score comparison chart
        const scoreChart = document.createElement('div');
        scoreChart.className = 'chart-wrapper';
        scoreChart.style.flex = '1 1 45%';
        scoreChart.style.margin = '10px';
        scoreChart.innerHTML = `
            <div class="chart-title">Performance Score by Layout</div>
            <canvas id="comparison-score-chart"></canvas>
        `;
        comparisonCharts.appendChild(scoreChart);
        
        // Add charts to container
        layoutComparisonContainer.appendChild(comparisonCharts);
        
        // Add container to dashboard
        document.getElementById('layout-display').appendChild(layoutComparisonContainer);
        
        // Create the comparison charts
        createLayoutComparisonCharts();
    }

    // Function to create layout comparison charts
    function createLayoutComparisonCharts() {
        // Destroy existing comparison charts if they exist
        if (comparisonChartObjects) {
            Object.values(comparisonChartObjects).forEach(chart => {
                if (chart) chart.destroy();
            });
        }
        
        comparisonChartObjects = {};
        
        // Calculate metrics for each layout
        const layoutMetrics = junctionData.layouts.map((layout, index) => {
            // Find matching configuration for this layout
            const layoutJLID = layout.metadata.JLID;
            const matchingConfig = junctionConfigs.find(config => config.JLID === layoutJLID);
            const layoutName = matchingConfig ? matchingConfig.jLayoutName : `Layout ${index + 1}`;
            
            // Calculate metrics
            const metrics = calculateLayoutMetrics(layout);
            
            return {
                layoutName: layoutName,
                layoutId: layout.metadata.JLID,
                avgWaitTime: metrics.avgWaitTime,
                maxWaitTime: metrics.maxWaitTime,
                maxQueueLength: metrics.maxQueueLength,
                performanceScore: metrics.performanceScore
            };
        });


        const worstScore = Math.max(...layoutMetrics.map(m => m.performanceScore));

        // Create average wait time comparison chart
        comparisonChartObjects.avgWaitChart = createLayoutComparisonChart(
            'comparison-avg-wait-chart',
            layoutMetrics.map(m => m.layoutName),
            layoutMetrics.map(m => m.avgWaitTime),
            'Average Wait Time (seconds)',
            'rgba(54, 162, 235, 0.8)'
        );
        
        // Create maximum wait time comparison chart
        comparisonChartObjects.maxWaitChart = createLayoutComparisonChart(
            'comparison-max-wait-chart',
            layoutMetrics.map(m => m.layoutName),
            layoutMetrics.map(m => m.maxWaitTime),
            'Maximum Wait Time (seconds)',
            'rgba(255, 99, 132, 0.8)'
        );
        
        // Create maximum queue length comparison chart
        comparisonChartObjects.maxQueueChart = createLayoutComparisonChart(
            'comparison-max-queue-chart',
            layoutMetrics.map(m => m.layoutName),
            layoutMetrics.map(m => m.maxQueueLength),
            'Maximum Queue Length (vehicles)',
            'rgba(75, 192, 192, 0.8)'
        );
        
        // Create performance score comparison chart
        comparisonChartObjects.scoreChart = createLayoutComparisonChart(
            'comparison-score-chart',
            layoutMetrics.map(m => m.layoutName),
            layoutMetrics.map(m => parseFloat(m.performanceScore/worstScore).toFixed(1)),
            'Performance Score (lower is better)',
            'rgba(153, 102, 255, 0.8)'
        );
    }

    // Helper function to calculate overall metrics for a layout
    function calculateLayoutMetrics(layout) {
        const directions = ['north', 'south', 'east', 'west'];
        let totalAvgWaitTime = 0;
        let maxWaitTime = 0;
        let maxQueueLength = 0;
        let totalPerformanceScore = 0;
        let laneCount = 0;
        
        // Calculate raw metrics
        directions.forEach(direction => {
            if (layout.results[direction]) {
                const dirResults = layout.results[direction];
                const dirPriority = dirResults.priority;
                
                dirResults.lanes.forEach(lane => {
                    totalAvgWaitTime += lane.averageWaitTime;
                    maxWaitTime = Math.max(maxWaitTime, lane.maxWaitTime);
                    maxQueueLength = Math.max(maxQueueLength, lane.maxQueueLength);
                    
                    // Calculate weighted score for this lane
                    const laneScore = (
                        (lane.averageWaitTime * layout.scoringWeights.averageWaitTime) +
                        (lane.maxWaitTime * layout.scoringWeights.maxWaitTime) +
                        (lane.maxQueueLength * layout.scoringWeights.maxQueueLength)
                    ) * dirPriority;
                    
                    totalPerformanceScore += laneScore;
                    laneCount++;
                });
            }
        });
        
        const overallAvgWaitTime = laneCount > 0 ? totalAvgWaitTime / laneCount : 0;
        const normalizedScore = totalPerformanceScore / laneCount; // per lane average score
        
        return {
            avgWaitTime: parseFloat(overallAvgWaitTime.toFixed(1)),
            maxWaitTime: parseFloat(maxWaitTime.toFixed(1)),
            maxQueueLength: maxQueueLength,
            performanceScore: parseFloat(normalizedScore.toFixed(1))
        };
    }

    // Helper function to create a comparison bar chart
    function createLayoutComparisonChart(canvasId, labels, data, title, backgroundColor) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: data,
                    backgroundColor: backgroundColor,
                    borderColor: backgroundColor.replace('0.8', '1'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',  // Horizontal bar chart for better layout comparison
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: title
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false  // Hide legend as it's redundant with the title
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.x} ${title.includes('Time') ? 'seconds' : 
                                         title.includes('Queue') ? 'vehicles' : ''}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // The junction visualization code remains unchanged
    function createJunctionSVG(config, svgElement) {
        const svgSize = 1000;
        const svg = d3.select(svgElement)
            .attr("width", svgSize)
            .attr("height", svgSize)
            .attr("viewBox", `0 0 ${svgSize} ${svgSize}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        // Clear existing content
        svg.selectAll("*").remove();

        const laneWidth = 50;
        const curbWidth = 10;
        const centerX = svgSize / 2;
        const centerY = svgSize / 2;

        const maxLanes = Math.max(
            (config["northArm"] ? config["northArm"].laneCount : 0),
            (config["eastArm"] ? config["eastArm"].laneCount : 0),
            (config["southArm"] ? config["southArm"].laneCount : 0),
            (config["westArm"] ? config["westArm"].laneCount : 0)
        );

        const intersectionSize = maxLanes * laneWidth * 2;
        const intersectionHalf = intersectionSize / 2;

        /*** Define Grass Pattern ***/
        const defs = svg.append("defs");
        const patternId = `grassPattern_${svgElement.id}`; // Create unique pattern ID
        const pattern = defs.append("pattern")
            .attr("id", patternId)
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
            .attr("fill", `url(#${patternId})`);

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
            const crossingSize = 50; // Increased size for a larger crossing
            const stripeWidth = 5;
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
            for (let i = 0; i < stripeCount; i++) {
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
                if (i===enteringLanes) isDashed = false;
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
        function drawApproach_North(laneCount, laneDetail) {
            const lanes = laneCount;
            const totalLanes = lanes + maxLanes;
            const outerHeight = centerY - intersectionHalf;
            const outerWidth = totalLanes * laneWidth + 2 * curbWidth;
            const outerX = centerX - outerWidth / 2;
            const outerY = 0;

            svg.append("rect").attr("x", outerX).attr("y", outerY).attr("width", curbWidth).attr("height", outerHeight).attr("fill", "#cccccc");
            svg.append("rect").attr("x", outerX + totalLanes * laneWidth + curbWidth).attr("y", outerY).attr("width", curbWidth).attr("height", outerHeight).attr("fill", "#cccccc");

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
                    // For demo purposes, draw a placeholder icon instead of loading external images
                    if (laneType === "busLane") {
                        drawBusPlaceholder(imgX, imgY, imgWidth, imgHeight, 180);
                    } else {
                        drawCyclePlaceholder(imgX, imgY, imgWidth, imgHeight, 180);
                    }
                } else if (laneType) {
                    let imgX = innerX + (i + 0.5) * laneWidth;
                    let imgY = innerY + innerHeight - 80;
                    let imgWidth = laneWidth * 0.8;
                    let imgHeight = laneWidth * 0.8;
                    // Draw placeholder lane type indicator
                    drawLaneTypePlaceholder(laneType, imgX, imgY, imgWidth, imgHeight, 180);
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

            drawPedestrianCrossing("North", totalLanes, laneWidth, innerX, innerY, innerWidth, innerHeight);
        }

        function drawApproach_East(laneCount, laneDetail) {
            const lanes = laneCount;
            const totalLanes = lanes + maxLanes;
            const outerWidth = centerX - intersectionHalf;
            const outerHeight = totalLanes * laneWidth + 2 * curbWidth;
            const outerX = centerX + intersectionHalf;
            const outerY = centerY - outerHeight / 2;

            svg.append("rect").attr("x", outerX).attr("y", outerY).attr("width", outerWidth).attr("height", curbWidth).attr("fill", "#cccccc");
            svg.append("rect").attr("x", outerX).attr("y", outerY + totalLanes * laneWidth + curbWidth).attr("width", outerWidth).attr("height", curbWidth).attr("fill", "#cccccc");

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
                    if (laneType === "busLane") {
                        drawBusPlaceholder(imgX, imgY, imgWidth, imgHeight, 270);
                    } else {
                        drawCyclePlaceholder(imgX, imgY, imgWidth, imgHeight, 270);
                    }
                } else if (laneType) {
                    let imgX = innerX + 80;
                    let imgY = innerY + (i + 0.5) * laneWidth;
                    let imgWidth = laneWidth * 0.8;
                    let imgHeight = laneWidth * 0.8;
                    drawLaneTypePlaceholder(laneType, imgX, imgY, imgWidth, imgHeight, 270);
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
        }

        function drawApproach_South(laneCount, laneDetail) {
            const lanes = laneCount;
            const totalLanes = lanes + maxLanes;
            const outerHeight = centerY - intersectionHalf;
            const outerWidth = totalLanes * laneWidth + 2 * curbWidth;
            const outerX = centerX - outerWidth / 2;
            const outerY = centerY + intersectionHalf;

            svg.append("rect").attr("x", outerX).attr("y", outerY).attr("width", curbWidth).attr("height", outerHeight).attr("fill", "#cccccc");
            svg.append("rect").attr("x", outerX + totalLanes * laneWidth + curbWidth).attr("y", outerY).attr("width", curbWidth).attr("height", outerHeight).attr("fill", "#cccccc");

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
                    if (laneType === "busLane") {
                        drawBusPlaceholder(imgX, imgY, imgWidth, imgHeight, 0);
                    } else {
                        drawCyclePlaceholder(imgX, imgY, imgWidth, imgHeight, 0);
                    }
                } else if (laneType) {
                    let imgX = innerX + (i + 0.5) * laneWidth;
                    let imgY = innerY + 80;
                    let imgWidth = laneWidth * 0.8;
                    let imgHeight = laneWidth * 0.8;
                    drawLaneTypePlaceholder(laneType, imgX, imgY, imgWidth, imgHeight, 0);
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
        }

        function drawApproach_West(laneCount, laneDetail) {
            const lanes = laneCount;
            const totalLanes = lanes + maxLanes;
            const outerWidth = centerX - intersectionHalf;
            const outerHeight = totalLanes * laneWidth + 2 * curbWidth;
            const outerX = 0;
            const outerY = centerY - outerHeight / 2;

            svg.append("rect").attr("x", outerX).attr("y", outerY).attr("width", outerWidth).attr("height", curbWidth).attr("fill", "#cccccc");
            svg.append("rect").attr("x", outerX).attr("y", outerY + totalLanes * laneWidth + curbWidth).attr("width", outerWidth).attr("height", curbWidth).attr("fill", "#cccccc");

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
                    if (laneType === "busLane") {
                        drawBusPlaceholder(imgX, imgY, imgWidth, imgHeight, 90);
                    } else {
                        drawCyclePlaceholder(imgX, imgY, imgWidth, imgHeight, 90);
                    }
                } else if (laneType) {
                    let imgX = innerX + innerWidth - 80;
                    let imgY = innerY + (i + 0.5) * laneWidth;
                    let imgWidth = laneWidth * 0.8;
                    let imgHeight = laneWidth * 0.8;
                    drawLaneTypePlaceholder(laneType, imgX, imgY, imgWidth, imgHeight, 90);
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
        }

        // Helper function to draw bus lane placeholder
        function drawBusPlaceholder(x, y, width, height, rotation) {
            const g = svg.append("g")
                .attr("transform", `translate(${x}, ${y}) rotate(${rotation})`);
                
            // Bus shape
            g.append("rect")
                .attr("x", -width/2)
                .attr("y", -height/2)
                .attr("width", width)
                .attr("height", height/2)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("fill", "#FF6347");
                
            // Windows
            const windowWidth = width / 5;
            const offsetX = -width/2 + windowWidth/2;
            for (let i = 0; i < 3; i++) {
                g.append("rect")
                    .attr("x", offsetX + i * windowWidth)
                    .attr("y", -height/4)
                    .attr("width", windowWidth * 0.7)
                    .attr("height", height/6)
                    .attr("fill", "white");
            }
            
            // Wheels
            g.append("circle")
                .attr("cx", -width/4)
                .attr("cy", 0)
                .attr("r", height/10)
                .attr("fill", "black");
                
            g.append("circle")
                .attr("cx", width/4)
                .attr("cy", 0)
                .attr("r", height/10)
                .attr("fill", "black");
        }

        // Helper function to draw cycle lane placeholder
        function drawCyclePlaceholder(x, y, width, height, rotation) {
            const g = svg.append("g")
                .attr("transform", `translate(${x}, ${y}) rotate(${rotation})`);
                
            // Cycle shape
            g.append("circle")
                .attr("cx", -width/6)
                .attr("cy", 0)
                .attr("r", height/4)
                .attr("fill", "none")
                .attr("stroke", "#4682B4")
                .attr("stroke-width", 4);
        }

        // Helper function to draw lane type placeholder
        function drawLaneTypePlaceholder(laneType, x, y, width, height, rotation) {
            const g = svg.append("g")
                .attr("transform", `translate(${x}, ${y}) rotate(${rotation})`);
                
            // Different shapes based on lane type
            if (laneType === "straightOnly") {
                // Arrow up
                g.append("path")
                    .attr("d", `M0,${-height/3} L${width/4},0 L${width/8},0 L${width/8},${height/3} L${-width/8},${height/3} L${-width/8},0 L${-width/4},0 Z`)
                    .attr("fill", "white");
            } else if (laneType === "leftOnly") {
                // Arrow left
                g.append("path")
                    .attr("d", `M${-width/3},0 L0,${height/4} L0,${height/8} L${width/3},${height/8} L${width/3},${-height/8} L0,${-height/8} L0,${-height/4} Z`)
                    .attr("fill", "white");
            } else if (laneType === "rightOnly") {
                // Arrow right
                g.append("path")
                    .attr("d", `M${width/3},0 L0,${-height/4} L0,${-height/8} L${-width/3},${-height/8} L${-width/3},${height/8} L0,${height/8} L0,${height/4} Z`)
                    .attr("fill", "white");
            } else if (laneType === "leftStraight") {
                // Arrow left-up
                g.append("path")
                    .attr("d", `M0,${-height/3} L${width/5},${-height/6} L${width/10},${-height/6} L${width/10},${height/3} L${-width/10},${height/3} L${-width/10},${-height/6} L${-width/5},${-height/6} Z`)
                    .attr("fill", "white");
                    
                g.append("path")
                    .attr("d", `M${-width/3},0 L${-width/6},${height/5} L${-width/6},${height/10} L${width/3},${height/10} L${width/3},${-height/10} L${-width/6},${-height/10} L${-width/6},${-height/5} Z`)
                    .attr("fill", "white");
            } else {
                // Default circle
                g.append("circle")
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("r", Math.min(width, height) / 3)
                    .attr("fill", "white");
            }
        }

        /*** Render Approaches ***/
        if (config["northArm"]) drawApproach_North(config["northArm"].laneCount, config["northArm"].laneDetail);
        if (config["eastArm"]) drawApproach_East(config["eastArm"].laneCount, config["eastArm"].laneDetail);
        if (config["southArm"]) drawApproach_South(config["southArm"].laneCount, config["southArm"].laneDetail);
        if (config["westArm"]) drawApproach_West(config["westArm"].laneCount, config["westArm"].laneDetail);
    }

    // Start by fetching junction data
    fetchJunctionData();
});