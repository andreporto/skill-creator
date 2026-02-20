# Product Requirements Document (PRD): AI Skill Creator

**Version:** 1.0.0  
**Status:** Draft  
**Owner:** Senior Lead Engineer  
**Last Updated:** February 19, 2026

---

## 1. Executive Summary
The **AI Skill Creator** is a meta-tool designed to bridge the gap between a developer's intent and a functional AI Agent Skill. By providing a natural language description, the app autonomously generates the structured documentation (`SKILL.md`), procedural instructions, tool definitions, and validation logic required to extend the capabilities of agents like Gemini CLI.

## 2. Problem Statement
Manual skill creation for AI agents is high-friction and error-prone. Developers must:
1.  Define strict personas and boundaries.
2.  Manually draft complex instructions (System Prompts).
3.  Structure tool schemas and resource references.
4.  Test and iterate on prompt efficacy.
This leads to inconsistent skill quality and slows down the adoption of agentic workflows.

## 3. Goals & Objectives
*   **Zero-to-One Velocity:** Reduce the time to create a baseline skill from ~2 hours to < 2 minutes.
*   **Standardization:** Enforce a rigorous, high-signal structure across all generated skills.
*   **Iterative Refinement:** Allow users to "chat" with the skill draft to refine specific behaviors.
*   **Export Ready:** Produce artifacts that are immediately compatible with Gemini CLI's `activate_skill` architecture.

## 4. User Personas
*   **The Power User:** A developer who uses Gemini CLI daily and wants to automate repetitive coding patterns (e.g., "Create a skill for migrating Jest to Vitest").
*   **The Architect:** An engineer designing a library who wants to provide a "Skill" as part of the SDK documentation.

## 5. Functional Requirements

### 5.1 Skill Synthesis Engine (Core)
*   **Multi-Provider Support:** Ability to switch between different AI backends including Gemini, Copilot (GitHub Models), and LM Studio (Local).
*   **Provider Configuration:** User-defined settings for API keys, base URLs (for local instances), and model selection per provider.
*   **Input:** High-level text demand (e.g., "I need a skill that can audit my Dockerfiles for security best practices").
*   **Architecture Mapping:** The AI must identify necessary tools (shell, web search, file read) and resources.
*   **Persona Generation:** Creation of a "Expert Persona" with specific mandates and constraints.

### 5.2 Artifact Generation & Export
The app must generate a directory structure containing:
*   `SKILL.md`: The primary entry point (Description, Location, Capabilities).
*   `instructions/`: Modularized markdown files for specific sub-tasks.
*   `tools/`: JSON/YAML schemas for any required custom tool definitions.
*   `examples/`: Sample input/output pairs for few-shot prompting.
*   **Export Options:** Users must be able to download the result as a single aggregated Markdown file (for quick sharing/reference) or a ZIP archive (for full installation).

### 5.3 Interactive Refinement
*   **The "Diff" View:** Users can see changes between generation iterations.
*   **Directives:** Users can issue follow-up commands (e.g., "Make it more aggressive about security" or "Add a check for Alpine Linux versions").

## 6. Technical Requirements

### 6.1 Tech Stack
*   **Frontend:** React (Next.js) with Vanilla CSS for a minimalist, developer-centric UI.
*   **Backend:** Node.js (TypeScript) for seamless integration with existing CLI logic.
*   **LLM Orchestration:** Vercel AI SDK (for its multi-provider adapter support).
*   **AI Providers:** 
    *   **Gemini:** 1.5 Pro/Flash for large context analysis and multimodal capabilities.
    *   **GitHub Copilot:** Integration for high-precision coding assistance.
    *   **LM Studio:** Local OpenAI-compatible API for offline, private, and zero-latency generation.

### 6.2 Data Security
*   **Local-First Option:** Full support for LM Studio to ensure no codebase context or prompts leave the developer's machine.
*   **Configurable Providers:** Users can granularly choose which provider to use for specific tasks (e.g., Local for drafting, Cloud for final refining).
*   **Secret Scrubbing:** Automated detection and removal of API keys/secrets from generated instructions.

## 7. User Experience (UX) Flow
1.  **Prompt:** User enters the "Demand".
2.  **Analysis:** The app displays a "Thinking" state, showing the inferred goals, tools, and constraints.
3.  **Draft:** A side-by-side view of the generated `SKILL.md` and `Instructions`.
4.  **Edit/Iterate:** User modifies via chat or direct text editing.
5.  **Export:** One-click "Install to Gemini CLI", "Download ZIP", or "Download as Markdown".

## 8. Success Metrics (KPIs)
*   **Synthesis Success Rate:** % of generated skills that run without syntax errors in the target CLI.
*   **User Retention:** % of users who create more than 3 skills.
*   **Refinement Cycles:** Average number of iterations before a skill is "Exported" (Target: < 3).

## 9. Roadmap
*   **V1:** Text-to-Skill generation (Markdown only).
*   **V2:** Automatic Tooling generation (Python/TS boilerplate for custom tools).
*   **V3:** Skill Testing Sandbox (Simulate the agent's behavior within the UI).
