⚠️ Everything in this repo is AI generated

# Lofi Music Reminder

Lofi Music Reminder is a Deno script that checks if audio is playing on your Mac and suggests lofi music videos to play if it's not. It's perfect for maintaining a productive atmosphere while working or studying.

## Features

- Checks if audio is currently playing on macOS
- Presents a list of curated lofi music videos when no audio is detected
- Opens the selected video in your default browser
- Allows snoozing notifications for 1 hour
- Easy to customize with your own list of favorite lofi videos
- Stores snooze information in the user's home directory

## Prerequisites

- macOS (uses `pmset` and `osascript`)
- [Deno](https://deno.land/) installed on your system

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/kandros/lofi-music-reminder.git
   cd lofi-music-reminder
   ```

2. Ensure you have Deno installed. If not, follow the [official Deno installation guide](https://deno.land/#installation).

## Usage

Run the script using Deno:

```
deno run --allow-run --allow-read --allow-write --allow-env main.ts
```

Note: The `--allow-env` flag is needed to access the home directory for storing the snooze file.

The script will:
1. Check if audio is playing
2. If no audio is playing, show a notification with lofi video options
3. If a video is selected, open it in your default browser
4. If "Snooze for 1 hour" is selected, snooze notifications for 1 hour
5. If audio is already playing, the script will exit without showing any notification

The snooze information is stored in a `.lofi_snooze` file in your home directory.

## Running on a Schedule

To run the script automatically at regular intervals, you can use `launchd` on macOS. Here's how to set it up:

1. Create a shell script to run the Deno script. Save it as `run_lofi_reminder.sh` in the project directory:

```bash
#!/bin/bash
/path/to/deno run --allow-run --allow-read --allow-write --allow-env /path/to/lofi-music-reminder/main.ts
```

Replace `/path/to/deno` with the actual path to your Deno executable (find it by running `which deno`), and update the path to the `main.ts` file accordingly.

2. Make the shell script executable:

```
chmod +x run_lofi_reminder.sh
```

3. Create a `launchd` property list file. Save it as `com.lofi-music-reminder.plist` in your `~/Library/LaunchAgents/` directory:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.lofi-music-reminder</string>
    <key>ProgramArguments</key>
    <array>
        <string>/path/to/lofi-music-reminder/run_lofi_reminder.sh</string>
    </array>
    <key>StartInterval</key>
    <integer>1800</integer>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
```

Replace `/path/to/lofi-music-reminder/run_lofi_reminder.sh` with the actual path to your shell script.

4. Load the `launchd` job:

```
launchctl load ~/Library/LaunchAgents/com.lofi-music-reminder.plist
```

This will run the script every 30 minutes (1800 seconds). Adjust the `StartInterval` value if you want a different frequency.

To stop the scheduled job, use:

```
launchctl unload ~/Library/LaunchAgents/com.lofi-music-reminder.plist
```

## Customization

You can customize the list of lofi videos by editing the `LOFI_VIDEOS` array in `main.ts`:

```typescript
const LOFI_VIDEOS = [
  { title: "Your Custom Video", url: "https://www.youtube.com/watch?v=your_video_id" },
  // Add more videos here
];
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
