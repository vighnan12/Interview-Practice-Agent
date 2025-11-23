# Groq API Setup Guide

## Why Groq?
- ✅ **100% FREE** - No billing, no credit card required
- ⚡ **Extremely Fast** - Responses typically under 1 second
- 🚀 **Easy Setup** - Just get an API key and you're ready

## Step 1: Get Your Free Groq API Key

1. **Visit Groq Console:**
   - Go to: https://console.groq.com/
   
2. **Sign Up (Free):**
   - Click "Sign Up" or "Get Started"
   - Use your email or Google account
   - **No credit card required!**

3. **Create API Key:**
   - After signing in, go to: https://console.groq.com/keys
   - Click "Create API Key"
   - Give it a name (e.g., "Interview Practice App")
   - Click "Submit"
   - **Copy the API key immediately** (you won't see it again!)

## Step 2: Update Your .env File

1. Open `server/.env` file
2. Replace the `GROQ_API_KEY` value with your new key:

```
PORT=3000
GROQ_API_KEY=your_actual_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

**Important:** 
- Remove any quotes around the API key
- Make sure there are no spaces
- The API key should start with `gsk_` (Groq keys start with this)

## Step 3: Restart Your Server

```powershell
# Stop any running server
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start the server
cd server
npm run dev
```

## Available Groq Models

You can change `GROQ_MODEL` in your `.env` file:

- `llama-3.1-8b-instant` (default, fast and reliable)
- `llama-3.1-70b-versatile` (if available, check Groq console for latest models)
- `mixtral-8x7b-32768` (alternative option)

## Testing

Once your server is running, test it:

```powershell
Invoke-WebRequest -Uri http://localhost:3000/health
```

Should return: `{"status":"ok"}`

## Troubleshooting

**Error: "GROQ_API_KEY is not set"**
- Make sure your `.env` file is in the `server` directory
- Check that the key doesn't have quotes around it
- Restart the server after updating `.env`

**Error: "Invalid API key"**
- Verify your API key at https://console.groq.com/keys
- Make sure you copied the entire key (they're long!)
- Check for any extra spaces or characters

**Still having issues?**
- Check the server console for detailed error messages
- Verify the API key is active in Groq console
- Make sure you're using the latest version of `groq-sdk`

