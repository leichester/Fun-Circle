# How to Upload Multiple Photos - User Guide

## Understanding Multiple Photo Selection

### ⚠️ Important Note
When you click "Choose Photos" or "Add More Photos", the browser file dialog allows you to **select multiple files at once** from that dialog. This is the correct way to add multiple images.

### ✅ How to Select Multiple Photos (Correct Method)

#### **Method 1: Select Multiple Photos at Once**
1. Click the "Choose Photos" button
2. In the file browser that opens:
   - **Windows**: Hold `Ctrl` and click each photo you want
   - **Mac**: Hold `Cmd (⌘)` and click each photo you want
   - **Range Selection**: Click first photo, hold `Shift`, click last photo
3. Click "Open" to add all selected photos at once

#### **Visual Guide:**
```
File Browser Window
├─ photo1.jpg  ← Click
├─ photo2.jpg  ← Ctrl+Click (or Cmd+Click)
├─ photo3.jpg  ← Ctrl+Click
├─ photo4.jpg  ← Ctrl+Click
└─ photo5.jpg  ← Ctrl+Click

Then click "Open" → All 5 photos selected! ✅
```

### ❌ Common Mistake
**Don't do this:**
1. Click "Choose Photos" → Select photo1 → Open
2. Click "Add More Photos" → Select photo2 → Open
3. Result: Only photo2 shows (photo1 is replaced) ❌

**Why this happens:**
Each time you open the file dialog, it starts fresh. The browser doesn't remember previous selections from earlier dialog sessions.

### 🎯 Best Practices

#### **Option 1: Select All Photos at Once (Recommended)**
```
Click "Choose Photos"
↓
Select all 5 photos using Ctrl/Cmd+Click
↓
Click "Open"
↓
All 5 photos appear in grid! ✅
```

#### **Option 2: Use Range Selection**
```
Click "Choose Photos"
↓
Click first photo
↓
Hold Shift + Click last photo
↓
All photos in between selected!
↓
Click "Open"
```

#### **Option 3: Select All in Folder**
```
Click "Choose Photos"
↓
Press Ctrl+A (Windows) or Cmd+A (Mac)
↓
All photos in folder selected!
↓
Click "Open"
```

## Visual Interface Guide

### **Initial State**
```
┌─────────────────────────────────────────┐
│  Label: Add Photos (Optional - Up to 5) │
│                                          │
│  💡 Tip: Select multiple photos at once  │
│      using Ctrl+Click or Cmd+Click!      │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  📷  Choose Photos (0/5)           │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### **After Selecting 3 Photos**
```
┌─────────────────────────────────────────┐
│  3 Photos Selected      [Remove All]    │
│                                          │
│  ┌─────┬─────┬─────┐                   │
│  │IMG 1│IMG 2│IMG 3│                   │
│  │[1/3]│[2/3]│[3/3]│                   │
│  │ [×] │ [×] │ [×] │ ← Hover to show   │
│  └─────┴─────┴─────┘                   │
│                                          │
│  ✅ 3 photos optimized                  │
│  Total: 9.5MB → 285KB                   │
└─────────────────────────────────────────┘
```

## Keyboard Shortcuts Reference

### **Windows**
| Action | Shortcut |
|--------|----------|
| Select multiple individual files | `Ctrl` + Click each file |
| Select range of files | Click first → `Shift` + Click last |
| Select all files | `Ctrl` + `A` |

### **Mac**
| Action | Shortcut |
|--------|----------|
| Select multiple individual files | `Cmd (⌘)` + Click each file |
| Select range of files | Click first → `Shift` + Click last |
| Select all files | `Cmd (⌘)` + `A` |

### **Linux**
| Action | Shortcut |
|--------|----------|
| Select multiple individual files | `Ctrl` + Click each file |
| Select range of files | Click first → `Shift` + Click last |
| Select all files | `Ctrl` + `A` |

## Mobile Device Selection

### **iOS (iPhone/iPad)**
1. Tap "Choose Photos"
2. Tap "Select" in top right
3. Tap each photo you want (checkmarks appear)
4. Tap "Add" when done

### **Android**
1. Tap "Choose Photos"
2. Long-press first photo
3. Tap additional photos to select
4. Tap checkmark/done when finished

## Features & Limitations

### ✅ What You Can Do
- Select up to 5 photos total per post
- Choose photos from any folder on your device
- Mix different photo formats (JPG, PNG, WebP)
- Remove individual photos after selection
- Clear all and start over with "Remove All"

### ⚠️ Current Limitations
- Must select all desired photos in **one file dialog session**
- Cannot add photos incrementally from multiple dialog sessions
- Each new "Choose Photos" click opens a fresh dialog

### 💡 Pro Tips
1. **Organize First**: Put all photos you want to upload in one folder
2. **Select Together**: Choose all photos in one dialog session
3. **Preview Check**: Review thumbnails before submitting
4. **Quick Remove**: Hover over any thumbnail to remove it
5. **Start Over**: Use "Remove All" to clear and reselect

## Troubleshooting

### "I clicked Add More Photos but my previous photo disappeared!"
**Problem**: You selected one photo, opened dialog again, selected another
**Solution**: Select all photos at once using Ctrl/Cmd+Click in ONE dialog session

### "I can only select one photo at a time!"
**Problem**: Not using Ctrl/Cmd modifier key
**Solution**: Hold Ctrl (Windows/Linux) or Cmd (Mac) while clicking each photo

### "I want to add a 6th photo but it's disabled"
**Problem**: Maximum limit of 5 photos reached
**Solution**: Remove one photo first, then add your new photo (selecting all desired photos together)

### "How do I reorder my photos?"
**Current**: Photos display in selection order
**Workaround**: Remove all and reselect in desired order
**Future**: Drag-and-drop reordering (planned enhancement)

## Examples

### **Scenario 1: Real Estate Listing**
**Goal**: Upload 5 property photos
```
1. Open photos folder with property pictures
2. Click "Choose Photos"
3. Hold Ctrl (or Cmd) and click:
   - exterior.jpg
   - living-room.jpg
   - kitchen.jpg
   - bedroom.jpg
   - bathroom.jpg
4. Click "Open"
5. All 5 photos appear! ✅
```

### **Scenario 2: Event Venue**
**Goal**: Show venue from different angles
```
1. Navigate to venue-photos folder
2. Click "Choose Photos"
3. Click first photo (entrance.jpg)
4. Hold Shift and click last photo (parking.jpg)
5. All photos in between selected!
6. Click "Open"
7. Complete venue showcase! ✅
```

### **Scenario 3: Service Portfolio**
**Goal**: Display before/after results
```
1. Organize photos: before1.jpg, after1.jpg, before2.jpg, after2.jpg, review.jpg
2. Click "Choose Photos"
3. Press Ctrl+A to select all in folder
4. Click "Open"
5. Full portfolio uploaded! ✅
```

## Future Enhancements

We're planning to improve the multi-upload experience:
- **Incremental Adding**: Add photos from multiple dialog sessions
- **Drag-and-Drop**: Reorder photos visually
- **Drag Files**: Drag photos directly from desktop
- **Camera Capture**: Take photos directly from device camera
- **Cloud Import**: Import from Google Photos, Dropbox, etc.

For now, the **select multiple in one dialog** method works great for uploading several photos efficiently!