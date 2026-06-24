// ─────────────────────────────────────────────────────────────
// Prompt Templates — Mission Control AI
// System and user prompt builders for each V1 workflow.
// ─────────────────────────────────────────────────────────────

import type { AgentContext } from "./types";
import type { AllWorkflowId } from "./types";

interface PromptPair {
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Resolves the system + user prompt pair for a given workflow.
 * Each workflow gets a tailored system persona and structured
 * output instruction, plus a user prompt assembled from context.
 */
export function resolvePromptTemplate(workflowId: AllWorkflowId, context: AgentContext): PromptPair {
  const resolvers: Record<AllWorkflowId, (ctx: AgentContext) => PromptPair> = {
    idea_to_mvp: buildIdeaToMvpPrompt,
    mvp_to_technical_plan: buildMvpToTechnicalPlanPrompt,
    feature_to_build_plan: buildFeatureToBuildPlanPrompt,
    lead_to_proposal: buildLeadToProposalPrompt,
    weekly_review: buildWeeklyReviewPrompt,
    validate_idea: buildValidateIdeaPrompt,
    launch_prep: buildLaunchPrepPrompt,
    delivery_update: buildDeliveryUpdatePrompt,
    optimize_product: buildOptimizeProductPrompt,
    analyze_signals: buildAnalyzeSignalsPrompt,
  };

  return resolvers[workflowId](context);
}

// ── Shared Helpers ───────────────────────────────────────────

function formatMemories(context: AgentContext): string {
  if (context.memories.length === 0) return "No relevant memories available.";
  return context.memories
    .map((m) => `- [${m.type}] ${m.content} (confidence: ${m.confidence}%)`)
    .join("\n");
}

function formatProject(context: AgentContext): string {
  if (!context.project) return "No project context provided.";
  const p = context.project;
  return [
    `Project: ${p.name}`,
    `Type: ${p.type} | Phase: ${p.phase} | Status: ${p.status}`,
    `Summary: ${p.summary}`,
    p.stack?.length ? `Stack: ${p.stack.join(", ")}` : null,
    p.currentFocus ? `Current Focus: ${p.currentFocus}` : null,
    p.nextMilestone ? `Next Milestone: ${p.nextMilestone}` : null,
    `Risk: ${p.risk}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatTasks(context: AgentContext): string {
  if (context.tasks.length === 0) return "No tasks available.";
  return context.tasks
    .map((t) => `- [${t.status}] ${t.title} (${t.priority} priority, ${t.type})`)
    .join("\n");
}

function formatDecisions(context: AgentContext): string {
  if (!context.decisions || context.decisions.length === 0) return "No recent decisions.";
  return context.decisions
    .map((d) => `- ${d.title}: Chosen [${d.chosenOption}] because ${d.rationale}`)
    .join("\n");
}

function formatAgentRuns(context: AgentContext): string {
  if (!context.agentRuns || context.agentRuns.length === 0) return "No recent agent runs.";
  return context.agentRuns
    .map((r) => `- [${r.agentRole}] ${r.workflowId}: ${r.inputGoal}`)
    .join("\n");
}

function formatLearningItems(context: AgentContext): string {
  if (!context.learningItems || context.learningItems.length === 0) return "No active learning items.";
  return context.learningItems
    .map((l) => `- [${l.status}] ${l.title} (${l.skillLevel}, ${l.progress}% complete)`)
    .join("\n");
}

function formatGoals(context: AgentContext): string {
  if (context.goals.length === 0) return "No active goals.";
  return context.goals
    .map((g) => `- [${g.status}] ${g.title} — ${g.timeframe} (${g.progress ?? 0}% complete)`)
    .join("\n");
}

function formatLead(context: AgentContext): string {
  if (!context.lead) return "No lead context provided.";
  const l = context.lead;
  return [
    `Business: ${l.businessName}`,
    l.contactName ? `Contact: ${l.contactName}` : null,
    l.niche ? `Niche: ${l.niche}` : null,
    l.painPoint ? `Pain Point: ${l.painPoint}` : null,
    l.urgency ? `Urgency: ${l.urgency}` : null,
    l.budgetSignal ? `Budget Signal: ${l.budgetSignal}` : null,
    l.notes ? `Notes: ${l.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

const JSON_INSTRUCTION = `\nIMPORTANT: You MUST respond with ONLY valid JSON matching the specified schema. No markdown, no explanations, no extra text. Just the JSON object.`;

// ── Workflow-Specific Prompt Builders ────────────────────────

function buildIdeaToMvpPrompt(ctx: AgentContext): PromptPair {
  return {
    systemPrompt: `You are a senior product strategist and startup founder advisor.
Your job is to take a raw product idea and scope it into a concrete, buildable MVP.
Be practical, opinionated, and focused on shipping.

${JSON_INSTRUCTION}

Respond with this exact JSON structure:
{
  "projectName": "string",
  "problemStatement": "string",
  "targetUser": "string",
  "coreFeatures": ["string"],
  "mvpScope": "string",
  "outOfScope": ["string"],
  "suggestedStack": ["string"],
  "estimatedTimeline": "string",
  "risks": ["string"],
  "nextSteps": ["string"]
}`,
    userPrompt: `## Idea / Goal
${ctx.inputGoal}

## User Memories & Preferences
${formatMemories(ctx)}

## Current Goals
${formatGoals(ctx)}

${ctx.additionalContext ? `## Additional Context\n${ctx.additionalContext}` : ""}`,
  };
}

function buildMvpToTechnicalPlanPrompt(ctx: AgentContext): PromptPair {
  return {
    systemPrompt: `You are a senior software architect.
Your job is to take an MVP specification and produce a detailed technical architecture.
Consider scalability, developer experience, and practical trade-offs.

${JSON_INSTRUCTION}

Respond with this exact JSON structure:
{
  "architectureOverview": "string",
  "components": [{"name": "string", "responsibility": "string", "techChoice": "string"}],
  "dataModel": [{"entity": "string", "fields": ["string"], "relationships": "string"}],
  "apiEndpoints": [{"method": "string", "path": "string", "description": "string"}],
  "deploymentStrategy": "string",
  "techDecisions": [{"decision": "string", "rationale": "string", "alternatives": ["string"]}],
  "implementationOrder": ["string"],
  "risks": ["string"]
}`,
    userPrompt: `## Goal
${ctx.inputGoal}

## Project Context
${formatProject(ctx)}

## Existing Tasks
${formatTasks(ctx)}

## User Memories & Preferences
${formatMemories(ctx)}

${ctx.additionalContext ? `## Additional Context\n${ctx.additionalContext}` : ""}`,
  };
}

function buildFeatureToBuildPlanPrompt(ctx: AgentContext): PromptPair {
  return {
    systemPrompt: `You are a senior full-stack developer and technical lead.
Your job is to break a feature request into concrete, estimable, prioritised tasks.
Think about implementation order, dependencies, and edge cases.

${JSON_INSTRUCTION}

Respond with this exact JSON structure:
{
  "featureSummary": "string",
  "tasks": [{"title": "string", "description": "string", "type": "feature|bug|chore|research", "priority": "low|medium|high|urgent", "estimateHours": number, "dependencies": ["string"]}],
  "acceptanceCriteria": ["string"],
  "techNotes": "string",
  "riskFlags": ["string"]
}`,
    userPrompt: `## Feature Request
${ctx.inputGoal}

## Project Context
${formatProject(ctx)}

## Current Tasks
${formatTasks(ctx)}

## User Memories & Preferences
${formatMemories(ctx)}

${ctx.additionalContext ? `## Additional Context\n${ctx.additionalContext}` : ""}`,
  };
}

function buildLeadToProposalPrompt(ctx: AgentContext): PromptPair {
  return {
    systemPrompt: `You are a freelance business consultant and proposal writer.
Your job is to create a professional, persuasive proposal for a potential client.
Be clear, concise, and focus on value delivered.

${JSON_INSTRUCTION}

Respond with this exact JSON structure:
{
  "proposalTitle": "string",
  "problemSummary": "string",
  "proposedSolution": "string",
  "scope": "string",
  "deliverables": ["string"],
  "timeline": "string",
  "pricing": "string",
  "assumptions": "string",
  "risks": "string"
}`,
    userPrompt: `## Goal
${ctx.inputGoal}

## Lead Details
${formatLead(ctx)}

## User Memories & Preferences
${formatMemories(ctx)}

${ctx.additionalContext ? `## Additional Context\n${ctx.additionalContext}` : ""}`,
  };
}

function buildWeeklyReviewPrompt(ctx: AgentContext): PromptPair {
  return {
    systemPrompt: `You are a personal productivity coach and execution strategist.
Your job is to review the user's week, identify patterns, surface blockers,
and prepare clear priorities for the next week.

${JSON_INSTRUCTION}

Respond with this exact JSON structure:
{
  "weekSummary": "string",
  "completedItems": ["string"],
  "inProgressItems": ["string"],
  "blockers": ["string"],
  "learnings": ["string"],
  "nextWeekPriorities": ["string"],
  "suggestedGoals": ["string"],
  "overallMomentum": "strong|steady|slow|stalled",
  "learningTarget": "string"
}`,
    userPrompt: `## Goal
${ctx.inputGoal}

## Active Goals
${formatGoals(ctx)}

## Project Context
${formatProject(ctx)}

## Tasks (Current & Recent)
${formatTasks(ctx)}

## Recent Decisions
${formatDecisions(ctx)}

## Recent Agent Runs
${formatAgentRuns(ctx)}

## Learning Items
${formatLearningItems(ctx)}

## User Memories & Preferences
${formatMemories(ctx)}

${ctx.additionalContext ? `## Additional Context\n${ctx.additionalContext}` : ""}`,
  };
}

function formatWorkspace(context: AgentContext): string {
  if (!context.workspace) return "No workspace context provided.";
  const w = context.workspace;
  
  let checklistsText = "";
  if (w.checklists && typeof w.checklists === "object") {
    checklistsText = Object.entries(w.checklists)
      .map(([stageName, items]) => {
        const itemsText = items
          .map((item) => `  - [${item.completed ? "x" : " "}] ${item.label}`)
          .join("\n");
        return `### Stage: ${stageName}\n${itemsText}`;
      })
      .join("\n\n");
  } else {
    checklistsText = "No checklists defined.";
  }

  return [
    `Workspace: ${w.name}`,
    `Type: ${w.workspaceType} | Stage: ${w.stage} | Status: ${w.status}`,
    `Summary: ${w.summary}`,
    w.stack?.length ? `Stack: ${w.stack.join(", ")}` : null,
    w.currentFocus ? `Current Focus: ${w.currentFocus}` : null,
    w.nextMilestone ? `Next Milestone: ${w.nextMilestone}` : null,
    `Readiness Score: ${w.readinessScore}%`,
    `Risk Level: ${w.risk}`,
    `\n## Stage Checklists:\n${checklistsText}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatSignals(context: AgentContext): string {
  if (!context.signals || context.signals.length === 0) return "No telemetry signals available.";
  return context.signals
    .map((s) => `- [${s.category}] [Severity: ${s.severity}] [Status: ${s.status}] ${s.title}: ${s.description} (Source: ${s.source})`)
    .join("\n");
}

function buildValidateIdeaPrompt(ctx: AgentContext): PromptPair {
  return {
    systemPrompt: `You are a market validation specialist.
Your job is to analyze a product idea or client workspace and evaluate its market validation.
Focus on identifying the target customer profile (ICP), defining acquisition channels, and highlighting validation metrics.

${JSON_INSTRUCTION}

Respond with this exact JSON structure:
{
  "validationSummary": "string",
  "channels": ["string"]
}`,
    userPrompt: `## Input Goal
${ctx.inputGoal}

## Workspace Context
${formatWorkspace(ctx)}

## User Memories & Preferences
${formatMemories(ctx)}

${ctx.additionalContext ? `## Additional Context\n${ctx.additionalContext}` : ""}`,
  };
}

function buildLaunchPrepPrompt(ctx: AgentContext): PromptPair {
  return {
    systemPrompt: `You are a release coordinator and launch specialist.
Your job is to prepare release checklists, monitoring setup, and launch details to transition a workspace from build to launch.

${JSON_INSTRUCTION}

Respond with this exact JSON structure:
{
  "launchChecklist": ["string"]
}`,
    userPrompt: `## Input Goal
${ctx.inputGoal}

## Workspace Context
${formatWorkspace(ctx)}

## User Memories & Preferences
${formatMemories(ctx)}

${ctx.additionalContext ? `## Additional Context\n${ctx.additionalContext}` : ""}`,
  };
}

function buildDeliveryUpdatePrompt(ctx: AgentContext): PromptPair {
  return {
    systemPrompt: `You are a project manager and client communications specialist.
Your job is to compile a client-ready delivery report summarizing sprint status, progress reviews, and changelogs.

${JSON_INSTRUCTION}

Respond with this exact JSON structure:
{
  "sprintStatusSummary": "string"
}`,
    userPrompt: `## Input Goal
${ctx.inputGoal}

## Workspace Context
${formatWorkspace(ctx)}

## User Memories & Preferences
${formatMemories(ctx)}

${ctx.additionalContext ? `## Additional Context\n${ctx.additionalContext}` : ""}`,
  };
}

function buildOptimizeProductPrompt(ctx: AgentContext): PromptPair {
  return {
    systemPrompt: `You are a product optimization engineer and UX specialist.
Your job is to identify product improvement opportunities (performance, cost, security, quality, growth).

${JSON_INSTRUCTION}

Respond with this exact JSON structure:
{
  "optimizationCandidates": ["string"]
}`,
    userPrompt: `## Input Goal
${ctx.inputGoal}

## Workspace Context
${formatWorkspace(ctx)}

## Telemetry Signals
${formatSignals(ctx)}

## User Memories & Preferences
${formatMemories(ctx)}

${ctx.additionalContext ? `## Additional Context\n${ctx.additionalContext}` : ""}`,
  };
}

function buildAnalyzeSignalsPrompt(ctx: AgentContext): PromptPair {
  return {
    systemPrompt: `You are a telemetry analyst and reliability engineer.
Your job is to scan error logs, user feedback, and tickets to compile a triage report.

${JSON_INSTRUCTION}

Respond with this exact JSON structure:
{
  "triageReport": "string"
}`,
    userPrompt: `## Input Goal
${ctx.inputGoal}

## Workspace Context
${formatWorkspace(ctx)}

## Telemetry Signals
${formatSignals(ctx)}

## User Memories & Preferences
${formatMemories(ctx)}

${ctx.additionalContext ? `## Additional Context\n${ctx.additionalContext}` : ""}`,
  };
}

