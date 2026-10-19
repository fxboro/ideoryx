import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, handleApiError } from "@/lib/api-auth";
import {
  taskService,
  decisionService,
  signalService,
  opportunityService,
  playbookService,
  workspaceService,
} from "@/lib/services";

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthUserId(req);
    if (typeof authResult !== "string") return authResult;
    const userId = authResult;

    const body = await req.json();
    const { collection, payload, workspaceId } = body;

    if (!collection || !payload) {
      return NextResponse.json(
        { error: "Missing collection or payload", success: false },
        { status: 400 }
      );
    }

    const id = payload.id || crypto.randomUUID();
    const targetWorkspaceId = workspaceId || payload.workspaceId || undefined;

    switch (collection) {
      case "tasks": {
        await taskService.create(id, {
          title: payload.title || "Untitled Task",
          description: payload.description || "",
          type: payload.type || "feature",
          priority: payload.priority || "medium",
          status: payload.status || "todo",
          workspaceId: targetWorkspaceId,
          userId,
        });
        return NextResponse.json({ success: true, message: "Task saved successfully", data: { id } });
      }

      case "decisions": {
        await decisionService.create(id, {
          title: payload.title || "Untitled Decision",
          context: payload.context || "",
          optionsConsidered: payload.optionsConsidered || [],
          chosenOption: payload.chosenOption || "",
          rationale: payload.rationale || "",
          tradeoffs: payload.tradeoffs,
          risks: payload.risks,
          workspaceId: targetWorkspaceId,
          userId,
        });
        return NextResponse.json({ success: true, message: "Decision saved successfully", data: { id } });
      }

      case "signals": {
        await signalService.create(id, {
          title: payload.title || "Untitled Signal",
          description: payload.description || "",
          category: payload.category || "performance",
          severity: payload.severity || "medium",
          status: payload.status || "new",
          source: payload.source || "manual",
          sourceMetadata: payload.sourceMetadata || {},
          workspaceId: targetWorkspaceId,
          userId,
        });
        return NextResponse.json({ success: true, message: "Signal saved successfully", data: { id } });
      }

      case "opportunities": {
        await opportunityService.create(id, {
          title: payload.title || "Untitled Opportunity",
          description: payload.description || "",
          status: payload.status || "open",
          category: payload.category || "performance",
          score: payload.score || 0,
          scoringBreakdown: payload.scoringBreakdown || {
            impact: 3,
            confidence: 3,
            effort: 3,
            explanation: "Default scoring",
          },
          sourceSignalIds: payload.sourceSignalIds || [],
          workspaceId: targetWorkspaceId,
          userId,
        });
        return NextResponse.json({ success: true, message: "Opportunity saved successfully", data: { id } });
      }

      case "playbooks": {
        await playbookService.create(id, {
          title: payload.title || "Untitled Playbook",
          category: payload.category || "general",
          summary: payload.summary || "",
          tags: payload.tags || [],
          steps: payload.steps || [],
          checklist: payload.checklist || [],
          promptTemplate: payload.promptTemplate || "",
          workspaceId: targetWorkspaceId,
          userId,
        });
        return NextResponse.json({ success: true, message: "Playbook saved successfully", data: { id } });
      }

      case "workspaces": {
        if (targetWorkspaceId) {
          await workspaceService.update(targetWorkspaceId, {
            stage: payload.stage,
          });
          return NextResponse.json({ success: true, message: "Workspace updated successfully", data: { id: targetWorkspaceId } });
        }
        return NextResponse.json({ error: "Missing workspaceId for stage update", success: false }, { status: 400 });
      }

      default:
        return NextResponse.json({ error: `Unknown collection: ${collection}`, success: false }, { status: 400 });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
