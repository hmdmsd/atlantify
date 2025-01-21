import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SongsProvider } from "./contexts/SongsContext";

import App from "./App";
import "./styles/index.css";
import { PlayerProvider } from "./contexts/PlayerContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <PlayerProvider>
        <SongsProvider>
          <App />
        </SongsProvider>
      </PlayerProvider>
    </BrowserRouter>
  </React.StrictMode>
);
