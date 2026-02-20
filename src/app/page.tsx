'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { SkillOutput, SkillArtifact } from '@/lib/types';
import { generateSkill } from '@/services/ai';
import JSZip from 'jszip';

export default function Home() {
  const [demand, setDemand] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [skill, setSkill] = useState<SkillOutput | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<SkillArtifact | null>(null);

  const handleGenerate = async () => {
    if (!demand.trim()) return;

    setIsGenerating(true);
    setSkill(null);
    setSelectedArtifact(null);

    try {
      const result = await generateSkill(demand, { provider: 'gemini', model: 'gemini-1.5-pro' });
      setSkill(result);
      if (result.artifacts.length > 0) {
        setSelectedArtifact(result.artifacts[0]);
      }
    } catch (error) {
      console.error('Failed to generate skill:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadZip = async () => {
    if (!skill) return;

    const zip = new JSZip();
    const folder = zip.folder(skill.id);

    skill.artifacts.forEach((artifact) => {
      folder?.file(artifact.path, artifact.content);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${skill.id}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyInstallCommand = () => {
    if (!skill) return;
    const cmd = `mkdir -p ~/.agents/skills/${skill.id} && # (Manually extract artifacts into this directory)`;
    // In a real scenario, we might provide a more complex script or a download link for a script.
    // For now, let's provide a descriptive command.
    navigator.clipboard.writeText(cmd);
    alert('Install command template copied to clipboard!');
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
            <div className={styles.artifactBrowser}>
              <div className={styles.sidebar}>
                <div className={styles.label}>File Tree</div>
                <div className={styles.fileList}>
                  {skill.artifacts.map((artifact, i) => (
                    <div
                      key={i}
                      className={`${styles.fileItem} ${selectedArtifact?.path === artifact.path ? styles.activeFile : ''}`}
                      onClick={() => setSelectedArtifact(artifact)}
                    >
                      {artifact.path}
                    </div>
                  ))}
                </div>
                <div className={styles.actionButtons}>
                  <button className={styles.secondaryButton} onClick={downloadZip}>
                    Download ZIP
                  </button>
                  <button className={styles.secondaryButton} onClick={copyInstallCommand}>
                    CLI Install
                  </button>
                </div>
              </div>

              <div className={styles.contentViewer}>
                {selectedArtifact ? (
                  <>
                    <div className={styles.label}>{selectedArtifact.path}</div>
                    <pre className={styles.codeBlock}>
                      {selectedArtifact.content}
                    </pre>
                  </>
                ) : (
                  <div className={styles.emptyState}>Select a file to preview</div>
                )}
              </div>
            </div>
            
            <div className={styles.metaPanel}>
              <div className={styles.label}>Expert Persona</div>
              <div className={styles.metaBox}>
                <strong>{skill.expert_persona.role}</strong>
                <ul>
                  {skill.expert_persona.mandates.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
              <div className={styles.label}>Workflow</div>
              <div className={styles.metaBox}>
                {skill.workflow.research.map((r, i) => <div key={i} className={styles.workflowStep}>• {r}</div>)}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
