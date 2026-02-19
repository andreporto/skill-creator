export interface SkillOutput {
  name: string;
  description: string;
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
  instructions: { file: string; content: string }[];
}
