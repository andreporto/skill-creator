'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { SkillOutput } from '@/lib/types';
import { generateSkill } from '@/services/ai';

export default function Home() {
  const [demand, setDemand] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [skill, setSkill] = useState<SkillOutput | null>(null);

  const handleGenerate = async () => {
    if (!demand.trim()) return;

    setIsGenerating(true);
    setSkill(null);

    try {
      const result = await generateSkill(demand);
      setSkill(result);
    } catch (error) {
      console.error('Failed to generate skill:', error);
      // Handle error in UI
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
              {skill.instructions.map((inst, i) => (
                <div key={i} style={{ marginBottom: '1rem' }}>
                  <div className={styles.label} style={{ fontSize: '0.65rem' }}>{inst.file}</div>
                  <pre className={styles.codeBlock}>
                    {inst.content}
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
