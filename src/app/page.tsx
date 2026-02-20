'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { SkillOutput, AIProvider } from '@/lib/types';
import { generateSkill } from '@/services/ai';

export default function Home() {
  const [demand, setDemand] = useState('');
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [isGenerating, setIsGenerating] = useState(false);
  const [skill, setSkill] = useState<SkillOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!demand.trim()) return;

    setIsGenerating(true);
    setSkill(null);
    setError(null);

    try {
      // For now we use the default config for each provider
      const result = await generateSkill(demand, { 
        provider, 
        model: provider === 'gemini' ? 'gemini-1.5-pro' : 'model-identifier'
      });
      setSkill(result);
    } catch (err) {
      console.error('Failed to generate skill:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please check your provider configuration and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.title}>AI Skill Creator</div>
        <div className={styles.label}>v1.0.0 (BETA)</div>
      </header>

      <main className={styles.main}>
        <section className={styles.inputSection}>
          <div className={styles.label}>Provider</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {(['gemini', 'lm-studio', 'copilot'] as const).map((p) => (
              <button
                key={p}
                className={`${styles.button} ${provider === p ? styles.active : ''}`}
                style={{ 
                  flex: 1, 
                  backgroundColor: provider === p ? '#333' : '#111',
                  border: '1px solid #333',
                  padding: '0.5rem',
                  fontSize: '0.75rem'
                }}
                onClick={() => setProvider(p)}
                disabled={isGenerating}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
          <div className={styles.label}>Describe your Skill Demand</div>
          <textarea
            className={styles.textarea}
            placeholder="e.g., I need a skill that can audit my Dockerfiles for security best practices..."
            value={demand}
            onChange={(e) => setDemand(e.target.value)}
            disabled={isGenerating}
          />
          <button
            className={styles.button}
            onClick={handleGenerate}
            disabled={isGenerating || !demand.trim()}
          >
            {isGenerating ? 'Synthesizing...' : 'Generate Skill Artifacts'}
          </button>
          {isGenerating && <div className={styles.thinking}>Decomposing intent into architectural components...</div>}
          {error && <div className={styles.error} style={{ color: '#ff4444', marginTop: '1rem', fontSize: '0.85rem' }}>{error}</div>}
        </section>

        {skill && (
          <section className={styles.resultsSection}>
            <div className={styles.previewPanel}>
              <div className={styles.label}>Persona & Workflow</div>
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
              {skill.artifacts.map((artifact, i) => (
                <div key={i} style={{ marginBottom: '1rem' }}>
                  <div className={styles.label} style={{ fontSize: '0.65rem' }}>{artifact.path}</div>
                  <pre className={styles.codeBlock}>
                    {artifact.content}
                  </pre>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
