# About Page Background Images

This directory contains background images for the about page header section.

## File Naming Convention

- `about-bg.jpg` - Main background image for the about page header

## Image Requirements

- **Format**: JPG, PNG, or WebP
- **Recommended Size**: 1200x400px or similar aspect ratio
- **File Size**: Keep under 2MB for fast loading
- **Quality**: High resolution for clear display
- **Content**: Should work well with orange gradient overlay

## How It Works

The about page header uses a layered background:
1. **Orange Gradient**: Semi-transparent orange overlay
2. **Background Image**: Your uploaded image underneath

## Example Usage

The CSS applies the background like this:
```css
.about-header {
  background: linear-gradient(135deg, rgba(255, 153, 0, 0.8), rgba(255, 102, 0, 0.8)), 
              url('/images/about/about-bg.jpg');
  background-size: cover;
  background-position: center;
}
```

Upload your `about-bg.jpg` file to this directory to see it in action!
