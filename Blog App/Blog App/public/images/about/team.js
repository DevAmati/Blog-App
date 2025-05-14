// Generate team member avatars with initials
function generateTeamAvatar(name, width, height, backgroundColor = '#4A90E2') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Draw initials
    const initials = name.split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .join('');
    
    ctx.fillStyle = 'white';
    ctx.font = `bold ${Math.floor(width/3)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, width/2, height/2);
    
    return canvas.toDataURL('image/png');
}

// Generate team member image with avatar and role info
function generateTeamMemberImage(name, role, width, height, bgColor) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // Calculate avatar size (60% of total)
    const avatarSize = Math.min(width, height) * 0.6;
    const avatarX = (width - avatarSize) / 2;
    const avatarY = height * 0.15;
    
    // Create avatar
    const avatar = new Image();
    avatar.src = generateTeamAvatar(name, avatarSize, avatarSize, bgColor);
    
    avatar.onload = function() {
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        
        // Add name and role text
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name, width/2, avatarY + avatarSize + 30);
        
        ctx.fillStyle = '#666666';
        ctx.font = '14px Arial, sans-serif';
        ctx.fillText(role, width/2, avatarY + avatarSize + 55);
    };
    
    return canvas;
}

// Export functions
window.TeamImageGenerator = {
    generateTeamAvatar,
    generateTeamMemberImage
}; 