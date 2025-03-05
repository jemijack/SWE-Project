async function checkSimulationStatus() {
    const response = await fetch('/simulation_status'); // await means the script will pause until /siumulation_status responds since it is an asynchronous function
    const result = await response.json(); // again, await is necessary as otherwise, response.json will be a Promise object, and not a json
    
    
    if (result.status === 'complete') {
        
        // The simulation has finished, meaning we move on to the comparison page
        window.location.href = '/comparison_page';
    } else {

        // The simulation has not finished, so recursively poll again after a delay
        setTimeout(checkSimulationStatus, 2000); // 2000ms
    }
}

// We want the polling to start once the loading page loads
checkSimulationStatus();