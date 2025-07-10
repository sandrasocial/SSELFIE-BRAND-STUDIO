# New User Journey Testing Guide - July 10, 2025

## How to Test as Different Users

### 🆕 Test as COMPLETELY NEW USER
**URL:** `http://localhost:5000/api/login?user=new`

**What this simulates:**
- Brand new user with random email (newuser123@example.com)
- No previous onboarding data
- Fresh user ID (newuser12345)
- Should trigger complete onboarding flow
- Perfect for testing: payment → onboarding → AI training → studio access

### 👤 Test as EXISTING USER  
**URL:** `http://localhost:5000/api/login?user=existing`

**What this simulates:**
- Returning user (existinguser42585527)
- May have completed onboarding
- Should go directly to studio workspace
- Perfect for testing: returning user experience

### 🧪 Test as DEFAULT USER
**URL:** `http://localhost:5000/api/login`

**What this simulates:**
- Standard test user
- Random test ID
- Clean slate for general testing

## Complete New User Journey Test Plan

### Step 1: Start as Visitor (Not Logged In)
1. Visit landing page
2. Browse pricing, about, features
3. Click "Get Started" or "Buy Now"

### Step 2: Complete Payment Flow
1. Select €97 SSELFIE Studio plan
2. Enter payment details (use Stripe test cards)
3. Complete checkout process
4. Verify payment success page

### Step 3: Login as New User
1. Use: `http://localhost:5000/api/login?user=new`
2. Should redirect to onboarding (if payment completed)
3. Or workspace (if no payment verification needed)

### Step 4: Test Complete Onboarding
1. Step 1: Brand story and mission
2. Step 2: Business goals and target audience  
3. Step 3: Voice and style preferences
4. Step 4: Upload 10+ selfies for AI training
5. Step 5: AI training progress (20-minute wait)
6. Step 6: Welcome to studio

### Step 5: Test Studio Features
1. AI Photoshoot: Generate new images
2. Gallery: View saved images
3. Styleguide: Create brand templates
4. Landing Builder: Build business pages
5. Sandra AI: Chat with AI assistant

## Test Cards for Stripe

**Successful Payment:**
- Card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits

**Payment Requires Authentication:**
- Card: 4000 0025 0000 3155
- Expiry: Any future date  
- CVC: Any 3 digits

## Testing Checklist

### Payment Flow
- [ ] Landing page loads correctly
- [ ] Pricing page shows €97 option
- [ ] Checkout processes payment
- [ ] Payment success page displays
- [ ] User can access studio after payment

### Authentication Flow  
- [ ] New user login creates unique session
- [ ] Logout destroys session properly
- [ ] User data persists across requests
- [ ] Different user types work correctly

### Onboarding Flow
- [ ] New users see onboarding
- [ ] All 6 steps save data properly
- [ ] Photo upload works correctly
- [ ] AI training starts successfully
- [ ] Progress tracking displays correctly

### Studio Features
- [ ] Workspace loads with user data
- [ ] AI generation works (if trained)
- [ ] Gallery shows user images
- [ ] Styleguide creation functional
- [ ] Sandra AI responds correctly

## Current Status: Ready for Testing
All systems operational for complete new user journey testing.