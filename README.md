# CursorSMS

A bridge between Twilio SMS/WhatsApp and your local environment opened in a cursor session, enabling automated responses using a local process (e.g., AI or script) via file-based communication and AutoHotkey scripting.

## Video Demonstration
https://www.youtube.com/watch?v=bb4guJGzTUY


https://github.com/user-attachments/assets/1f4d6835-7917-43de-b0be-ce457aba6324


## Features
- Receive SMS or WhatsApp messages via Twilio.
- Write incoming messages to `input.txt`.
- Trigger a local AutoHotkey script (`cursor_input.ahk`) to process the message.
- Await a response written to `output.txt`.
- Send the response back to the original sender via Twilio.

## How It Works
1. **Incoming Message**: A user sends an SMS or WhatsApp message to your Twilio number.
2. **Webhook Handling**: `server.js` receives the message, writes it to `input.txt`, and immediately responds to Twilio with a placeholder message.
3. **Local Processing**:
    - `watcher.js` detects changes to `input.txt` and triggers `cursor_input.ahk`.
    - The AHK script simulates user input in the "Cursor" window, pastes the message, and waits for a response to be written to `output.txt`.
4. **Response Delivery**: Once `output.txt` is updated, `server.js` reads the response and sends it back to the original sender via Twilio.

## Project Structure
- `server.js`: Express server handling Twilio webhooks and response logic.
- `watcher.js`: Watches `input.txt` for changes and triggers the AHK script.
- `cursor_input.ahk`: AutoHotkey script that interacts with the "Cursor" application, pastes the message, and waits for a response.
- `input.txt`: Receives incoming messages for processing.
- `output.txt`: The local process writes responses here, which are then sent back via Twilio.

## Prerequisites
- Node.js (v14+ recommended)
- [AutoHotkey v2](https://www.autohotkey.com/) installed at `C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe`
- Twilio account with SMS and/or WhatsApp enabled
- The "Cursor" application (or any app that can process pasted input and write to `output.txt`)

## Setup
1. **Clone the repository** and install dependencies:
   ```bash
   npm install
   ```
2. **Configure environment variables** in a `.env` file:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER_SMS=+1234567890
   TWILIO_PHONE_NUMBER_WHATSAPP=whatsapp:+1234567890
   ```
3. **Configure output and input** file paths in ahk script in cursor_input.ahk
   ```ahk
   InputFile :=enter path to .txt file 
   OutputFile :=enter path to .txt file
   ```
4. **Set up ngrok** (for local development):
   - Install ngrok if you haven't already: https://ngrok.com/download
   - Sign up for a free ngrok account and get your authtoken
   - Authenticate ngrok: `ngrok config add-authtoken YOUR_AUTH_TOKEN`
   - Expose your local server: `ngrok http 3000`
   - Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
  
5. **Set up Twilio Webhook**:
   - Point your Twilio SMS/WhatsApp webhook to `https://your-ngrok-url.ngrok.io/sms`
   - Use the HTTPS URL from the previous ngrok step

6. **Start the services**:
   - Start the Node.js server:
     ```bash
     node server.js
     ```
   - In a separate terminal, start the watcher:
     ```bash
     node watcher.js
     ```
    

## Usage
- Send an SMS or WhatsApp message to your Twilio number.
- The message will be processed by your local environment (via the AHK script and the "Cursor" app), and the response will be sent back automatically.
- If the message contains "Whatsapp" it will instead check to make sure the sms pipleine is functioning.

## Note
- Due to using free tier level of services with message limits, timeouts will occur within 15 seconds after a pending message is sent to the user after their message is sent with a command. Running lengthier or more complex commands will lead to a timeout. Twilio requires an interaction every 15 seconds or less. 

## Example Workflow
1. User sends: `Can you check to see if my packages are up to date.?`
2. `input.txt` receives:
   ```
   Can you check to see if my packages are up to date?
   ```
3. The AHK script triggers, pastes the message into the "Cursor" app, and waits for a response.
4. Once the response is written to `output.txt`, it is sent back to the user via Twilio.

## Customization
- Modify `cursor_input.ahk` to change how the message is processed or which application is targeted.
- Integrate with any local AI or script that can read from `input.txt` and write to `output.txt`.

## Troubleshooting
- Ensure all file paths in the scripts match your local setup.
- Make sure the "Cursor" window is open and accessible by AutoHotkey.
- Check Twilio logs for webhook errors.

## License
ISC
