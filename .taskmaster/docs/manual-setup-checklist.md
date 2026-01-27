# Manual Setup Checklist - Before Code Implementation

## ✅ You Already Have (No Action Needed)
- ✅ Supabase URL
- ✅ Supabase Anon Key
- ✅ Supabase Service Role Key
- ✅ Supabase Access Token

## 🔧 Manual Steps Required

### Step 1: Set Up Resend Account (5-10 minutes)

1. **Create Resend Account** (if you don't have one)
   - Go to https://resend.com
   - Sign up for a free account
   - Verify your email

2. **Get Resend API Key**
   - In Resend Dashboard, go to "API Keys"
   - Click "Create API Key"
   - Name it something like "Supabase OTP"
   - Copy the API key (starts with `re_...`)
   - ⚠️ **Save this - you'll need it for Step 2**

3. **Verify Domain** (Optional but Recommended)
   - Go to "Domains" in Resend
   - Add your domain (e.g., `yourdomain.com`)
   - Follow DNS setup instructions to verify
   - This allows you to send from `noreply@yourdomain.com` instead of `onboarding@resend.dev`

### Step 2: Configure Supabase Auth Settings (10-15 minutes)

1. **Enable Email Provider**
   - Go to your Supabase Dashboard: https://app.supabase.com
   - Select your project
   - Navigate to: **Authentication** → **Providers**
   - Find **Email** provider
   - Click to enable it
   - Under "Email OTP" settings:
     - ✅ Enable "Enable email confirmations" (optional, but recommended)
     - Set OTP expiration (default 3600 seconds = 1 hour is fine)
     - Set OTP length (default 6 digits is fine)

2. **Configure SMTP Settings (Resend)**
   - Still in Supabase Dashboard
   - Navigate to: **Settings** → **Auth** → Scroll to **SMTP Settings**
   - Enable "Custom SMTP"
   - Fill in the following:
     ```
     SMTP Host: smtp.resend.com
     SMTP Port: 465 (or 587 for TLS)
     SMTP User: resend
     SMTP Password: [Your Resend API Key from Step 1]
     Sender Email: onboarding@resend.dev (or your verified domain email)
     Sender Name: MLCC Admin (or your preferred name)
     ```
   - Click "Save"

3. **Test SMTP Connection**
   - In Supabase Dashboard, go to **Authentication** → **Users**
   - Try to invite a test user or send a test email
   - Check if email arrives (may go to spam initially)

### Step 3: Configure Email Templates (Optional, 5 minutes)

1. **Customize OTP Email Template**
   - In Supabase Dashboard: **Authentication** → **Email Templates**
   - Find "Magic Link" or "OTP" template
   - Customize the email subject and body if desired
   - The default template should work fine for testing

### Step 4: Set Redirect URLs (5 minutes)

1. **Configure Site URL**
   - In Supabase Dashboard: **Settings** → **Auth**
   - Set **Site URL** to: `http://localhost:3000` (for development)
   - For production, add your production URL

2. **Add Redirect URLs** (if using magic links)
   - In **Settings** → **Auth** → **Redirect URLs**
   - Add: `http://localhost:3000/**` (for development)
   - Add your production URL when ready

### Step 5: Update Environment Variables (2 minutes)

Add these to your `.env.local` file:

```env
# Resend Configuration (for custom email sending if needed)
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Note**: The Resend API key is primarily used in Supabase SMTP settings. You may not need it in your `.env.local` unless you plan to send custom emails outside of Supabase.

## ✅ Verification Checklist

Before proceeding with code implementation, verify:

- [ ] Resend account created and API key obtained
- [ ] Supabase Email provider enabled
- [ ] Supabase SMTP configured with Resend credentials
- [ ] Test email sent successfully from Supabase
- [ ] Site URL configured in Supabase Auth settings
- [ ] Environment variables updated (if needed)

## 🚨 Common Issues

**Email not arriving?**
- Check spam folder
- Verify Resend API key is correct in SMTP settings
- Check Resend dashboard for email logs/delivery status
- Ensure domain is verified if using custom domain

**SMTP connection failed?**
- Double-check port number (465 for SSL, 587 for TLS)
- Verify SMTP user is exactly "resend" (lowercase)
- Ensure API key is correct (starts with `re_`)

**OTP not working?**
- Verify Email provider is enabled (not just configured)
- Check OTP expiration settings
- Ensure Site URL is set correctly

## 📝 Next Steps After Manual Setup

Once you've completed all manual steps above, let me know and I can:
1. Start implementing the code changes
2. Update the login flow
3. Create the OTP API endpoints
4. Migrate session management

---

**Estimated Time**: 20-30 minutes total
