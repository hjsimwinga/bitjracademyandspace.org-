# Event Flyers Directory

This directory contains flyer images for events. When users hover over event cards, the corresponding flyer image will pop up.

## File Naming Convention

Name your flyer images using the event ID from `data/events.json`:

- `ev-101.jpg` - BJAS Local School's Teachers' Training
- `ev-102.jpg` - 4TH Cohort Graduation/Meetup  
- `ev-103.jpg` - Next Gen Bitcoin Conference

## Image Requirements

- **Format**: JPG, PNG, or WebP
- **Recommended Size**: 800x600px or similar aspect ratio
- **File Size**: Keep under 2MB for fast loading
- **Quality**: High resolution for clear display

## How It Works

1. Upload your flyer image with the correct event ID filename
2. When users hover over an event card, the flyer will pop up in an overlay
3. If no flyer image exists, a "Flyer Coming Soon!" placeholder will be shown

## Example Files

- `ev-101.jpg` - Teachers' Training flyer
- `ev-102.jpg` - Graduation/Meetup flyer
- `ev-103.jpg` - Conference flyer

The system automatically detects if a flyer exists and shows the appropriate content.
