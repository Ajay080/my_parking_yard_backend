let restartTimeout = null;
import { Device } from '../models/Device.js';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let ffmpegProcess = null;

export const startStream = async (req, res) => {
  const device = await Device.findById(req.params.deviceId);
  if (!device) return res.status(404).json({ error: "Device not found" });

  const streamUrl = device.streamUrl || "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov";
  const streamDir = path.join(__dirname, "../public/stream");
  const streamFile = `${device._id}.m3u8`;
  const streamPath = path.join(streamDir, streamFile);

  if (!fs.existsSync(streamDir)) {
    fs.mkdirSync(streamDir, { recursive: true });
  }

  // Kill old process
  if (ffmpegProcess) ffmpegProcess.kill("SIGKILL");

  // Define restart function
  const restartStream = () => {
    console.log(`⏳ Restarting stream for device ${device._id}...`);

    ffmpegProcess = spawn("ffmpeg", [
      "-i", streamUrl,
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-tune", "zerolatency",
      "-f", "hls",
      "-hls_time", "2",
      "-hls_list_size", "3",
      "-hls_flags", "delete_segments",
      streamPath
    ]);

    ffmpegProcess.stderr.on("data", (data) => console.log(data.toString()));

    ffmpegProcess.on("close", (code) => {
      console.log(`⚠ FFmpeg exited with code ${code}`);
      if (!restartTimeout) {
        restartTimeout = setTimeout(() => {
          restartTimeout = null;
          restartStream(); // auto-restart
        }, 3000); // restart after 3 seconds
      }
    });
  };

  restartStream(); // Start stream

  res.json({ hlsUrl: `/stream/${streamFile}` });
};
