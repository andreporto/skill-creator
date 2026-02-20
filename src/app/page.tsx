'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { AIConfig, RefinementHistory, Iteration } from '@/lib/types';
import { generateSkill, refineSkill } from '@/services/ai';
import { diffLines } from 'diff';

const DEFAULT_CONFIG: AIConfig = {
  provider: 'gemini',
  model: 'gemini-1.5-pro'
};

export default function Home() {
  const [demand, setDemand] = useState('');
  const [directive, setDirective] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [history, setHistory] = useState<RefinementHistory | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const skill = history ? history.iterations[history.currentIndex].output : null;

  const handleGenerate = async () => {
    if (!demand.trim()) return;

    setIsGenerating(true);
    setHistory(null);

    try {
      const result = await generateSkill(demand, DEFAULT_CONFIG);
      const initialIteration: Iteration = {
        directive: '',
        output: result,
        timestamp: Date.now()
      };
      setHistory({
        iterations: [initialIteration],
        currentIndex: 0
      });
    } catch (error) {
      console.error('Failed to generate skill:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!directive.trim() || !skill || !history) return;

    setIsRefining(true);
    try {
      const result = await refineSkill(skill, directive, DEFAULT_CONFIG);
      const newIteration: Iteration = {
        directive,
        output: result,
        timestamp: Date.now()
      };
      const newHistory = {
        iterations: [...history.iterations, newIteration],
        currentIndex: history.iterations.length
      };
      setHistory(newHistory);
      setDirective('');
      setShowDiff(true);
    } catch (error) {
      console.error('Failed to refine skill:', error);
    } finally {
      setIsRefining(false);
    }
  };

  const navigateToIteration = (index: number) => {
    if (!history) return;
    setHistory({
      ...history,
      currentIndex: index
    });
    setShowDiff(index > 0);
  };

  const renderContent = (currentContent: string, previousContent?: string) => {
    if (showDiff && previousContent !== undefined) {
      const diff = diffLines(previousContent, currentContent);
      return (
        <pre className={styles.codeBlock}>
          {diff.map((part, index) => {
            const className = part.added
              ? styles.diffAdded
              : part.removed
              ? styles.diffRemoved
              : '';
            return (
              <span key={index} className={className}>
                {part.value}
              </span>
            );
          })}
        </pre>
      );
    }
    return <pre className={styles.codeBlock}>{currentContent}</pre>;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.title}>AI Skill Creator</div>
        <div className={styles.label}>v1.0.0 (BETA)</div>
      </header>

      <main className={styles.main}>
        <section className={styles.inputSection}>
          <div className={styles.label}>Describe your Skill Demand</div>
          <textarea
            className={styles.textarea}
            placeholder="e.g., I need a skill that can audit my Dockerfiles for security best practices..."
            value={demand}
            onChange={(e) => setDemand(e.target.value)}
            disabled={isGenerating || isRefining}
          />
          <button
            className={styles.button}
            onClick={handleGenerate}
            disabled={isGenerating || isRefining || !demand.trim()}
          >
            {isGenerating ? 'Synthesizing...' : 'Generate Skill Artifacts'}
          </button>
          {isGenerating && <div className={styles.thinking}>Decomposing intent into architectural components...</div>}
        </section>

        {history && skill && (
          <>
            <section className={styles.refinementControls}>
              <div className={styles.label}>Iteration History</div>
              <div className={styles.historyNav}>
                {history.iterations.map((iter, i) => (
                  <button
                    key={i}
                    className={`${styles.historyStep} ${history.currentIndex === i ? styles.historyStepActive : ''}`}
                    onClick={() => navigateToIteration(i)}
                  >
                    {i === 0 ? 'Initial' : `v${i} (${iter.directive.slice(0, 15)}...)`}
                  </button>
                ))}
              </div>

              <div className={styles.label}>Refine this Skill</div>
              <div className={styles.directiveInputGroup}>
                <input
                  type="text"
                  className={styles.directiveInput}
                  placeholder="e.g., Add a check for Alpine Linux versions..."
                  value={directive}
                  onChange={(e) => setDirective(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                  disabled={isRefining}
                />
                <button
                  className={styles.button}
                  onClick={handleRefine}
                  disabled={isRefining || !directive.trim()}
                >
                  {isRefining ? 'Refining...' : 'Apply Directive'}
                </button>
              </div>
              {isRefining && <div className={styles.thinking}>Performing surgical updates based on directive...</div>}
            </section>

            <section className={styles.resultsSection}>
              <div className={styles.previewPanel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className={styles.label}>Persona & Workflow</div>
                  {history.currentIndex > 0 && (
                    <label className={styles.diffToggle}>
                      <input
                        type="checkbox"
                        checked={showDiff}
                        onChange={(e) => setShowDiff(e.target.checked)}
                      />
                      Show Diffs
                    </label>
                  )}
                </div>
                
                <div className={styles.codeBlock}>
                  <strong>Role:</strong> {skill.expert_persona.role}<br /><br />
                  <strong>Mandates:</strong><br />
                  {skill.expert_persona.mandates.map((m, i) => (
                    <div key={i}>• {m}</div>
                  ))}
                  <br />
                  <strong>Workflow:</strong><br />
                  {skill.workflow.research.map((r, i) => (
                    <div key={i}>→ {r}</div>
                  ))}
                </div>
                <div className={styles.label}>Required Tools</div>
                <div className={styles.codeBlock} style={{ fontSize: '0.75rem' }}>
                  {skill.required_tools.join(', ')}
                </div>
              </div>

              <div className={styles.previewPanel}>
                <div className={styles.label}>Generated Artifacts</div>
                {skill.artifacts.map((artifact, i) => {
                  const prevIteration = history.currentIndex > 0 ? history.iterations[history.currentIndex - 1] : null;
                  const prevArtifact = prevIteration?.output.artifacts.find(a => a.path === artifact.path);
                  
                  return (
                    <div key={i} style={{ marginBottom: '1rem' }}>
                      <div className={styles.label} style={{ fontSize: '0.65rem' }}>{artifact.path}</div>
                      {renderContent(artifact.content, prevArtifact?.content)}
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
