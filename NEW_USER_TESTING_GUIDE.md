# NEW USER TESTING GUIDE
## How to Test as a Fresh User

### 🔧 SESSION CLEARING METHODS

#### Method 1: API Endpoint (Recommended)
```bash
# Call this endpoint to completely clear your session
curl -X POST http://localhost:5000/api/clear-session

# Or on deployed Replit:
curl -X POST https://your-replit-url.replit.dev/api/clear-session
```

#### Method 2: Browser Developer Tools
1. Open browser Developer Tools (F12)
2. Go to **Application** tab → **Storage** → **Cookies**
3. Delete the `connect.sid` cookie
4. Refresh the page

#### Method 3: Incognito/Private Browsing
- Open new incognito/private browser window
- Visit your deployed Replit URL
- This gives you a completely fresh session

#### Method 4: Different Browser
- Use a different browser (Chrome vs Firefox vs Safari)
- Or different device (phone vs desktop)

### 📱 TESTING ON PHONE
If you're getting auto-logged in on your phone:

1. **Clear Browser Data**:
   - Chrome: Settings → Privacy → Clear Browsing Data → Cookies
   - Safari: Settings → Safari → Clear History and Website Data

2. **Use Private Browsing**:
   - Open new private/incognito tab
   - Navigate to your Replit deployment URL

3. **Use Different Browser**:
   - Try different browser app on your phone

### 🧪 COMPLETE NEW USER TEST PROTOCOL

Once you have a fresh session:

#### Step 1: Landing Page Test
- [ ] Hero section displays correctly
- [ ] €97 pricing shows properly  
- [ ] "Get Started" button works

#### Step 2: Payment Flow Test
- [ ] Click "Get Started" → redirects to pricing
- [ ] Select €97 plan → redirects to checkout
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Payment processes successfully

#### Step 3: Login & Onboarding Test
- [ ] After payment → login creates new user session
- [ ] 6-step onboarding loads correctly
- [ ] Brand story, goals, style preferences save
- [ ] Selfie upload works (test with 10+ images)

#### Step 4: AI Training Test
- [ ] Training starts with uploaded selfies
- [ ] Status indicator shows progress
- [ ] Gallery displays generated AI photos

#### Step 5: Styleguide Test
- [ ] Templates load with user's AI images
- [ ] Color and typography customization works
- [ ] Sandra AI chat provides contextual help

#### Step 6: Landing Page Builder Test
- [ ] Page customization interface loads
- [ ] User can edit content and layout
- [ ] Preview updates in real-time

### 🚨 TESTING BLOCKERS & SOLUTIONS

#### If Still Auto-Logged In:
1. Call the clear session endpoint
2. Close all browser tabs
3. Open fresh incognito window
4. Try different device/browser

#### If Payment Fails:
- Use test card: `4242 4242 4242 4242`
- Ensure you're in Stripe test mode
- Check console for error messages

#### If Onboarding Doesn't Save:
- Check browser console for API errors
- Verify internet connection
- Try refreshing and re-entering data

### 📞 WHEN TO CONTACT SUPPORT

Contact me if you experience:
- Unable to clear session after trying all methods
- Payment processing fails with test card
- Database errors during onboarding
- Missing AI images in gallery
- Styleguide templates not loading

**The goal is to experience the platform exactly as your beta testers will.**