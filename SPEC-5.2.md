# Specification: Artifact Generation (Requirement 5.2)

**Version:** 0.1.0  
**Status:** Draft  
**Owner:** Senior Lead Engineer  
**Related PRD:** [PRD.md](./PRD.md)

---

## 1. Overview
This specification details the **Artifact Generation** module (5.2) of the AI Skill Creator. It defines how high-level LLM outputs are transformed into a standardized, modular directory structure compatible with the Gemini CLI `activate_skill` architecture.

## 2. Artifact Schema
The generation engine must produce a structured artifact set. The internal representation will extend the existing `SkillOutput` interface.

```typescript
// Updated src/lib/types.ts
export interface SkillArtifact {
  path: string;    // Relative path within the skill directory
  content: string; // Markdown or JSON content
}

export interface SkillOutput {
  id: string;      // Unique identifier for the skill (slugified name)
  name: string;
  description: string;
  version: string; // e.g., "1.0.0"
  artifacts: SkillArtifact[];
}
```

## 3. Directory Structure
The output must be organized into a standard hierarchy:

```text
skill-name/
├── SKILL.md             # Primary entry point & metadata
├── instructions/        # Modular task-specific instructions
│   ├── phase-1.md       # e.g., Research/Analysis
│   ├── phase-2.md       # e.g., Execution/Implementation
│   └── phase-3.md       # e.g., Validation/Testing
├── tools/               # Custom tool schemas (JSON)
│   └── custom-tool.json
└── examples/            # Few-shot prompting examples
    └── sample-usage.md
```

## 4. File Templates & Content Requirements

### 4.1 SKILL.md (The Manifest)
Must include:
- `Name`: Clear, concise name.
- `Description`: High-level purpose.
- `Expert Persona`: Mandates and Constraints.
- `Capabilities`: List of tools and high-level workflows.
- `Location`: Relative path to instructions.

### 4.2 instructions/*.md (Modular Logic)
- **Phase 1: Research/Discovery**: How the agent should explore the codebase/context.
- **Phase 2: Strategy/Execution**: The core logic and implementation steps.
- **Phase 3: Validation**: Explicit steps to verify success (e.g., running tests, linting).

### 4.3 tools/*.json (Tool Definitions)
- Standardized JSON schema for any custom tools the skill requires.
- Must include `name`, `description`, and `parameters`.

### 4.4 examples/*.md (Few-shot)
- Scenarios showing the "Before" and "After" of a skill's application.
- Helps the LLM understand edge cases and desired tone.

## 5. Synthesis Engine Evolution
The `synthesis-engine.md` prompt must be updated to explicitly generate these modular artifacts instead of a single instruction set.

**Required LLM Output Adjustment:**
The LLM must return an array of files, each with a designated `path` and `content`, following the directory structure defined in Section 3.

## 6. Export & Installation (UX 7.5)
- **Preview:** A file tree view in the UI to inspect generated artifacts.
- **Download:** ZIP archive containing the full directory.
- **CLI Install:** Automated script/command to move the directory to `~/.agents/skills/`.

## 7. Security & Privacy (6.2)
- **Secret Scrubbing:** Before final artifact assembly, a regex-based and LLM-assisted pass will remove potential API keys or sensitive hardcoded paths.
- **Local-First:** All artifact generation logic must be executable within the user's local environment if configured.

---

## 8. Success Criteria
1. Generated `SKILL.md` is valid and can be read by Gemini CLI.
2. `instructions/` are properly modularized into at least 3 distinct phases.
3. The directory structure is preserved when exported as a ZIP.
