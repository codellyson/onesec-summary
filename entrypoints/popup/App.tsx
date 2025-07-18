import { useState } from "react";
import "./App.css";
import { AI } from "../lib/ai-service";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  const {} = AI.getInstance();
  const { summarize } = AI;

  const handleSummarize = async () => {
    setIsLoading(true);
    setError("");
    setSummary("");

    try {
      // Test if chrome APIs are available
      if (!chrome || !chrome.tabs || !chrome.scripting) {
        throw new Error("Chrome extension APIs not available");
      }
      // Get the active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab || !tab.id) {
        throw new Error("No active tab found");
      }

      // Check if we can access the tab
      if (
        !tab.url ||
        tab.url.startsWith("chrome://") ||
        tab.url.startsWith("chrome-extension://")
      ) {
        throw new Error(
          "Cannot summarize this type of page (chrome:// or extension pages)"
        );
      }

      console.log("Processing tab:", tab.url);

      // Execute content script to get page text
      let pageText = "";
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            try {
              // Get all text content from the page
              const bodyText =
                document.body?.innerText || document.body?.textContent || "";
              console.log("Extracted text length:", bodyText.length);

              // Clean up the text - remove extra whitespace and limit length
              const cleanedText = bodyText.replace(/\s+/g, " ").trim();
              return cleanedText.substring(0, 8000); // Limit to 8000 chars to avoid API limits
            } catch (error) {
              console.error("Error extracting text:", error);
              return "";
            }
          },
        });

        if (results && results[0] && results[0].result) {
          pageText = results[0].result;
        }
      } catch (scriptError) {
        console.error("Script execution error:", scriptError);
        throw new Error(
          "Cannot access page content. Try refreshing the page and try again."
        );
      }

      if (!pageText || pageText.trim().length === 0) {
        throw new Error(
          "Could not extract text from this page. The page might be empty or not fully loaded."
        );
      }

      console.log("Extracted text length:", pageText.length);

      // Use the AI service to generate summary
      const result = await summarize(pageText);
      console.log("result", result);

      if (!result) {
        throw new Error("Failed to generate summary");
      }

      setSummary(result);
    } catch (err) {
      console.error("Summarization error:", err);
      setError(err instanceof Error ? err.message : "Failed to summarize page");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSidePanel = async () => {
    try {
      if (chrome && chrome.sidePanel) {
        // Get the current window ID
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (tab && tab.windowId) {
          await chrome.sidePanel.open({ windowId: tab.windowId });
        }
      } else {
        console.log("Side panel API not available");
      }
    } catch (error) {
      console.error("Error opening side panel:", error);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1 className="app-title">🧠 OneSec Summary</h1>
        <p className="app-subtitle">Get instant page summaries with AI</p>
      </div>

      <div className="content">
        {!summary && !isLoading && (
          <div className="welcome-section">
            <div className="icon-container">
              <span className="icon">📄</span>
            </div>
            <p className="welcome-text">
              Click the button below to get a one-sentence summary of the
              current webpage
            </p>
          </div>
        )}

        {isLoading && (
          <div className="loading-section">
            <div className="spinner"></div>
            <p className="loading-text">Analyzing page content...</p>
          </div>
        )}

        {error && (
          <div className="error-section">
            <p className="error-text">❌ {error}</p>
          </div>
        )}

        {summary && (
          <div className="summary-section">
            <h3 className="summary-title">📝 Summary</h3>
            <p className="summary-text">{summary}</p>
          </div>
        )}

        <div className="button-section">
          <button
            className={`summarize-button ${isLoading ? "loading" : ""}`}
            onClick={handleSummarize}
            disabled={isLoading}
          >
            {isLoading ? "Summarizing..." : "📄 Summarize This Page"}
          </button>
        </div>

        <div className="side-panel-section">
          <button className="side-panel-button" onClick={handleOpenSidePanel}>
            📱 Open in Side Panel
          </button>
        </div>

        {summary && (
          <div className="action-section">
            <button
              className="secondary-button"
              onClick={() => {
                setSummary("");
                setError("");
              }}
            >
              🔄 New Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
