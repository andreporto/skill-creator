export type AIProvider = 'gemini' | 'copilot' | 'lm-studio';

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model: string;
}

export interface SkillArtifact {
  path: string;    // Relative path within the skill directory
  content: string; // Markdown or JSON content
}

export interface SkillOutput {
  id: string;      // Unique identifier for the skill (slugified name)
  name: string;
  description: string;
  version: string; // e.g., "1.0.0"
  expert_persona: {
    role: string;
    mandates: string[];
    constraints: string[];
  };
  workflow: {
    research: string[];
    strategy: string[];
    execution: string[];
  };
  required_tools: string[];
  artifacts: SkillArtifact[];
}
