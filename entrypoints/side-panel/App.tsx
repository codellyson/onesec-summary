import { useState } from "react";
import "./App.css";
import { AI } from "../lib/ai-service";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryType, setSummaryType] = useState<
    "1 sentence" | "3 bullet points" | "ai decision"
  >("1 sentence");
  const [stream, setStream] = useState(false);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

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

      // Set streaming mode in AI service
      AI.getInstance().setStream(stream);

      // Use the AI service to generate summary with streaming support
      const result = await summarize(pageText, summaryType, (chunk) => {
        // Update summary in real-time during streaming
        setSummary(chunk);
      });
      console.log("result", result, stream);

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

  return (
    <div className="side-panel-container">
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

        {isLoading && !summary && (
          <div className="loading-section">
            <div className="spinner"></div>
            <p className="loading-text">
              {stream ? "Streaming summary..." : "Analyzing page content..."}
            </p>
          </div>
        )}

        {error && (
          <div className="error-section">
            <p className="error-text">❌ {error}</p>
          </div>
        )}

        {summary && (
          <div className="summary-section">
            <h3 className="summary-title">
              📝 Summary {isLoading && stream && "⏳"}
            </h3>
            <div
              className="summary-text"
              dangerouslySetInnerHTML={{ __html: summary }}
            />
            <div className="button-section">
              <button
                className="secondary-button"
                onClick={handleCopyToClipboard}
              >
                {isCopied ? "Copied!" : "Copy to clipboard"}
              </button>
            </div>
          </div>
        )}

        <div className="button-section">
          {/* Provide options: “1 sentence” or “3 bullet points” */}
          {!summary && (
            <>
              <div className="summary-type-section">
                <h4 className="summary-type-title">Summary Type:</h4>
                <div className="summary-type-buttons">
                  <button
                    className={`summary-type-button ${
                      summaryType === "1 sentence" ? "active" : ""
                    }`}
                    onClick={() => setSummaryType("1 sentence")}
                  >
                    1 Sentence
                  </button>
                  <button
                    className={`summary-type-button ${
                      summaryType === "3 bullet points" ? "active" : ""
                    }`}
                    onClick={() => setSummaryType("3 bullet points")}
                  >
                    3 Bullet Points
                  </button>
                  <button
                    className={`summary-type-button ${
                      summaryType === "ai decision" ? "active" : ""
                    }`}
                    onClick={() => setSummaryType("ai decision")}
                  >
                    AI Decide
                  </button>
                </div>
              </div>

              <div className="streaming-section">
                <label className="streaming-toggle">
                  <input
                    type="checkbox"
                    checked={stream}
                    onChange={(e) => setStream(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">Enable Streaming</span>
                </label>
              </div>

              <button
                className={`summarize-button ${isLoading ? "loading" : ""}`}
                onClick={handleSummarize}
                disabled={isLoading}
              >
                {isLoading ? "Summarizing..." : "📄 Summarize This Page"}
              </button>
            </>
          )}
        </div>

        {summary && (
          <div className="action-section">
            <button
              className="summarize-button "
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
