# Event Background Images

This directory contains background images for event-related UI elements.

## File Naming Convention

- `training-bg.jpg` - Background for training events (orange gradient)
- `graduation-bg.jpg` - Background for graduation/meetup events (purple gradient)
- `conference-bg.jpg` - Background for conference events (green gradient)

## Image Requirements

- **Format**: JPG, PNG, or WebP
- **Recommended Size**: 100x100px or similar square aspect ratio
- **File Size**: Keep under 200KB for fast loading
- **Quality**: High resolution for clear display
- **Content**: Should work well with gradient overlays

## How It Works

Event calendar days use layered backgrounds:
1. **Gradient**: Color gradient overlay
2. **Background Image**: Your uploaded image underneath

## Example Usage

The CSS applies the background like this:
```css
.calendar-day.event-color-1{ 
  background:linear-gradient(135deg, #ff9900, #ff6600), 
              url('/images/events/training-bg.jpg'); 
  background-size:cover; 
  background-position:center; 
  color:white; 
}
```

Upload your event background images to this directory to see them in action!

