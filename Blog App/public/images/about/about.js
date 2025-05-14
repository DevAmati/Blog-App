// Generate illustrative images for the About page

// Generate "Our Story" image with blogging/writing theme
function generateStoryImage(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Set gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#e9f7fe');
    gradient.addColorStop(1, '#d4e7fa');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw decorative elements
    
    // Document icon
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(width * 0.2, height * 0.25, width * 0.3, height * 0.4);
    ctx.strokeStyle = '#4A90E2';
    ctx.lineWidth = 3;
    ctx.strokeRect(width * 0.2, height * 0.25, width * 0.3, height * 0.4);
    
    // Document lines
    ctx.fillStyle = '#e0e0e0';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(width * 0.23, height * (0.3 + i*0.06), width * 0.24, height * 0.02);
    }
    
    // Pen icon
    ctx.fillStyle = '#4A90E2';
    ctx.beginPath();
    ctx.moveTo(width * 0.7, height * 0.3);
    ctx.lineTo(width * 0.65, height * 0.35);
    ctx.lineTo(width * 0.6, height * 0.6);
    ctx.lineTo(width * 0.65, height * 0.65);
    ctx.lineTo(width * 0.7, height * 0.6);
    ctx.closePath();
    ctx.fill();
    
    // Pen tip
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(width * 0.65, height * 0.65);
    ctx.lineTo(width * 0.63, height * 0.7);
    ctx.lineTo(width * 0.67, height * 0.7);
    ctx.closePath();
    ctx.fill();
    
    // Add title text
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Our Story', width * 0.5, height * 0.85);
    
    return canvas;
}

// Generate "Our Mission" image
function generateMissionImage(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Set gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f9f9f9');
    gradient.addColorStop(1, '#efefef');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw target/goal icon
    const centerX = width * 0.5;
    const centerY = height * 0.4;
    const radius = Math.min(width, height) * 0.25;
    
    // Outer circle
    ctx.fillStyle = '#f2f2f2';
    ctx.strokeStyle = '#4A90E2';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Middle circle
    ctx.strokeStyle = '#4A90E2';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner circle
    ctx.fillStyle = '#4A90E2';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // Arrow
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius * 1.2);
    ctx.lineTo(centerX - radius * 0.1, centerY - radius * 0.8);
    ctx.lineTo(centerX + radius * 0.1, centerY - radius * 0.8);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius * 1.2);
    ctx.lineTo(centerX, centerY - radius * 0.4);
    ctx.stroke();
    
    // Add title text
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Our Mission', width * 0.5, height * 0.85);
    
    return canvas;
}

// Generate "What We Offer" image
function generateOfferingImage(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Set gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f5f9ff');
    gradient.addColorStop(1, '#e2edff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw laptop icon
    ctx.fillStyle = '#333';
    ctx.fillRect(width * 0.3, height * 0.4, width * 0.4, height * 0.25);
    
    // Screen
    ctx.fillStyle = '#4A90E2';
    ctx.fillRect(width * 0.32, height * 0.42, width * 0.36, height * 0.21);
    
    // Laptop base
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.moveTo(width * 0.25, height * 0.65);
    ctx.lineTo(width * 0.75, height * 0.65);
    ctx.lineTo(width * 0.7, height * 0.7);
    ctx.lineTo(width * 0.3, height * 0.7);
    ctx.closePath();
    ctx.fill();
    
    // Code lines on screen
    ctx.fillStyle = 'white';
    for (let i = 0; i < 4; i++) {
        // Vary line lengths to simulate code
        const lineLength = (0.15 + Math.random() * 0.15) * width;
        ctx.fillRect(width * 0.34, height * (0.45 + i*0.04), lineLength, height * 0.01);
    }
    
    // Add title text
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('What We Offer', width * 0.5, height * 0.85);
    
    return canvas;
}

// Export functions
window.AboutImageGenerator = {
    generateStoryImage,
    generateMissionImage,
    generateOfferingImage
}; 