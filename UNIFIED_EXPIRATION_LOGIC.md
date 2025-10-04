# Unified Post and Image Expiration Logic

## Overview
Fun Circle now uses consistent expiration logic for both post status display and image cleanup. This ensures a coherent user experience where post status and image availability align perfectly.

## Unified Expiration Rules

### Rule 1: No Start Date = Never Expires
```typescript
if (!post.dateTime) {
  return false; // Never expires - evergreen content
}
```
- **Posts without `dateTime`**: Considered active indefinitely
- **Use Case**: General services like "Available for tutoring"
- **Image Behavior**: Images are preserved indefinitely
- **Status Display**: Always shows "Active"

### Rule 2: Future Start Date = Not Expired
```typescript
const postDateTime = new Date(post.dateTime);
const now = new Date();

if (postDateTime > now) {
  return false; // Not expired yet
}
```
- **Posts with future `dateTime`**: Not expired until start date arrives
- **Use Case**: Events scheduled for future dates
- **Image Behavior**: Images are preserved until event starts
- **Status Display**: Shows "Soon" until start date

### Rule 3: Past Start + End Date = Check End Date
```typescript
if (post.endDateTime) {
  const endDateTime = new Date(post.endDateTime);
  return endDateTime < now; // Expired if end date passed
}
```
- **Posts with `endDateTime`**: Expire when end date passes
- **Use Case**: Events or services with specific duration
- **Image Behavior**: Images removed when end date passes
- **Status Display**: "Active" during event, "Expired" after end date

### Rule 4: Past Start + No End Date = 1 Month Rule
```typescript
const oneMonthAfterStart = new Date(postDateTime);
oneMonthAfterStart.setMonth(oneMonthAfterStart.getMonth() + 1);

return now > oneMonthAfterStart; // Expired if > 1 month since start
```
- **Posts without `endDateTime`**: Expire 1 month after start date
- **Use Case**: Services or events without specific end time
- **Image Behavior**: Images removed 1 month after start date
- **Status Display**: "Active" for 1 month, then "Expired"

## Benefits of Unified Logic

### 1. Consistent User Experience
- ✅ **Predictable Behavior**: Users know exactly when posts and images expire
- ✅ **No Surprises**: Post status and image availability always match
- ✅ **Clear Communication**: Same rules apply everywhere in the platform

### 2. Logical Timeline Management
- ✅ **Future Events Protected**: Images preserved until events actually start
- ✅ **Advance Planning Supported**: Users can create posts well in advance
- ✅ **Service-Based Expiration**: Expiration aligns with actual service timeline

### 3. Storage Efficiency
- ✅ **Automatic Cleanup**: Images removed when posts become expired
- ✅ **Smart Retention**: Active content keeps its images
- ✅ **Gradual Space Recovery**: Expired content naturally frees up storage

## Real-World Examples

### Example 1: Evergreen Service
```
Post: "Available for math tutoring"
dateTime: undefined
endDateTime: undefined
Result: Never expires - images preserved indefinitely
Status: Always "Active"
```

### Example 2: Future Event
```
Post: "Halloween party planning"
dateTime: "2025-10-31T19:00:00Z" (future)
endDateTime: "2025-10-31T23:00:00Z"
Current: September 22, 2025
Result: Not expired - images preserved until October 31
Status: "Soon"
```

### Example 3: Active Event with End Date
```
Post: "Weekend garage sale"
dateTime: "2025-09-21T08:00:00Z" (yesterday)
endDateTime: "2025-09-22T18:00:00Z" (today 6pm)
Current: September 22, 2025 2pm
Result: Not expired - still active
Status: "Active"
```

### Example 4: Completed Event
```
Post: "Summer BBQ party"
dateTime: "2025-08-15T17:00:00Z"
endDateTime: "2025-08-15T22:00:00Z"
Current: September 22, 2025
Result: Expired - images removed
Status: "Expired"
```

### Example 5: Service Without End Date
```
Post: "Dog walking available"
dateTime: "2025-08-01T09:00:00Z" (7+ weeks ago)
endDateTime: undefined
Current: September 22, 2025
Result: Expired - more than 1 month since start
Status: "Expired"
```

## Implementation Details

### Code Locations
- **Post Status Logic**: `/src/pages/Home.tsx` - `getPostStatus()` function
- **Image Expiration Logic**: `/src/utils/imageCleanup.ts` - `isPostExpired()` function
- **Post Deletion Logic**: `/src/utils/expiredPostCleanup.ts` - `isPostExpired()` function

### Database Fields Used
```typescript
interface Offer {
  dateTime?: string;      // Start date/time (ISO string)
  endDateTime?: string;   // End date/time (ISO string)
  createdAt: Date;        // Post creation timestamp (not used for expiration)
  
  // Image expiration tracking
  imageExpired?: boolean;
  imageExpiredAt?: Date;
  imageExpiredReason?: string;
}
```

### Automatic Cleanup Schedule
- **Frequency**: Every 24 hours
- **Scope**: All posts with images
- **Action**: Remove image data from expired posts
- **Tracking**: Log cleanup statistics and results

## Migration Benefits

### Before (Inconsistent Logic)
| System | Reference Date | Timeline | Issues |
|--------|---------------|----------|---------|
| Post Status | `dateTime` (start) | 1 month after start | ✅ Logical |
| Image Cleanup | `createdAt` (creation) | 30 days after creation | ❌ Premature expiration |

### After (Unified Logic)
| System | Reference Date | Timeline | Benefits |
|--------|---------------|----------|----------|
| Post Status | `dateTime` (start) | 1 month after start | ✅ Logical |
| Image Cleanup | `dateTime` (start) | 1 month after start | ✅ Consistent |

## User Communication

### Status Indicators
- **"Soon"**: Future events with preserved images
- **"Active"**: Current services/events with images
- **"Expired"**: Past services/events with removed images

### Image Expiration Messages
When images are removed, users see:
- **Main Message**: "The image is expired."
- **Reason**: "Post expired - image removed to free storage space"
- **Timestamp**: "Removed on [date]"

This unified approach creates a more intuitive and reliable experience for Fun Circle users while maintaining efficient storage management.
