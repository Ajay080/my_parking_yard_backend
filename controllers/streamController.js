import { Device } from '../models/Device.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const streamStatusMap = {};

// Check if local video files exist (now looking for only 2 videos)
const checkLocalVideos = () => {
  const videoDir = path.join(__dirname, '../public/videos');
  const localVideos = [];
  
  if (fs.existsSync(videoDir)) {
    const files = ['parking1.mp4', 'parking2.mp4']; // Only 2 videos
    files.forEach(file => {
      if (fs.existsSync(path.join(videoDir, file))) {
        localVideos.push(file);
      }
    });
  }
  
  return localVideos;
};

// Environment-aware video URLs
const getVideoUrls = (req) => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.PRODUCTION_URL || `${req.protocol}://${req.get('host')}`
    : `${req.protocol}://${req.get('host')}`;
  
  const localVideoFiles = checkLocalVideos();
  
  return {
    // Local videos (if they exist)
    localVideos: localVideoFiles.map(file => `${baseUrl}/videos/${file}`),
    // Fallback external videos
    externalVideos: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://www.w3schools.com/html/mov_bbb.mp4'
    ]
  };
};

// Function to validate if URL is browser-compatible
const isBrowserCompatible = (url) => {
  if (!url) return false;
  const incompatibleProtocols = ['rtsp://', 'rtmp://', 'rtmps://', 'mms://'];
  return !incompatibleProtocols.some(protocol => url.toLowerCase().startsWith(protocol));
};

export const startStream = async (req, res) => {
  const deviceId = req.params.deviceId;
  
  if (!streamStatusMap[deviceId]) {
    console.log(`⛔ Stream not enabled for ${deviceId}`);
    return res.status(403).json({ error: "Stream not enabled for this device" });
  }

  try {
    const device = await Device.findById(deviceId);
    if (!device) return res.status(404).json({ error: "Device not found" });

    let streamUrl = device.streamUrl;
    let isFallback = false;
    let isLocal = false;
    
    // Always use local videos for demo (since device URLs are likely not working)
    const { localVideos, externalVideos } = getVideoUrls(req);
    
    // Prefer local videos if available
    if (localVideos.length > 0) {
      // Use modulo to alternate between the 2 videos for different devices
      const videoIndex = parseInt(device._id.toString().slice(-1), 16) % localVideos.length;
      streamUrl = localVideos[videoIndex];
      isLocal = true;
      isFallback = true;
      console.log(`🅿️ Using LOCAL parking video ${videoIndex + 1} for device ${device.name}: ${streamUrl}`);
    } else if (!isBrowserCompatible(streamUrl) || streamUrl.includes('rtsp') || streamUrl.includes('placeholder')) {
      // Fallback to external videos if no local videos
      const videoIndex = parseInt(device._id.toString().slice(-1), 16) % externalVideos.length;
      streamUrl = externalVideos[videoIndex];
      isFallback = true;
      console.log(`⚠️ No local videos found, using external video for device ${device.name}: ${streamUrl}`);
    }
    
    console.log(`✅ Starting parking surveillance stream for device ${device._id}`);
    
    res.json({ 
      videoUrl: streamUrl,
      deviceId: device._id,
      deviceName: device.name,
      isFallback: isFallback,
      isLocal: isLocal,
      originalUrl: device.streamUrl,
      streamType: isFallback ? (isLocal ? 'Local Parking Surveillance' : 'Demo Surveillance Video') : 'Live Parking CCTV',
      cameraType: 'Parking Area Surveillance',
      location: device.zoneId ? `Zone: ${device.zoneId}` : 'Parking Area',
      videoSource: isLocal ? 'Local Server' : 'External',
      videoNumber: isLocal ? (parseInt(device._id.toString().slice(-1), 16) % localVideos.length) + 1 : null
    });
  } catch (error) {
    console.error('Error starting parking stream:', error);
    res.status(500).json({ error: "Failed to start parking surveillance stream" });
  }
};

export const enableStream = (req, res) => {
  const { deviceId } = req.params;
  streamStatusMap[deviceId] = true;
  console.log(`✅ Streaming enabled for device ${deviceId}`);
  res.json({ 
    message: `Stream enabled for device ${deviceId}`,
    deviceId: deviceId,
    status: 'enabled',
    timestamp: new Date().toISOString()
  });
};

export const disableStream = (req, res) => {
  const { deviceId } = req.params;
  streamStatusMap[deviceId] = false;
  console.log(`🛑 Streaming disabled for device ${deviceId}`);
  res.json({ 
    message: `Stream disabled for device ${deviceId}`,
    deviceId: deviceId,
    status: 'disabled',
    timestamp: new Date().toISOString()
  });
};

// New function to get stream status
export const getStreamStatus = (req, res) => {
  const { deviceId } = req.params;
  const isEnabled = streamStatusMap[deviceId] || false;
  
  res.json({
    deviceId: deviceId,
    isEnabled: isEnabled,
    status: isEnabled ? 'enabled' : 'disabled'
  });
};