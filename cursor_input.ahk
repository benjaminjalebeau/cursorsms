; Set the window title match mode to allow partial matches
SetTitleMatchMode(2)

; Define the paths to the input and output files
InputFile := "C:\\Users\\Benja\\OneDrive\\Documents\\JobApplications\\Challenges\\CursorSMS\\input.txt"
OutputFile := "C:\\Users\\Benja\\OneDrive\\Documents\\JobApplications\\Challenges\\CursorSMS\\output.txt"

; Check if the input file exists
if !FileExist(InputFile) {
    MsgBox("Input file not found!")
    ExitApp()
}

; Read and trim the command text from the input file
CommandText := Trim(FileRead(InputFile))
if (CommandText = "")
    ExitApp()

; Append a save instruction for the AI or script
CommandText := CommandText . "`n`nPlease overwrite the file at:`n" . OutputFile . "`nwith your full response."

; Record the original modification time of the output file (if it exists)
if FileExist(OutputFile)
    OriginalTime := FileGetTime(OutputFile, "M")
else
    OriginalTime := ""

; Check if the "Cursor" window exists
if WinExist("Cursor") {
    WinActivate() ; Bring the window to the foreground
    Sleep(1000)

    Click 300, 300 ; Click at coordinates (300, 300) to focus input
    Sleep(300)

    A_Clipboard := CommandText ; Copy the command text to the clipboard
    Sleep(300)

    Send("^i") ; Simulate Ctrl+I to open input (if required by the app)
    Sleep(600)
    Send("^v") ; Simulate Ctrl+V to paste the command
    Sleep(300)
    Send("{Enter}") ; Press Enter to submit

    ; Wait up to 60 seconds for the output file to be updated
    Loop 60 {
        Sleep(1000)
        if FileExist(OutputFile) {
            NewTime := FileGetTime(OutputFile, "M")
            if (NewTime != OriginalTime) {
                ; Output file has been updated, exit loop
                break
            }
        }
    }
} else {
    ; Show an error if the Cursor window is not found
    MsgBox("Cursor window not found!")
}

ExitApp()
