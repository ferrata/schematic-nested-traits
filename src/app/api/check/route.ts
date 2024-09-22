import { type NextRequest } from "next/server";
import { SchematicClient } from "@schematichq/schematic-typescript-node";
import { UnauthorizedError } from "@schematichq/schematic-typescript-node/api";
import { strict } from "assert";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, companyId, siteId } = await request.json();
    strict(apiKey, "API key is required");
    strict(companyId, "Company ID is required");
    strict(siteId, "Site ID is required");

    const client = new SchematicClient({ apiKey });

    const company = await client.companies.getCompany(companyId);

    const entitlements = await client.entitlements.listPlanEntitlements({
      planId: company.data.plan?.id,
    });
    const entitlement = entitlements.data
      .filter((e) => e.feature?.name === "locale")
      .at(0)?.valueNumeric;
    const localesLimit = entitlement ?? 0;

    const companyTraits = company.data.traits ?? {};
    const companyLocaleTrait = companyTraits.locale as Record<
      string,
      { count: number }
    >;

    const siteLocaleTrait = companyLocaleTrait[siteId] ?? { count: 0 };

    const canAddLocale = siteLocaleTrait.count < localesLimit;

    return Response.json({
      companyTraits,
      siteLocaleTrait,
      localesLimit,
      canAddLocale,
    });
  } catch (error) {
    const message =
      error instanceof UnauthorizedError
        ? error
        : error instanceof Error
        ? error.message
        : error;
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
