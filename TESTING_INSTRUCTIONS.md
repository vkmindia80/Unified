# Digital HQ Enhancement - Testing Instructions

## Overview
This document provides step-by-step instructions for testing the newly enhanced Digital HQ CalendarWidget with full CRUD (Create, Read, Update, Delete) functionality.

---

## Prerequisites

### 1. Access Requirements
- Active user account in the system
- Login credentials (username/email and password)
- Access to Digital HQ page

### 2. Test Environment
- **Frontend URL**: https://hq-creator-suite.preview.emergentagent.com
- **Backend API**: https://hq-creator-suite.preview.emergentagent.com/api
- **Digital HQ Route**: `/digital-hq`

### 3. Test Users
You can test with any valid user account. For full testing, you'll need:
- Regular user account (can manage own events)
- Admin/Manager account (can manage all events)

---

## Test Suite 1: Calendar Widget - CREATE Functionality

### Test Case 1.1: Create Basic Event
**Objective**: Verify users can create a new calendar event

**Steps**:
1. Log in to the application
2. Navigate to Digital HQ (`/digital-hq`)
3. Locate the Calendar widget
4. Click the "+" button in the top-right corner of the Calendar widget
5. Fill in the form:
   - **Title**: "Team Meeting"
   - **Event Type**: "Meeting"
   - **Start Date & Time**: Select tomorrow at 10:00 AM
   - **End Date & Time**: Select tomorrow at 11:00 AM
   - **Location**: "Conference Room A"
   - **Description**: "Weekly team sync meeting"
   - **All Day Event**: Unchecked
6. Click "Create Event" button

**Expected Result**:
- ✅ Modal closes automatically
- ✅ New event appears in the Calendar widget list
- ✅ Event displays correct title, icon (💼 for meeting), date, time, and location
- ✅ No error messages appear
- ✅ User receives +5 points (check points total)

**Pass/Fail**: ___________

---

### Test Case 1.2: Create All-Day Event
**Objective**: Verify all-day event creation

**Steps**:
1. Click the "+" button in Calendar widget
2. Fill in the form:
   - **Title**: "Company Holiday"
   - **Event Type**: "Company Event"
   - **Start Date & Time**: Select a future date
   - **All Day Event**: ✅ Checked
3. Click "Create Event"

**Expected Result**:
- ✅ Event appears without time display
- ✅ Event shows company event icon (🎉)
- ✅ Only date is displayed, no time

**Pass/Fail**: ___________

---

### Test Case 1.3: Create Deadline Event
**Objective**: Verify deadline event creation

**Steps**:
1. Click the "+" button
2. Fill in:
   - **Title**: "Project Deliverable"
   - **Event Type**: "Deadline"
   - **Start Date & Time**: Select a future date and time
3. Click "Create Event"

**Expected Result**:
- ✅ Event appears with deadline icon (⏰)
- ✅ Border color is red (border-red-500)

**Pass/Fail**: ___________

---

## Test Suite 2: Calendar Widget - READ Functionality

### Test Case 2.1: View Event List
**Objective**: Verify events display correctly

**Steps**:
1. Navigate to Digital HQ
2. Locate Calendar widget
3. Observe the list of events

**Expected Result**:
- ✅ Events are displayed in chronological order
- ✅ Each event shows: icon, title, description, date, time, location
- ✅ Event type is indicated by icon and border color
- ✅ Upcoming events are shown (not past events)

**Pass/Fail**: ___________

---

### Test Case 2.2: Empty State
**Objective**: Verify empty state when no events exist

**Steps**:
1. Delete all events (if any exist)
2. Observe the Calendar widget

**Expected Result**:
- ✅ Shows calendar emoji 📅
- ✅ Displays message "No upcoming events"
- ✅ "+" button is still visible and functional

**Pass/Fail**: ___________

---

## Test Suite 3: Calendar Widget - UPDATE (Edit) Functionality

### Test Case 3.1: Edit Event - Basic
**Objective**: Verify users can edit their own events

