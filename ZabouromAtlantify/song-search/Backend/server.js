const express = require('express');
const fs = require('fs').promises;
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// File paths
const DATA_DIR = path.join(__dirname, 'data');
const QUEUE_FILE = path.join(DATA_DIR, 'queue.json');
const SUGGESTIONS_FILE = path.join(DATA_DIR, 'suggestions.json');
const DATABASE_FILE = path.join(DATA_DIR, 'songs.json');

// Helper functions
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    throw error;
  }
}

async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
}

// Check if song exists in database
async function songExistsInDatabase(song) {
  const data = await readJsonFile(DATABASE_FILE);
  return data.songs.some(s => s.toLowerCase() === song.toLowerCase());
}

// Search songs in database
app.get('/api/songs/search', async (req, res) => {
  try {
    const { query } = req.query;
    const data = await readJsonFile(DATABASE_FILE);
    const filtered = data.songs.filter(song => 
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
    
    // Check if song exists in database
    const exists = await songExistsInDatabase(song);
    if (!exists) {
      return res.status(400).json({ error: 'Song not in database' });
    }

    // Add to queue
    const data = await readJsonFile(QUEUE_FILE);
    data.queue.unshift(song);
    await writeJsonFile(QUEUE_FILE, data);
    
    res.json({ message: 'Song added to queue' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding song to queue' });
  }
});

// Add song suggestion
app.post('/api/suggestions', async (req, res) => {
  try {
    const { song } = req.body;
    
    // Check if song already exists in database
    const existsInDb = await songExistsInDatabase(song);
    if (existsInDb) {
      return res.status(400).json({ error: 'Song already exists in database' });
    }

    // Check if song already exists in suggestions
    const suggestionsData = await readJsonFile(SUGGESTIONS_FILE);
    const existsInSuggestions = suggestionsData.suggestions.some(
      s => s.toLowerCase() === song.toLowerCase()
    );
    
    if (existsInSuggestions) {
      return res.status(400).json({ error: 'Song already suggested' });
    }

    // Add to suggestions
    suggestionsData.suggestions.push(song);
    await writeJsonFile(SUGGESTIONS_FILE, suggestionsData);
    
    res.json({ message: 'Song suggestion added' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding song suggestion' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});