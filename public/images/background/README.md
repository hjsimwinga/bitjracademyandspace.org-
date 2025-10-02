# Page Background Images Directory

## How to Add Your Page Background Image

### **Required Image:**
- **Filename**: `page-bg.jpg` (exact name required)
- **Location**: Place the image file directly in this folder (`public/images/background/`)
- **Recommended Size**: 1920x1080 pixels or similar high resolution
- **Format**: JPG, PNG, or WebP

### **Steps:**
1. Find or create a subtle background image that won't interfere with text readability
2. Resize it to approximately 1920x1080 pixels (or similar aspect ratio)
3. Save it as `page-bg.jpg`
4. Copy the file into this folder: `public/images/background/`
5. Refresh your website - the background will appear automatically!

### **Image Guidelines:**
- **Subtle and Light**: Choose images that are not too busy or dark
- **High Resolution**: Use high-quality images for crisp display
- **Bitcoin/Education Theme**: Consider Bitcoin symbols, learning environments, or educational graphics
- **Low Contrast**: Avoid high-contrast images that might make text hard to read
- **Pattern or Texture**: Subtle patterns or textures work well as page backgrounds

### **Current Status:**
- ✅ Directory created
- ✅ CSS configured for background image
- ⏳ Waiting for `page-bg.jpg` image file
- ⏳ Background will appear once image is added

### **File Structure:**
```
public/images/background/
├── README.md (this file)
└── page-bg.jpg (your background image - add this!)
```

### **CSS Properties Applied:**
- `background-size: cover` - Image covers the entire page
- `background-position: center` - Image is centered
- `background-attachment: fixed` - Image stays fixed while scrolling (parallax effect)
- Fallback to `var(--bg)` color if image fails to load