**Steps**:
1. Create a test event (if none exists)
2. Hover over the event card
3. Observe edit and delete buttons appear
4. Click the blue Edit button (pencil icon)
5. Verify modal opens with pre-filled data
6. Modify the following:
   - **Title**: Change to "Updated Team Meeting"
   - **Location**: Change to "Conference Room B"
7. Click "Update Event" button

**Expected Result**:
- ✅ Edit button appears on hover with smooth transition
- ✅ Modal opens with title "Edit Event"
- ✅ All form fields are pre-filled with current event data
- ✅ Date/time fields show correct values
- ✅ Submit button reads "Update Event"
- ✅ Modal closes after submission
- ✅ Event card updates with new information
- ✅ Changes persist after page refresh

**Pass/Fail**: ___________

---

### Test Case 3.2: Edit Event - Change Type
**Objective**: Verify event type can be changed

**Steps**:
1. Hover over a meeting event
2. Click Edit button
3. Change Event Type from "Meeting" to "Deadline"
4. Click "Update Event"

**Expected Result**:
- ✅ Event icon changes to ⏰
- ✅ Border color changes to red

**Pass/Fail**: ___________

---

### Test Case 3.3: Edit Event - Cancel
**Objective**: Verify cancel button works properly

**Steps**:
1. Click edit on any event
2. Make some changes to the form
3. Click "Cancel" button

**Expected Result**:
- ✅ Modal closes
- ✅ No changes are saved
- ✅ Original event data remains unchanged
- ✅ Form state is reset

**Pass/Fail**: ___________

---

### Test Case 3.4: Edit Permission Test
**Objective**: Verify permission system for editing

**Steps**:
1. As a regular user, create an event
2. Log in as a different regular user
3. Try to edit the first user's event

**Expected Result**:
- ✅ Edit button should be visible
- ✅ Clicking edit should show form
- ✅ Backend should return 403 Forbidden error when trying to update
- ✅ Event should not be updated

**Pass/Fail**: ___________

---

### Test Case 3.5: Admin Edit Permission
**Objective**: Verify admin can edit any event

**Steps**:
1. Log in as regular user, create an event
2. Log out and log in as admin
3. Navigate to Digital HQ
4. Edit the regular user's event

**Expected Result**:
- ✅ Admin can see edit button
- ✅ Admin can modify the event
- ✅ Changes save successfully
- ✅ No permission errors

**Pass/Fail**: ___________

---

## Test Suite 4: Calendar Widget - DELETE Functionality

### Test Case 4.1: Delete Event - Basic
**Objective**: Verify users can delete their own events

**Steps**:
1. Hover over an event you created
2. Observe the red Delete button (trash icon)
3. Click the Delete button
4. Observe confirmation dialog
5. Read the message: "Are you sure you want to delete this event?"
6. Click "OK" to confirm

**Expected Result**:
- ✅ Delete button appears on hover
- ✅ Confirmation dialog appears
- ✅ Dialog has clear warning message
- ✅ After confirming, event disappears from list
- ✅ No error messages appear
- ✅ Other events remain intact
- ✅ Deletion persists after page refresh

**Pass/Fail**: ___________

---

### Test Case 4.2: Delete Event - Cancel
**Objective**: Verify cancel works in delete confirmation

**Steps**:
1. Click delete button on an event
2. When confirmation dialog appears
3. Click "Cancel"

**Expected Result**:
- ✅ Dialog closes
- ✅ Event is NOT deleted
- ✅ Event remains in the list
- ✅ No changes made

**Pass/Fail**: ___________

---

### Test Case 4.3: Delete Permission Test
**Objective**: Verify permission system for deleting

**Steps**:
1. As regular user A, create an event
2. Log in as regular user B
3. Try to delete user A's event

**Expected Result**:
- ✅ Delete button should be visible
- ✅ Confirmation dialog appears
- ✅ Backend returns 403 Forbidden error
- ✅ Event is NOT deleted
- ✅ Error message logged in console

