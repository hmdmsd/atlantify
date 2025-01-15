const express = require('express');
const fs = require('fs').promises;
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000' // explicitly allow your frontend origin
  }));
app.use(express.json());

// File paths
const DATA_DIR = path.join(__dirname, 'data');
const QUEUE_FILE = path.join(DATA_DIR, 'queue.json');
const SUGGESTIONS_FILE = path.join(DATA_DIR, 'suggestions.json');
const DATABASE_FILE = path.join(DATA_DIR, 'songs.json');

// Ensure data directory exists
async function initializeDataDirectory() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize files if they don't exist
    const files = [
      { path: DATABASE_FILE, defaultContent: ['Bohemian Rhapsody', 'Stairway to Heaven', 'Hotel California'] },
      { path: QUEUE_FILE, defaultContent: [] },
      { path: SUGGESTIONS_FILE, defaultContent: [] }
    ];

    for (const file of files) {
      try {
        await fs.access(file.path);
      } catch {
        await fs.writeFile(file.path, JSON.stringify(file.defaultContent, null, 2));
      }
    }
  } catch (error) {
    console.error('Error initializing data directory:', error);
  }
}

// Helper function to read JSON file
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If file doesn't exist, create it with empty array
      await fs.writeFile(filePath, '[]');
      return [];
    }
    throw error;
  }
}

// Helper function to write JSON file
async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Search songs in database
app.get('/api/songs/search', async (req, res) => {
  try {
    const { query } = req.query;
    const songs = await readJsonFile(DATABASE_FILE);
    const filtered = songs.filter(song => 
      song.toLowerCase().includes(query.toLowerCase())
    );
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Error searching songs' });
  }
});

// Add song to queue
app.post('/api/queue', async (req, res) => {
  try {
    const { song } = req.body;
    const queue = await readJsonFile(QUEUE_FILE);
    queue.unshift(song); // Add to the beginning of the queue
    await writeJsonFile(QUEUE_FILE, queue);
    res.json({ message: 'Song added to queue' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding song to queue' });
  }
});

// Add song suggestion
app.post('/api/suggestions', async (req, res) => {
  try {
    const { song } = req.body;
    const suggestions = await readJsonFile(SUGGESTIONS_FILE);
    suggestions.push(song);
    await writeJsonFile(SUGGESTIONS_FILE, suggestions);
    res.json({ message: 'Song suggestion added' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding song suggestion' });
  }
});

// Initialize data directory when server starts
initializeDataDirectory();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});