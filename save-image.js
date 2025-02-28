// Function to convert SVG to PNG and save it
function saveSvgAsPng() {
    const svgElement = document.getElementById('junctionCanvas');
    
    // Get SVG data
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
    const DOMURL = window.URL || window.webkitURL || window;
    const svgUrl = DOMURL.createObjectURL(svgBlob);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const svgSize = parseInt(svgElement.getAttribute('width'));
    canvas.width = svgSize;
    canvas.height = svgSize;
    
    // Draw SVG to canvas
    const img = new Image();
    img.onload = function() {
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(svgUrl);
      
      // Save PNG to localStorage
      const pngData = canvas.toDataURL('image/png');
      localStorage.setItem('junctionPng', pngData);
      
      alert('Junction image saved! You can now view it on the viewer page.');
    };
    
    img.src = svgUrl;
  }
  
  // Add save button when page loads
  document.addEventListener("DOMContentLoaded", function() {
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Junction as PNG';
    saveButton.style.margin = '10px';
    saveButton.style.padding = '8px 16px';
    saveButton.addEventListener('click', saveSvgAsPng);
    document.body.appendChild(saveButton);
  });