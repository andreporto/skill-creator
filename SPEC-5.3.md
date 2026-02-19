# Specification: Interactive Refinement (Requirement 5.3)

**Status:** Draft  
**Related PRD:** [PRD.md](./PRD.md)  
**Feature Owner:** Senior Lead Engineer

---

## 1. Overview
The Interactive Refinement feature allows users to iteratively improve a generated skill through natural language directives. It provides transparency by highlighting changes (diffs) between versions, ensuring the user has full control over the final artifact.

## 2. Technical Architecture

### 2.1 State Management
To support refinement and diffing, the application state must track the version history of the generated skill.

```typescript
interface RefinementHistory {
  iterations: {
    directive: string; // The prompt used to refine (empty for first gen)
    output: SkillOutput;
    timestamp: number;
  }[];
  currentIndex: number;
}
```

### 2.2 Refinement Service
The `ai.ts` service must be expanded to handle refinements.

*   **Function:** `refineSkill(previousSkill: SkillOutput, directive: string): Promise<SkillOutput>`
*   **Logic:** 
    1.  Send the previous `SkillOutput` and the new `directive` to the LLM.
    2.  Use a specialized "Refinement Prompt" (see Section 2.4).
    3.  Return the updated `SkillOutput`.

### 2.4 Refinement Prompt Strategy
To ensure the LLM performs surgical updates rather than complete rewrites, the refinement prompt should follow this structure:

```markdown
# Refinement Task
You are an expert editor for AI Agent Skills.

## Previous Skill State:
[JSON representation of previous SkillOutput]

## User Directive:
"{{directive}}"

## Instructions:
1. Analyze the User Directive in the context of the Previous Skill State.
2. Apply the requested changes while maintaining the original architectural integrity.
3. If the directive asks for a new mandate, add it to `expert_persona.mandates`.
4. If the directive asks for behavior changes, update the relevant `instructions/` files.
5. Return the FULL updated JSON object.
```

### 2.3 Diffing Engine
We will use a standard text-diffing algorithm (e.g., `diff-lines`) to compare `SkillOutput` artifacts between `iterations[i]` and `iterations[i-1]`.

*   **Granularity:** Diffing should happen at the artifact level (e.g., individual files in `instructions[]`).
*   **UI Representation:** 
    *   `Added`: Green background (`+`)
    *   `Removed`: Red background (`-`)
    *   `Unchanged`: Normal text

## 3. User Interface Components

### 3.1 Directive Input (The "Chat")
A fixed or contextual input field where users can type follow-up instructions.
*   **Placeholder:** "e.g., Add a check for Alpine Linux versions..."
*   **Action:** Trigger `refineSkill`.

### 3.2 Side-by-Side Diff View
A toggleable view mode for the `ResultsSection`.
*   **Current View:** Shows the latest version of the artifacts.
*   **Diff View:** Highlights what changed since the previous iteration.

### 3.3 Iteration History Navigator
A breadcrumb or stepper component allowing users to go back to a previous version if a refinement went off-track.

## 4. Interaction Flow
1.  **Initial Generation:** User provides the "Demand". `SkillOutput` is saved as `Iteration 0`.
2.  **Refinement:** User enters a directive in the chat box.
3.  **Synthesis:** `refineSkill` is called. New `SkillOutput` is saved as `Iteration 1`.
4.  **Review:** UI defaults to "Diff View" for the new version, showing green/red highlights in the code blocks.
5.  **Iteration:** User repeats steps 2-4 until satisfied.

## 5. Implementation Tasks

### Phase 1: Service Layer
- [ ] Update `src/lib/types.ts` to include `RefinementHistory`.
- [ ] Implement `refineSkill` in `src/services/ai.ts` (mock initially).

### Phase 2: UI Foundation
- [ ] Add `DirectiveInput` component to `src/app/page.tsx`.
- [ ] Implement iteration history state in `Home` component.

### Phase 3: Diffing & Polish
- [ ] Integrate a diffing library (e.g., `diff-match-patch` or simple line-by-line).
- [ ] Create a `DiffPre` component to render highlighted text.
- [ ] Add "Version Selector" to navigate history.

## 6. Success Criteria
*   User can issue a directive and receive a modified skill in < 5 seconds.
*   The UI clearly highlights which lines of markdown were added or removed.
*   User can revert to any previous version in the history.
