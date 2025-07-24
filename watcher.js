// Import required modules
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Define the path to the input file that will be watched
const inputPath = path.join(__dirname, 'input.txt');
// const outputPath = path.join(__dirname, 'output.txt'); // Not used, but could be referenced if needed
// Path to the AutoHotkey script
const ahkScriptPath = 'cursor_input.ahk';

// Store the last processed command to avoid duplicate triggers
let lastCommand = '';

// Watch for changes to input.txt
fs.watchFile(inputPath, (curr, prev) => {
  // Read the latest command from input.txt
  const command = fs.readFileSync(inputPath, 'utf-8').trim();

  // If the command is new and not empty, trigger the AHK script
  if (command && command !== lastCommand) {
    lastCommand = command;

    console.log("Triggering AHK with command:", command);

    // Execute the AutoHotkey script to process the input
    // The AHK script will handle writing to output.txt
    exec(`"C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey64.exe" "${ahkScriptPath}"`, (err, stdout, stderr) => {
      if (err) {
        console.error("AHK Error:", err);
        return;
      }

      console.log("AHK script finished.");
    });
  }
});
