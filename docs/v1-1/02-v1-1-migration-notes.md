# Mission Control V1.1 — Database Migration Notes

This document details the database migration strategy for transitioning from Mission Control V1 (Projects-based) to V1.1 (Workspaces-based), keeping V1 functionality fully intact.

---

## 1. Migration Strategy: Dual Collections (Parallel Run)

Instead of modifying the V1 `projects` collection in-place, we are creating a new `workspaces` collection.
- **Why?** This ensures full isolation. If any V1 client is still running, it will continue to write to `projects` without throwing schema errors or corrupting V1.1 workflows.
- **Rollback simplicity**: If V1.1 fails, reverting is a simple matter of changing the UI sidebar and redirects back to `/projects`.

---

## 2. Schema Translation Mapping

The migration endpoint `/api/migrate-projects` reads every document in `projects` and writes a corresponding document in `workspaces`.

| V1 Project Field | V1.1 Workspace Field | Translation Logic |
| :--- | :--- | :--- |
| `id` | `id` | Preserved (prevents breaking existing task/decision links). |
| `userId` | `userId` | Preserved. |
| `name` | `name` | Preserved. |
| `summary` | `summary` | Preserved. |
| `type` | `workspaceType` | `product` $\rightarrow$ `product`<br>`learning` $\rightarrow$ `product`<br>`freelance` $\rightarrow$ `client` |
| `phase` | `stage` | `spec` $\rightarrow$ `spec` (or `proposal` if client)<br>`build` $\rightarrow$ `build` (or `delivery` if client)<br>`launch` $\rightarrow$ `launch`<br>`maintenance` $\rightarrow$ `growth` (or `support` if client)<br>`completed` $\rightarrow$ `growth` (or `support` if client) |
| `status` | `status` | Preserved (`active`, `on_hold`, `completed`, `archived`). |
| `stack` | `stack` | Preserved. |
| `currentFocus` | `currentFocus` | Preserved. |
| `nextMilestone` | `nextMilestone` | Preserved. |
| `risk` | `risk` | Preserved. |
| `goalId` | `goalId` | Preserved. |
| `createdAt` | `createdAt` | Preserved. |
| `updatedAt` | `updatedAt` | Updated to migration epoch time. |
| *None* | `organizationId` | Set as `undefined` (ready for future tenant binding). |
| *None* | `checklists` | Populated with standard V1.1 checklist templates based on type. |
| *None* | `readinessScore` | Computed dynamically as: `(completedCount / totalCount) * 100` for the current stage. |

---

## 3. Migration Script Implementation Details (`/api/migrate-projects`)

The backend script will execute the migration inside a Firestore batch (capped at 500 documents per batch) to ensure atomic writes:

```typescript
// Conceptual migration process:
const projectSnap = await db.collection("projects").where("userId", "==", userId).get();
const batch = db.batch();

for (const doc of projectSnap.docs) {
  const p = doc.data();
  const workspaceType = (p.type === "freelance") ? "client" : "product";
  const stage = mapV1PhaseToV11Stage(p.phase, workspaceType);
  const checklists = initializeDefaultChecklist(workspaceType);
  
  // Calculate initial readiness score based on stage
  const currentStageChecklist = checklists[stage] || [];
  const completedCount = currentStageChecklist.filter(item => item.completed).length;
  const readinessScore = currentStageChecklist.length > 0 
    ? Math.round((completedCount / currentStageChecklist.length) * 100)
    : 0;

  const workspacePayload = {
    id: p.id,
    userId: p.userId,
    name: p.name,
    workspaceType,
    status: p.status,
    summary: p.summary,
    stage,
    readinessScore,
    checklists,
    stack: p.stack || [],
    currentFocus: p.currentFocus || "",
    nextMilestone: p.nextMilestone || "",
    risk: p.risk || "medium",
    goalId: p.goalId || null,
    createdAt: p.createdAt,
    updatedAt: Date.now(),
  };

  const wsRef = db.collection("workspaces").doc(p.id);
  batch.set(wsRef, workspacePayload);
}

await batch.commit();
```

---

## 4. Backup & Rollback Plan

### Pre-Migration Backup
Before running the migration endpoint:
1. Trigger a manual backup of the Firestore database via Google Cloud Console:
   ```bash
   gcloud firestore export gs://mission-control-backup-bucket/v1-pre-migration
   ```

### Rollback Process
If V1.1 needs to be aborted:
1. Revert UI layout sidebar changes (redirect `/workspaces` path back to `/projects`).
2. Delete the redirects inside `src/app/(dashboard)/projects`.
3. The `projects` collection is untouched and fully operational.
