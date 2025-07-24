// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const twilio = require('twilio');

// Initialize Express app
const app = express();
// Parse URL-encoded bodies (as sent by Twilio)
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize Twilio client with credentials from environment variables
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Twilio phone numbers for WhatsApp and SMS
const WHATSAPP_FROM = process.env.TWILIO_PHONE_NUMBER_WHATSAPP;  // Your WhatsApp sandbox Twilio number
const SMS_FROM = process.env.TWILIO_PHONE_NUMBER_SMS;            // Your Twilio SMS number

// Handle incoming SMS/WhatsApp webhook from Twilio
app.post('/sms', (req, res) => {
  // Extract and normalize the incoming message
  const incomingMessage = req.body.Body?.trim().toLowerCase() || "";
  const toNumber = req.body.From;

  console.log("[SMS] Received from", toNumber, "message:", incomingMessage);

  // Detect if the message is from WhatsApp based on the sender's number
  const isWhatsapp = toNumber.startsWith("whatsapp:");
  const fromNumber = isWhatsapp ? WHATSAPP_FROM : SMS_FROM;

  // Special case: respond to WhatsApp connection check
  if (incomingMessage.includes("whatsapp")) {
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message("Status: Whatsapp connected");
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }

  // Define paths for input and output files
  const inputPath = path.join(__dirname, 'input.txt');
  const outputPath = path.join(__dirname, 'output.txt');

  // Write the incoming message to input.txt for local processing
  fs.writeFileSync(inputPath, incomingMessage);
  console.log(`[File] Wrote message to input.txt: ${incomingMessage}`);

  // Respond immediately to Twilio webhook to avoid timeout
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message("Your request is being processed. You'll get a reply soon.");
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());

  // Poll output.txt for changes to send the final response
  const maxWaitTime = 30000; // Maximum wait time: 30 seconds
  const pollInterval = 500;  // Poll every 500ms
  let waited = 0;
  // Get the original modification time of output.txt (if it exists)
  let originalMTime = fs.existsSync(outputPath) ? fs.statSync(outputPath).mtimeMs : 0;

  // Start polling for output.txt changes
  const poll = setInterval(() => {
    if (fs.existsSync(outputPath)) {
      const newMTime = fs.statSync(outputPath).mtimeMs;
      // If output.txt has been updated, send the response
      if (newMTime > originalMTime) {
        clearInterval(poll);
        const result = fs.readFileSync(outputPath, 'utf-8').trim();
        console.log(`[Polling] output.txt updated. Sending final response.`);

        // Send the result back to the original sender via Twilio
        client.messages.create({
          body: result || "AI returned an empty response.",
          from: fromNumber,
          to: toNumber,
        }).then(() => {
          console.log("[Twilio] Final response sent.");
        }).catch(err => {
          console.error("[Twilio] Error sending message:", err.message);
        });
      }
    }

    waited += pollInterval;
    // If max wait time exceeded, send a timeout message
    if (waited >= maxWaitTime) {
      clearInterval(poll);
      console.log("[Polling] Timed out. Sending fallback message.");

      client.messages.create({
        body: "Timed out waiting for AI to respond.",
        from: fromNumber,
        to: toNumber,
      }).catch(err => {
        console.error("[Twilio] Error sending timeout message:", err.message);
      });
    }
  }, pollInterval);
});

// Start the Express server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
