import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MusicIcon, PlusCircleIcon, ListMusicIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SongSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timeoutId;
    
    if (searchTerm.length > 0) {
      setIsLoading(true);
      // Debounce the search to avoid too many requests
      timeoutId = setTimeout(() => {
        fetch(`http://localhost:3001/api/songs/search?query=${searchTerm}`)
          .then(res => res.json())
          .then(data => {
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
          })
          .finally(() => {
            setIsLoading(false);
          });
      }, 300);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelect = (song) => {
    setSearchTerm(song);
    setSuggestions([]);
  };

  const handleAction = async () => {
    setIsLoading(true);
    try {
      const queueResponse = await fetch('http://localhost:3001/api/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ song: searchTerm }),
      });

      const queueData = await queueResponse.json();
      
      if (queueResponse.ok) {
        setMessage('Song added to queue successfully!');
      } else if (queueData.error === 'Song not in database') {
        const suggestResponse = await fetch('http://localhost:3001/api/suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ song: searchTerm }),
        });
        
        const suggestData = await suggestResponse.json();
        if (suggestResponse.ok) {
          setMessage('Thanks for your suggestion! We\'ll add this song soon.');
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MusicIcon className="w-5 h-5" />
          Song Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <div className="flex gap-2">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a song..."
                className="w-full"
                disabled={isLoading}
              />
              {searchTerm && (
                <Button
                  onClick={handleAction}
                  disabled={isLoading}
                  className="whitespace-nowrap"
                >
                  {isLoading ? (
                    <div className="animate-spin">⭕</div>
                  ) : suggestions.includes(searchTerm) ? (
                    <>
                      <ListMusicIcon className="w-4 h-4 mr-2" />
                      Add to Queue
                    </>
                  ) : (
                    <>
                      <PlusCircleIcon className="w-4 h-4 mr-2" />
                      Suggest Song
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {suggestions.length > 0 && (
              <Card className="absolute w-full mt-1 z-10">
                <CardContent className="p-0">
                  {suggestions.map((song, index) => (
                    <button
                      key={index}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors border-b last:border-b-0"
                      onClick={() => handleSelect(song)}
                    >
                      {song}
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert variant="success" className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{message}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SongSearch;