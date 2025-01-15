import React, { useState, useEffect } from 'react';

const SongSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchTerm.length > 0) {
      // Only search when there's text input
      fetch(`http://localhost:3001/api/songs/search?query=${searchTerm}`)
        .then(res => res.json())
        .then(data => {
          // Filter songs that start with the search term
          const filteredSongs = data.filter(song => 
            song.toLowerCase().startsWith(searchTerm.toLowerCase())
          );
          setSuggestions(filteredSongs);
          setError('');
        })
        .catch(err => {
          console.error('Error fetching suggestions:', err);
          setError('Failed to fetch suggestions');
          setSuggestions([]);
        });
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleSelect = (song) => {
    setSearchTerm(song);
    setSuggestions([]);
  };

  const handleAction = async () => {
    try {
      // Try to add to queue first (if song exists in database)
      const queueResponse = await fetch('http://localhost:3001/api/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ song: searchTerm }),
      });

      const queueData = await queueResponse.json();
      
      if (queueResponse.ok) {
        // Song was in database and added to queue
        setMessage('Song added to queue');
      } else if (queueData.error === 'Song not in database') {
        // Song wasn't in database, add to suggestions
        const suggestResponse = await fetch('http://localhost:3001/api/suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ song: searchTerm }),
        });
        
        const suggestData = await suggestResponse.json();
        if (suggestResponse.ok) {
          setMessage(suggestData.message);
        } else {
          setError(suggestData.error);
        }
      } else {
        setError(queueData.error);
      }
      
      setSearchTerm('');
      setSuggestions([]);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to process request');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a song..."
          className="w-full p-2 border rounded"
        />
        
        {suggestions.length > 0 && (
          <div className="absolute w-full mt-1 bg-white border rounded shadow-lg z-10">
            {suggestions.map((song, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(song)}
              >
                {song}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2 justify-end">
        {searchTerm && (
          <button
            onClick={handleAction}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {suggestions.includes(searchTerm) ? 'Add to Queue' : 'Suggest Song'}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 text-center text-red-600">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-4 text-center text-green-600">
          {message}
        </div>
      )}
    </div>
  );
};

export default SongSearch;