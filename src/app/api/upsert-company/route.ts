import { type NextRequest } from "next/server";
import { SchematicClient } from "@schematichq/schematic-typescript-node";
import { strict } from "assert";
import { responseFromError } from "@/lib/response-from-error";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, workspaceId, traits } = await request.json();
    strict(apiKey, "API key is required");
    strict(workspaceId, "Workspace ID is required");
    strict(traits, "Traits value is required");

    const client = new SchematicClient({ apiKey });

    const company = await client.companies.upsertCompany({
      keys: { workspace_id: workspaceId },
      traits,
    });

    return Response.json({ company });
  } catch (error) {
    return responseFromError(error);
  }
}