**Pass/Fail**: ___________

---

### Test Case 4.4: Admin Delete Permission
**Objective**: Verify admin can delete any event

**Steps**:
1. As regular user, create an event
2. Log in as admin
3. Delete the regular user's event

**Expected Result**:
- ✅ Admin can see delete button
- ✅ Confirmation dialog appears
- ✅ Event deletes successfully
- ✅ No permission errors

**Pass/Fail**: ___________

---

## Test Suite 5: UI/UX Testing

### Test Case 5.1: Hover Effects
**Objective**: Verify hover interactions

**Steps**:
1. Observe event cards without hovering
2. Slowly hover over an event card
3. Move mouse away

**Expected Result**:
- ✅ Edit/Delete buttons are hidden (opacity: 0) when not hovering
- ✅ Buttons smoothly fade in (opacity: 100) on hover
- ✅ Buttons smoothly fade out when hover ends
- ✅ Transition is smooth (no jerky movements)
- ✅ Card itself shows hover state (background change)

**Pass/Fail**: ___________

---

### Test Case 5.2: Button Styling
**Objective**: Verify button appearance

**Steps**:
1. Hover over an event
2. Observe edit button
3. Observe delete button
4. Hover over each button individually

**Expected Result**:
- ✅ Edit button is blue (bg-blue-500)
- ✅ Delete button is red (bg-red-500)
- ✅ Edit button shows darker blue on hover (bg-blue-600)
- ✅ Delete button shows darker red on hover (bg-red-600)
- ✅ Icons are clearly visible and sized appropriately
- ✅ Buttons have proper spacing between them

**Pass/Fail**: ___________

---

### Test Case 5.3: Dark Mode
**Objective**: Verify dark mode support

**Steps**:
1. Toggle dark mode on
2. Test all CRUD operations
3. Toggle dark mode off

**Expected Result**:
- ✅ All text is readable in both modes
- ✅ Buttons maintain proper contrast
- ✅ Event cards have appropriate background colors
- ✅ Modal styling adapts to dark mode
- ✅ No visual glitches during theme switch

**Pass/Fail**: ___________

---

### Test Case 5.4: Modal Behavior
**Objective**: Verify modal functionality

**Steps**:
1. Open create modal
2. Try clicking outside the modal
3. Close and open edit modal
4. Fill form and submit
5. Open modal and press Escape key (if supported)

**Expected Result**:
- ✅ Modal centers on screen
- ✅ Background overlay is visible
- ✅ Modal is scrollable if content is long
- ✅ Submit button is clearly visible
- ✅ Cancel button works
- ✅ Form fields are properly styled
- ✅ Modal title changes based on mode (Create vs Edit)

**Pass/Fail**: ___________

---

### Test Case 5.5: Responsive Design
**Objective**: Verify mobile responsiveness

**Steps**:
1. Open browser dev tools
2. Switch to mobile view (iPhone, Android)
3. Test all functionality

**Expected Result**:
- ✅ Widget displays properly on small screens
- ✅ Buttons are still accessible
- ✅ Modal fits on screen
- ✅ Form fields are usable on mobile
- ✅ No horizontal scrolling required
- ✅ Text is readable without zooming

**Pass/Fail**: ___________

---

## Test Suite 6: Error Handling

### Test Case 6.1: Network Error
**Objective**: Verify graceful error handling

**Steps**:
1. Open browser dev tools → Network tab
2. Throttle network to "Offline"
3. Try to create/edit/delete an event

**Expected Result**:
- ✅ Error is logged to console
- ✅ No application crash
- ✅ User-friendly behavior (modal stays open or shows retry option)
- ✅ Data is not corrupted

**Pass/Fail**: ___________

---

### Test Case 6.2: Invalid Data
**Objective**: Verify validation

**Steps**:
1. Open create/edit modal
2. Try to submit with empty required fields
3. Try to submit with end time before start time

**Expected Result**:
- ✅ Browser validation prevents submission
- ✅ Required fields are marked
- ✅ Form doesn't submit with invalid data

