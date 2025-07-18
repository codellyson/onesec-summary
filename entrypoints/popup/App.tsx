import { useState } from "react";
import "./App.css";

function App() {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenSidePanel = async () => {
    setIsOpening(true);
    try {
      if (chrome && chrome.sidePanel) {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        console.log("tab", tab);
        if (tab && tab.windowId) {
          await chrome.sidePanel.open({ windowId: tab.windowId });
          window.close();
        }
      }
    } catch (error) {
      console.error("Error opening side panel:", error);
      setIsOpening(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1 className="app-title">🧠 OneSec Summary</h1>
        <p className="app-subtitle">
          Get instant one-sentence summaries of any webpage using AI
        </p>
      </div>

      <div className="content">
        <div className="welcome-section">
          <div className="icon-container">
            <span className="icon">🧠</span>
          </div>
          <p className="welcome-text">
            Click the button below to open OneSec Summary to get instant
            summaries of any webpage using AI
          </p>
        </div>

        <div className="button-section">
          <button
            className={`summarize-button ${isOpening ? "loading" : ""}`}
            onClick={handleOpenSidePanel}
            disabled={isOpening}
          >
            {isOpening ? "Opening..." : "Launch OneSec Summary"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
