import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, handleApiError } from "@/lib/api-auth";
import { saveOpportunityRequestSchema } from "@/lib/validators";
import { opportunityService } from "@/lib/services/opportunity.service";

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthUserId(req);
    if (typeof authResult !== "string") return authResult;
    const userId = authResult;

    const body = await req.json();
    const data = saveOpportunityRequestSchema.parse(body);

    let id = data.id;
    if (id) {
      const { id: _id, ...updateData } = data;
      await opportunityService.update(id, updateData);
      
      return NextResponse.json({
        success: true,
        message: "Opportunity successfully updated",
        data: { id }
      }, { status: 200 });
    } else {
      id = crypto.randomUUID();
      const { id: _id, ...createData } = data;
      
      await opportunityService.create(id, {
        ...createData,
        userId,
      });
      
      return NextResponse.json({
        success: true,
        message: "Opportunity successfully created",
        data: { id }
      }, { status: 201 });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