**Pass/Fail**: ___________

---

## Test Suite 7: Integration Testing

### Test Case 7.1: Quick Links Widget Comparison
**Objective**: Verify consistency with QuickLinksWidget

**Steps**:
1. Test QuickLinksWidget CRUD operations
2. Compare behavior with CalendarWidget

**Expected Result**:
- ✅ Both widgets use same hover pattern
- ✅ Both use same button colors and styles
- ✅ Both have similar modal designs
- ✅ Both have similar confirmation patterns
- ✅ User experience is consistent

**Pass/Fail**: ___________

---

### Test Case 7.2: Points System
**Objective**: Verify gamification integration

**Steps**:
1. Note current points total
2. Create a new event
3. Check points total

**Expected Result**:
- ✅ Points increase by 5 after creating event
- ✅ Points are visible in user profile
- ✅ Leaderboard updates (if applicable)

**Pass/Fail**: ___________

---

## Test Suite 8: Performance Testing

### Test Case 8.1: Multiple Events
**Objective**: Test with many events

**Steps**:
1. Create 10+ events
2. Observe load time and scrolling
3. Edit/delete events

**Expected Result**:
- ✅ Widget loads quickly
- ✅ Scrolling is smooth
- ✅ No lag when hovering
- ✅ Operations remain fast

**Pass/Fail**: ___________

---

## Test Suite 9: Data Persistence

### Test Case 9.1: Page Refresh
**Objective**: Verify data persists

**Steps**:
1. Create an event
2. Edit an event
3. Refresh the page
4. Check if changes are still there

**Expected Result**:
- ✅ Created events still exist
- ✅ Edited changes are preserved
- ✅ Deleted events don't reappear

**Pass/Fail**: ___________

---

## Test Suite 10: Accessibility

### Test Case 10.1: Keyboard Navigation
**Objective**: Verify keyboard accessibility

**Steps**:
1. Use Tab key to navigate
2. Use Enter/Space to activate buttons
3. Test form navigation

**Expected Result**:
- ✅ All buttons are reachable via keyboard
- ✅ Tab order is logical
- ✅ Enter key submits forms
- ✅ Escape key closes modals (if implemented)

**Pass/Fail**: ___________

---

## Bug Report Template

If you find any issues during testing, please report using this format:

```
**Bug ID**: BUG-001
**Test Case**: [Test case number]
**Severity**: [Critical/High/Medium/Low]
**Priority**: [High/Medium/Low]

**Description**:
[Clear description of the bug]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots**:
[Attach if applicable]

**Browser/Device**:
[Browser name and version, device if mobile]

**Console Errors**:
[Any JavaScript errors from console]

**Additional Notes**:
[Any other relevant information]
```

---

## Test Summary Report

**Test Date**: _______________
**Tested By**: _______________
**Browser/Device**: _______________

### Results
- **Total Test Cases**: 35
- **Passed**: _____
- **Failed**: _____
- **Skipped**: _____
- **Pass Rate**: _____%

### Critical Issues Found
1. [List critical issues if any]

### Recommendations
[Any recommendations for improvement]

### Sign-off
**Tester Name**: _______________
**Signature**: _______________
**Date**: _______________

---

## Quick Smoke Test (5 Minutes)

If you have limited time, run this quick smoke test:

1. ✅ Create a new event
2. ✅ Edit the event you just created
3. ✅ Delete the event
4. ✅ Check that all operations work smoothly
5. ✅ Verify no errors in browser console

**Status**: _______________

---

## Additional Resources

- **Documentation**: `/app/DIGITAL_HQ_ENHANCEMENT_SUMMARY.md`
- **Changelog**: `/app/ENHANCEMENT_CHANGELOG.md`
- **API Docs**: https://hq-creator-suite.preview.emergentagent.com/docs
- **Original Implementation**: `/app/DIGITAL_HQ_IMPLEMENTATION.md`

---

**Testing Status**: Ready for execution
**Last Updated**: August 2025

