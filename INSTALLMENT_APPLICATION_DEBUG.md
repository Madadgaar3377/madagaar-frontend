# Installment Application Troubleshooting Guide

## Issue: "Plan Not Found" Error

This error occurs when the backend cannot find the installment plan using the provided `installmentPlanId`.

---

## Root Cause Analysis

The backend code uses:
```javascript
const installmentPlan = await InstallmentPlan.findOne({ installmentPlanId });
```

This means the backend is looking for a document where the **field** `installmentPlanId` matches the value sent from the frontend.

### Key Points:
1. **Not using MongoDB `_id`**: The backend searches by a custom field `installmentPlanId`, NOT by MongoDB's `_id`
2. **Schema Field**: Your `InstallmentPlan` schema must have a field called `installmentPlanId`
3. **Mismatch**: If the frontend sends `_id` but backend expects `installmentPlanId`, it will fail

---

## Debugging Steps

### Step 1: Check the InstallmentPlan Schema

Your backend `InstallmentPlan` schema should have:
```javascript
const InstallmentPlanSchema = new Schema({
  installmentPlanId: {
    type: String,
    required: true,
    unique: true
  },
  // ... other fields
});
```

### Step 2: Check Database Records

Run this MongoDB query to see what fields exist:
```javascript
db.installmentplans.findOne({}, { installmentPlanId: 1, _id: 1, productName: 1 })
```

Expected output:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "installmentPlanId": "INST-001",  // This field must exist!
  "productName": "iPhone 15"
}
```

### Step 3: Check Frontend Debug Info

When you visit `/installment/:id/apply`, check the browser console for:
```
Fetched plan: { installmentPlanId: "...", _id: "...", ... }
```

And check the blue debug box on the page (development mode only).

---

## Solutions

### Solution 1: Backend Uses `_id` (Recommended)

**Change backend code** to use MongoDB's `_id` instead:

```javascript
// OLD (current - causes error):
const installmentPlan = await InstallmentPlan.findOne({ installmentPlanId });

// NEW (recommended):
const installmentPlan = await InstallmentPlan.findById(installmentPlanId);
// OR
const installmentPlan = await InstallmentPlan.findOne({ _id: installmentPlanId });
```

**Why?** This is simpler and works with the existing data structure.

### Solution 2: Add `installmentPlanId` Field to All Records

If you want to keep the backend code as-is, ensure all installment plan documents have an `installmentPlanId` field.

**Migration Script:**
```javascript
// Run this once to add installmentPlanId to existing records
const plans = await InstallmentPlan.find();
for (const plan of plans) {
  if (!plan.installmentPlanId) {
    plan.installmentPlanId = plan._id.toString();
    // OR generate a custom ID:
    // plan.installmentPlanId = `INST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await plan.save();
  }
}
```

### Solution 3: Frontend Sends Correct Field

The frontend is already set up to handle both:
```javascript
const planId = plan?.installmentPlanId || plan?._id;
```

This should work IF the plan object has one of these fields.

---

## Testing the Fix

### 1. Check Console Logs

Open browser DevTools (F12) and look for:
```
Fetched plan: { ... }
Submitting application with planId: ...
Application data: { installmentPlanId: "...", ... }
Backend response: { ... }
```

### 2. Check Network Tab

- Request URL: `POST /applyInstallment`
- Request Payload: Should show `installmentPlanId: "some-value"`
- Response: Check for specific error message

### 3. Check Backend Logs

Add logging in your backend:
```javascript
console.log('Looking for plan with installmentPlanId:', installmentPlanId);
const installmentPlan = await InstallmentPlan.findOne({ installmentPlanId });
console.log('Found plan:', installmentPlan);
```

---

## Common Error Messages and Fixes

### "Plan Not Found"
- **Cause**: `installmentPlanId` field doesn't exist in database
- **Fix**: Use Solution 1 (change backend to use `_id`)

### "Missing required fields: userId and installmentPlanId are required"
- **Cause**: Frontend not sending `installmentPlanId`
- **Fix**: Check that plan object has `installmentPlanId` or `_id` field

### "User account is not verified"
- **Cause**: User's `isVerified` field is `false`
- **Fix**: Verify the user account first or temporarily disable this check in development

### "Creator ID not found in installment plan"
- **Cause**: Plan's `createdBy` array is empty
- **Fix**: Ensure plans have a `createdBy` field populated when created

---

## Quick Fix Summary

**Option A (Fastest):** Update backend to use `_id`:
```javascript
// In applyForInstallment function:
const installmentPlan = await InstallmentPlan.findById(installmentPlanId);
```

**Option B:** Run migration to add `installmentPlanId` to all existing plans:
```javascript
await InstallmentPlan.updateMany(
  { installmentPlanId: { $exists: false } },
  [{ $set: { installmentPlanId: { $toString: "$_id" } } }]
);
```

---

## Verification Checklist

After implementing the fix:

- [ ] Can fetch plan details on apply page
- [ ] Debug box shows `installmentPlanId` or `_id`
- [ ] Form submits without "Plan Not Found" error
- [ ] Backend finds the installment plan
- [ ] Application is created successfully
- [ ] User is redirected to dashboard
- [ ] Application appears in dashboard

---

## Need Help?

1. **Check browser console** for debug logs
2. **Check backend console** for error logs
3. **Check network tab** for API request/response
4. **Verify database** has the expected fields

**Current Frontend Changes:**
- Added debug panel (development mode)
- Added console logs for tracking
- Improved error messages
- Handles both `installmentPlanId` and `_id` fields
