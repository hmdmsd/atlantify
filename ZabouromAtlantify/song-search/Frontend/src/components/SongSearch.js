import React, { useState, useEffect } from 'react';

const SongSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (searchTerm.length > 0) {
      // Fetch suggestions from backend
      fetch(`http://localhost:3001/api/songs/search?query=${searchTerm}`)
        .then(res => res.json())
        .then(data => setSuggestions(data))
        .catch(err => console.error('Error fetching suggestions:', err));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleSelect = (song) => {
    setSearchTerm(song);
    setSuggestions([]);
  };

  const handleAddToQueue = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ song: searchTerm }),
      });
      const data = await response.json();
      setMessage(data.message);
      setSearchTerm('');
    } catch (error) {
      console.error('Error adding song to queue:', error);
      setMessage('Error adding song to queue');
    }
  };

  const handleSuggest = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ song: searchTerm }),
      });
      const data = await response.json();
      setMessage(data.message);
      setSearchTerm('');
    } catch (error) {
      console.error('Error suggesting song:', error);
      setMessage('Error suggesting song');
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
          <div className="absolute w-full mt-1 bg-white border rounded shadow-lg">
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
        {suggestions.length > 0 ? (
          <button
            onClick={handleAddToQueue}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add to Queue
          </button>
        ) : (
          searchTerm && (
            <button
              onClick={handleSuggest}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Suggest Song
            </button>
          )
        )}
      </div>

      {message && (
        <div className="mt-4 text-center text-green-600">
          {message}
        </div>
      )}
    </div>
  );
};

export default SongSearch;