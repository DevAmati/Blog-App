// Simple placeholder image generator
function createPlaceholder(width = 800, height = 400) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Fill with light gray
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, 0, width, height);
    
    // Add text
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Placeholder Image', width / 2, height / 2 - 15);
    
    ctx.font = '18px Arial';
    ctx.fillText(`${width} × ${height}`, width / 2, height / 2 + 15);
    
    return canvas.toDataURL('image/png');
}

// Expose to global scope
window.createPlaceholder = createPlaceholder; 