import React from 'react';
import { GeminiLightingAnalysis } from '../types';
import { Sparkles, Sun, Moon, Palette, ChevronDown } from 'lucide-react';

interface GeminiLightGuideProps {
  analysis: GeminiLightingAnalysis | null;
  isAnalyzing: boolean;
  onAskGeminiAI: () => void;
}

export const GeminiLightGuide: React.FC<GeminiLightGuideProps> = ({
  analysis,
  isAnalyzing,
  onAskGeminiAI,
}) => {
  if (isAnalyzing) {
    return (
      <section className="studio-card result-card">
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <Sparkles size={22} color="var(--brass)" className="spin" />
          <h3 className="result-title" style={{ marginTop: 10 }}>Creating your lighting guide…</h3>
          <p className="result-summary">Finding the surfaces that face toward and away from your chosen light.</p>
        </div>
      </section>
    );
  }

  if (!analysis) return null;

  return (
    <section className="studio-card result-card">
      <span className="step-kicker">Your guide</span>
      <h3 className="result-title">{analysis.title}</h3>
      <p className="result-summary">{analysis.summary}</p>

      <div className="result-grid">
        <article className="result-tip">
          <h4><Sun size={15} color="var(--brass)" /> Add light here</h4>
          <p>{analysis.highlightsGuide}</p>
        </article>
        <article className="result-tip">
          <h4><Moon size={15} color="var(--plum)" /> Add shadow here</h4>
          <p>{analysis.shadowsGuide}</p>
        </article>
        <article className="result-tip">
          <h4><Palette size={15} color="var(--blue)" /> For your medium</h4>
          <p>{analysis.colorTheoryTip}</p>
        </article>
      </div>

      <div className="steps-card">
        <h4>A simple order to follow</h4>
        <ol className="steps-list">
          {analysis.stepByStepGuide.map((step, idx) => (
            <li key={idx}>
              <span className="step-number">{idx + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {analysis.regions?.length > 0 && (
        <details className="result-details">
          <summary>
            <span>Why are those areas marked?</span>
            <ChevronDown size={15} className="summary-chevron" />
          </summary>
          <div className="region-explanations">
            {analysis.regions.slice(0, 12).map((region, idx) => (
              <div key={`${region.kind}-${idx}`} className="region-explanation">
                <strong>{region.label}</strong>
                <p>{region.explanation}</p>
              </div>
            ))}
          </div>
        </details>
      )}

      <button onClick={onAskGeminiAI} className="text-link">Re-create guide</button>
    </section>
  );
};
