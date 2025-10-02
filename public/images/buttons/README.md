# Button Background Images

This directory contains background images for buttons and other orange UI elements.

## File Naming Convention

- `primary-bg.jpg` - Background image for primary buttons (Donate, etc.)

## Image Requirements

- **Format**: JPG, PNG, or WebP
- **Recommended Size**: 200x60px or similar aspect ratio
- **File Size**: Keep under 500KB for fast loading
- **Quality**: High resolution for clear display
- **Content**: Should work well with orange color scheme

## How It Works

Primary buttons use a layered background:
1. **Orange Color**: Base orange background color
2. **Background Image**: Your uploaded image as overlay

## Example Usage

The CSS applies the background like this:
```css
.btn-primary{ 
  background:var(--primary); 
  color:#111; 
  background-image:url('/images/buttons/primary-bg.jpg'); 
  background-size:cover; 
  background-position:center; 
}
```

Upload your `primary-bg.jpg` file to this directory to see it in action!

