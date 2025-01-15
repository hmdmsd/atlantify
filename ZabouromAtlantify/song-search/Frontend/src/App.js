import React from 'react';
import SongSearch from './components/SongSearch';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Song Search</h1>
        <SongSearch />
      </div>
    </div>
  );
}

export default App;