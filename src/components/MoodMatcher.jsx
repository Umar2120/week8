import { useState } from "react";
import { matchMoodToGenresAI, moodSuggestions } from "../utils/moodMatcher";

export default function MoodMatcher({ onMoodMatch }) {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const runMatch = async (text) => {
    setLoading(true);
    const result = await matchMoodToGenresAI(text);
    setLoading(false);

    if (!result.success) {
      setFeedback(result.message);
      return;
    }

    const engineLabel = result.engine === "local" ? "Local AI" : result.engine.toUpperCase();
    setFeedback(`Matched: ${result.profileLabel} (${result.confidence}% confidence) · ${engineLabel}`);
    onMoodMatch(result);
  };

  return (
    <section className={`mood-box${open ? "" : " collapsed"}`}>
      <div className="mood-head">
        <div className="mood-head-left">
          <h3>AI Mood Matcher</h3>
          <span className="tap">{open ? "Tap switch to hide" : "Tap switch to open"}</span>
        </div>

        <label className="mood-switch" aria-label="Toggle mood matcher">
          <input type="checkbox" checked={open} onChange={(event) => setOpen(event.target.checked)} />
          <span className="mood-slider" />
        </label>
      </div>

      {open && (
        <>
          <div className="mood-input-row">
            <input
              className="mood-input"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Examples: I want something fun and light, dark thriller, or emotional drama..."
              onKeyDown={(event) => {
                if (event.key === "Enter" && !loading) runMatch(input);
              }}
            />
            <button className="mood-btn" onClick={() => runMatch(input)} disabled={loading}>
              {loading ? "Matching..." : "Match Mood"}
            </button>
          </div>

          <div className="mood-suggestions">
            {moodSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                className="mood-pill"
                onClick={() => {
                  setInput(suggestion);
                  runMatch(suggestion);
                }}
                disabled={loading}
              >
                {suggestion}
              </button>
            ))}
          </div>

          {feedback && <p className="mood-feedback">{feedback}</p>}
        </>
      )}
    </section>
  );
}
