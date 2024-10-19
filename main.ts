// if [[ "$(pmset -g | grep ' sleep')" == *"coreaudiod"* ]]; then echo audio is playing; else echo no audio playing; fi

import { exec, OutputMode } from "https://deno.land/x/exec@0.0.5/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";

const LOFI_VIDEOS = [
  { title: "Lofi Girl", url: "https://www.youtube.com/watch?v=jfKfPfyJRdk" },
  { title: "Lofi Pirates", url: "https://www.youtube.com/watch?v=EHUgg7Y2__Q" },
  { title: "80's Tokyo Vibes", url: "https://www.youtube.com/watch?v=1fgKHmPKiQo" },
  { title: "Chillhop Raccoon", url: "https://www.youtube.com/watch?v=7NOSDKb0HlU" },
  { title: "Lofi Coding", url: "https://www.youtube.com/watch?v=f02mOEt11OQ" },
  { title: "Jazz Vibes", url: "https://www.youtube.com/watch?v=Dx5qFachd3A" },
  { title: "Coffee Shop Ambience", url: "https://www.youtube.com/watch?v=h2zkV-l_TbY" },
];

const HOME_DIR = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";
const SNOOZE_FILE = join(HOME_DIR, ".lofi_snooze");

async function isAudioPlaying(): Promise<boolean> {
  try {
    const { output } = await exec("pmset -g", { output: OutputMode.Capture });
    return output.includes("coreaudiod") && output.includes("sleep");
  } catch (error) {
    console.error("Error checking audio status:", error);
    return false;
  }
}

async function showNotification(title: string, message: string): Promise<string | null> {
  const escapedTitle = title.replace(/'/g, "'\"'\"'");
  const escapedMessage = message.replace(/'/g, "'\"'\"'");
  const videoOptions = LOFI_VIDEOS.map((v) => `"${v.title}"`).join(", ");

  const script = `
    set videoTitles to {${videoOptions}}
    set allOptions to videoTitles & {"Snooze for 1 hour"}
    set chosenOption to choose from list allOptions with prompt "${escapedMessage}" with title "${escapedTitle}" default items {item 1 of videoTitles}
    return chosenOption
  `;

  const process = Deno.run({
    cmd: ["osascript", "-e", script],
    stdout: "piped",
    stderr: "piped",
  });

  const [status, stdout, stderr] = await Promise.all([process.status(), process.output(), process.stderrOutput()]);

  process.close();

  if (!status.success) {
    const errorMessage = new TextDecoder().decode(stderr);
    if (!errorMessage.includes("User canceled")) {
      console.error("AppleScript error:", errorMessage);
    }
    return null;
  }

  const chosenOption = new TextDecoder().decode(stdout).trim();
  return chosenOption || null;
}

async function openYouTube(videoTitle: string) {
  const video = LOFI_VIDEOS.find((v) => v.title === videoTitle);
  if (video) {
    const process = new Deno.Command("open", { args: [video.url] });
    await process.output();
  } else {
    console.error("Video not found:", videoTitle);
  }
}

async function setSnooze() {
  const snoozeUntil = Date.now() + 60 * 60 * 1000; // 1 hour from now
  await Deno.writeTextFile(SNOOZE_FILE, snoozeUntil.toString());
}

async function isSnoozeActive(): Promise<boolean> {
  try {
    const snoozeUntil = parseInt(await Deno.readTextFile(SNOOZE_FILE));
    return Date.now() < snoozeUntil;
  } catch {
    return false;
  }
}

async function main() {
  if (await isSnoozeActive()) {
    console.log("Notification snoozed");
    return;
  }

  const audioPlaying = await isAudioPlaying();

  console.log({ audioPlaying });

  if (!audioPlaying) {
    const chosenOption = await showNotification("No Audio Playing", "Choose a lofi video to play or snooze:");
    if (chosenOption === "Snooze for 1 hour") {
      await setSnooze();
      console.log("Notification snoozed for 1 hour");
    } else if (chosenOption) {
      await openYouTube(chosenOption);
    }
  } else {
    console.log("Audio is already playing, skipping");
  }
}

if (import.meta.main) {
  main();
}
