import { SkillOutput, AIConfig } from '@/lib/types';
import { scrubSecrets } from '@/lib/utils';

export const generateSkill = async (demand: string, config: AIConfig): Promise<SkillOutput> => {
  // In a real implementation, this would call an API route that interacts with the selected LLM provider.
  // We'll simulate the delay here.
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log(`Generating skill with provider: ${config.provider}, model: ${config.model}`);

  const skill: SkillOutput = {
    id: "docker-security-audit",
    name: "Docker Security Auditor",
    version: "1.0.0",
    description: `A specialized skill for auditing Dockerfiles against security best practices: ${demand}`,
    expert_persona: {
      role: "DevSecOps Engineer",
      mandates: [
        "Prioritize Alpine-based images",
        "Enforce non-root user execution",
        "Audit multi-stage builds"
      ],
      constraints: [
        "Do not suggest deprecated instructions",
        "Maintain compatibility with BuildKit"
      ]
    },
    workflow: {
      research: ["Locate all Dockerfiles", "Identify base images"],
      strategy: ["Scan for CVEs", "Map permission levels"],
      execution: ["Refactor Dockerfiles", "Add security labels"]
    },
    required_tools: ["grep_search", "read_file", "run_shell_command"],
    artifacts: [
      {
        path: "SKILL.md",
        content: `# Docker Security Auditor\n\nExpert skill for ensuring Dockerfiles follow security best practices.\n\n## Expert Persona\n- **Role**: DevSecOps Engineer\n- **Mandates**: Prioritize Alpine, Enforce non-root.\n\n## Capabilities\n- Scanning Dockerfiles\n- Identifying insecure patterns\n- Automated refactoring`
      },
      {
        path: "instructions/phase-1.md",
        content: `## Phase 1: Research & Discovery\n\n1. Use \`grep_search\` to find all files named \`Dockerfile\`.\n2. Read each file to identify the \`FROM\` instruction and base image versions.`
      },
      {
        path: "instructions/phase-2.md",
        content: `## Phase 2: Strategy & Execution\n\n1. Evaluate the use of \`USER\` instructions.\n2. Recommend adding \`USER node\` or equivalent if missing.\n3. Optimize multi-stage builds to reduce attack surface.`
      },
      {
        path: "instructions/phase-3.md",
        content: `## Phase 3: Validation\n\n1. Run \`docker build --dry-run\` to verify syntax.\n2. Use a linter like \`hadolint\` if available to confirm security compliance.`
      },
      {
        path: "tools/linter-helper.json",
        content: JSON.stringify({
          name: "linter_helper",
          description: "Assists in running hadolint on Dockerfiles",
          parameters: {
            type: "object",
            properties: {
              filePath: { type: "string" }
            }
          }
        }, null, 2)
      },
      {
        path: "examples/sample-usage.md",
        content: `### Before\n\`\`\`dockerfile\nFROM node:latest\nCOPY . .\nCMD ["npm", "start"]\n\`\`\`\n\n### After\n\`\`\`dockerfile\nFROM node:20-alpine\nUSER node\nCOPY --chown=node:node . .\nCMD ["npm", "start"]\n\`\`\``
      }
    ]
  };

  // Apply secret scrubbing to all artifacts
  skill.artifacts = skill.artifacts.map(a => ({
    ...a,
    content: scrubSecrets(a.content)
  }));

  return skill;
};
