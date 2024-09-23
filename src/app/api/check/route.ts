import { type NextRequest } from "next/server";
import { SchematicClient } from "@schematichq/schematic-typescript-node";
import { strict } from "assert";
import { responseFromError } from "@/lib/response-from-error";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, workspaceId, siteId } = await request.json();
    strict(apiKey, "API key is required");
    strict(workspaceId, "Workspace ID is required");
    strict(siteId, "Site ID is required");

    const client = new SchematicClient({ apiKey });

    const companies = await client.companies.listCompanies();

    const company = companies.data
      .filter(
        (c) =>
          c.keys.filter((k) => k.key === "workspace_id").at(0)?.value ===
          workspaceId
      )
      .at(0);

    strict(company, "Company not found");
    strict(
      company.plan?.id,
      "Company does not have a plan, please assign a plan to the company using Plan audience"
    );

    const entitlements = await client.entitlements.listPlanEntitlements({
      planId: company.plan?.id,
    });

    const entitlement = entitlements.data
      .filter((e) => e.feature?.name === "locale")
      .at(0);

    strict(
      entitlement,
      "Plan does not have entitlement, please assign a locale entitlement to the plan"
    );

    const localesLimit = entitlement.valueNumeric ?? 0;

    const workspaceTraits = company.traits ?? {};
    const workspaceLocaleTrait = workspaceTraits.locale as Record<
      string,
      { count: number }
    >;

    const siteLocaleTrait = workspaceLocaleTrait[siteId] ?? { count: 0 };

    const canAddLocale = siteLocaleTrait.count < localesLimit;

    return Response.json({
      workspaceLocaleTrait,
      siteLocaleTrait,
      localesLimit,
      canAddLocale,
    });
  } catch (error) {
    return responseFromError(error);
  }
}
