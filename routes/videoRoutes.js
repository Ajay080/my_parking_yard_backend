import express from 'express';

const router = express.Router();

// Car parking surveillance demo videos
const parkingDemoVideos = [
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', // Parking surveillance
  'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', // General surveillance  
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' // Fallback
];

// Routes for demo videos with CORS headers
router.get('/demo1', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range');
  res.redirect(parkingDemoVideos[0]);
});

router.get('/demo2', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range');
  res.redirect(parkingDemoVideos[1]);
});

router.get('/demo3', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range');
  res.redirect(parkingDemoVideos[2]);
});

// Parking-specific route
router.get('/parking-demo/:cameraId', (req, res) => {
  const { cameraId } = req.params;
  const videoIndex = parseInt(cameraId) % parkingDemoVideos.length;
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range');
  res.setHeader('Content-Type', 'video/mp4');
  
  res.redirect(parkingDemoVideos[videoIndex]);
});

// Placeholder route for testing
router.get('/placeholder', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.redirect('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
});

export default router;
