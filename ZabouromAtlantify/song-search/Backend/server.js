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
    const jsonData = JSON.parse(data);
    
    // Initialize with correct structure if file is empty
    if (filePath === QUEUE_FILE && !jsonData.queue) {
      jsonData.queue = [];
    }
    if (filePath === SUGGESTIONS_FILE && !jsonData.suggestions) {
      jsonData.suggestions = [];
    }
    if (filePath === DATABASE_FILE && !jsonData.songs) {
      jsonData.songs = [];
    }
    
    return jsonData;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If file doesn't exist, return appropriate empty structure
      if (filePath === QUEUE_FILE) {
        return { queue: [] };
      }
      if (filePath === SUGGESTIONS_FILE) {
        return { suggestions: [] };
      }
      if (filePath === DATABASE_FILE) {
        return { songs: [] };
      }
    }
    console.error(`Error reading ${filePath}:`, error);
    throw error;
  }
}

async function writeJsonFile(filePath, data) {
  try {
    // Ensure data has the correct structure before writing
    let formattedData = {};
    if (filePath === QUEUE_FILE) {
      formattedData.queue = data.queue || [];
    } else if (filePath === SUGGESTIONS_FILE) {
      formattedData.suggestions = data.suggestions || [];
    } else if (filePath === DATABASE_FILE) {
      formattedData.songs = data.songs || [];
    } else {
      formattedData = data;
    }
    
    await fs.writeFile(filePath, JSON.stringify(formattedData, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
}

// Check if song exists in database
async function songExistsInDatabase(songTitle) {
  const data = await readJsonFile(DATABASE_FILE);
  return data.songs.some(song => 
    song.title.toLowerCase() === songTitle.toLowerCase()
  );
}

// Get full song details from database
async function getSongDetails(songTitle) {
  const data = await readJsonFile(DATABASE_FILE);
  return data.songs.find(song => 
    song.title.toLowerCase() === songTitle.toLowerCase()
  );
}

// Initialize data files
async function initializeDataFiles() {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize files with correct structure
    const files = [
      {
        path: DATABASE_FILE,
        content: JSON.parse(await fs.readFile('popular_songs.json', 'utf8'))
      },
      {
        path: QUEUE_FILE,
        content: { queue: [] }
      },
      {
        path: SUGGESTIONS_FILE,
        content: { suggestions: [] }
      }
    ];

    for (const file of files) {
      try {
        await fs.access(file.path);
        console.log(`File exists: ${file.path}`);
      } catch {
        await writeJsonFile(file.path, file.content);
        console.log(`Initialized ${file.path}`);
      }
    }
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}

// API Endpoints
// Search songs in database
app.get('/api/songs/search', async (req, res) => {
  try {
    const { query } = req.query;
    const data = await readJsonFile(DATABASE_FILE);
    const filtered = data.songs.filter(song => 
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())
    );
    // Return only the titles for backwards compatibility with frontend
    res.json(filtered.map(song => song.title));
  } catch (error) {
    console.error('Error searching songs:', error);
    res.status(500).json({ error: 'Error searching songs' });
  }
});

// Add song to queue
app.post('/api/queue', async (req, res) => {
  try {
    const { song: songTitle } = req.body;
    
    // Check if song exists in database
    const exists = await songExistsInDatabase(songTitle);
    if (!exists) {
      return res.status(400).json({ error: 'Song not in database' });
    }

    // Get full song details from database
    const songDetails = await getSongDetails(songTitle);

    // Add to queue with timestamp
    const queueData = await readJsonFile(QUEUE_FILE);
    queueData.queue.unshift({
      ...songDetails,
      queuedAt: new Date().toISOString()
    });
    
    await writeJsonFile(QUEUE_FILE, queueData);
    
    res.json({ message: 'Song added to queue' });
  } catch (error) {
    console.error('Error adding song to queue:', error);
    res.status(500).json({ error: 'Error adding song to queue' });
  }
});

// Add song suggestion
app.post('/api/suggestions', async (req, res) => {
  try {
    const { song: songTitle } = req.body;
    
    // Check if song already exists in database
    const existsInDb = await songExistsInDatabase(songTitle);
    if (existsInDb) {
      return res.status(400).json({ error: 'Song already exists in database' });
    }

    // Check if song already exists in suggestions
    const suggestionsData = await readJsonFile(SUGGESTIONS_FILE);
    const existsInSuggestions = suggestionsData.suggestions.some(
      suggestion => suggestion.title.toLowerCase() === songTitle.toLowerCase()
    );
    
    if (existsInSuggestions) {
      return res.status(400).json({ error: 'Song already suggested' });
    }

    // Add to suggestions with timestamp
    const newSuggestion = {
      id: `suggestion_${Date.now()}`,
      title: songTitle,
      suggestedAt: new Date().toISOString()
    };
    
    suggestionsData.suggestions.push(newSuggestion);
    await writeJsonFile(SUGGESTIONS_FILE, suggestionsData);
    
    res.json({ message: 'Song suggestion added' });
  } catch (error) {
    console.error('Error adding song suggestion:', error);
    res.status(500).json({ error: 'Error adding song suggestion' });
  }
});

// Initialize data files when server starts
initializeDataFiles().then(() => {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});