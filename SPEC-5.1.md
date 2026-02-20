# Technical Specification (SPEC): AI Skill Creator - Skill Synthesis Engine

**Version:** 1.0.0
**Status:** Draft
**Owner:** Senior Lead Engineer
**Last Updated:** February 19, 2026

---

## 1. Introduction
This document provides a detailed technical specification for **Requirement 5.1: Skill Synthesis Engine (Core)** of the AI Skill Creator. The engine is responsible for transforming high-level natural language demands into a structured, executable AI Agent Skill compatible with the Gemini CLI architecture.

## 2. Requirement 5.1: Skill Synthesis Engine (Core)

### 2.1 Goal
To autonomously decompose a user's intent into a structured set of instructions, personas, and tool mappings that define a functional "Skill".

### 2.2 System Architecture
The Skill Synthesis Engine operates as a pipeline:
1.  **Input Layer:** Captures raw text "Demand" from the user.
2.  **Orchestration Layer:** Interfaces with the user-configured AI Provider (**Gemini**, **GitHub Copilot**, or **LM Studio**) using the `prompts/synthesis-engine.md` system prompt.
3.  **Synthesis Layer:** Decomposes the demand into a JSON structure (`SkillOutput`).
4.  **Validation Layer:** (Future) Checks the generated JSON against schemas and basic logic rules.
5.  **Output Layer:** Returns the finalized `SkillOutput` for UI rendering and artifact generation.

### 2.3 Input Processing & Intent Extraction
*   **Preprocessing:** The engine must clean the input (e.g., removing leading/trailing whitespace, normalizing line breaks).
*   **Intent Mapping:** The LLM identifies the primary "Action" (e.g., *Audit*, *Migrate*, *Generate*) and the "Target" (e.g., *Dockerfiles*, *Jest Tests*, *API Docs*).

### 2.4 Expert Persona Generation
The engine must generate a unique "Expert Persona" for each skill:
*   **Role:** A specific, senior-level title (e.g., "Senior Security Architect", "Refactoring Expert").
*   **Mandates:** 3–5 core principles the agent *must* follow (e.g., "Prioritize security over brevity").
*   **Constraints:** 2–4 strict limitations (e.g., "Do not modify `package-lock.json`").

### 2.5 Architecture Mapping (Tools & Resources)
The engine must automatically map the demand to the required Gemini CLI tools:
*   **`grep_search` / `glob`**: Selected if the demand involves finding files or patterns.
*   **`read_file`**: Selected if the demand requires analyzing file content.
*   **`run_shell_command`**: Selected if the demand requires executing scripts, builds, or tests.
*   **`web_search` / `firecrawl`**: Selected if external documentation or research is needed.

### 2.6 Workflow Synthesis
The engine structures the skill into three mandatory phases:
*   **Research Phase:** Steps to understand the current state/codebase.
*   **Strategy Phase:** Steps to plan the changes/actions.
*   **Execution Phase:** Steps to apply changes and **validate** the outcome.

## 3. Data Structures
As defined in `src/lib/types.ts`:

```typescript
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
```

## 4. Integration with `ai.ts`
The `generateSkill` service (currently mocked in `src/services/ai.ts`) will be updated to:
1.  Load the `prompts/synthesis-engine.md` system prompt.
2.  Initialize the provider adapter (Vercel AI SDK) using the user's specific provider configuration (API keys, model selection, base URLs).
3.  Send the user demand and configuration to the selected LLM.
4.  Parse the JSON response into the `SkillOutput` interface.
5.  Handle potential parsing errors or malformed JSON from the LLM.

## 5. Quality & Performance Metrics
*   **Response Time:** The synthesis should complete within 10–15 seconds for a typical demand.
*   **Token Efficiency:** Minimize prompt overhead while maintaining persona depth.
*   **Schema Adherence:** 100% of outputs must match the `SkillOutput` interface.
