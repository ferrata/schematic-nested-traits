"use client";

import Image from "next/image";
import { useState } from "react";

import { ApiKey } from "@/components/api-key";
import { CodeBlock } from "@/components/code-block";
import { cn } from "@/lib/cn";

type WorkspaceKey = "workspace-1";
type SiteKey = "site-1" | "site-2";

type ApiResponse = {
  title: string;
  code: number;
  data: string;
  isJson: boolean;
};

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const workspaceId: WorkspaceKey = "workspace-1";
  const [siteId, setSiteId] = useState<SiteKey>("site-1");

  const [response, setResponse] = useState<ApiResponse | null>();

  function isJsonResponse(res: Response) {
    const contentType = res.headers.get("content-type");
    return contentType?.includes("application/json") ?? false;
  }

  async function toApiResponse(
    title: string,
    response: Response
  ): Promise<ApiResponse> {
    const data = await response.text();
    const isJson = isJsonResponse(response);

    return {
      title,
      code: response.status,
      data: isJson
        ? JSON.stringify(JSON.parse(data), null, 2)
        : `${data.substring(0, 60)}...`,
      isJson,
    };
  }

  async function upsertCompany() {
    const response = await fetch("/api/upsert-company", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey,
        workspaceId,
        traits: {
          locale: {
            "site-1": { count: 1 },
            "site-2": { count: 2 },
          },
        },
      }),
    });

    const apiResponse = await toApiResponse("Upsert response", response);
    setResponse(apiResponse);
  }

  async function check(workspaceId: WorkspaceKey, siteId: SiteKey) {
    const response = await fetch("/api/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey,
        workspaceId,
        siteId,
      }),
    });

    const apiResponse = await toApiResponse("Check traits response", response);
    setResponse(apiResponse);
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-4 row-start-2 items-center sm:items-start">
        <div className="w-full flex flex-row gap-4 items-center justify-center">
          <Image
            src="https://ferrata.dev/static/img/avatar.jpg"
            alt="Sasha"
            width={38}
            height={38}
            priority
            className="rounded-full"
          />
          <span className="text-lg">is testing</span>
          <Image
            src="https://storage.googleapis.com/s.mkswft.com/RmlsZTo2Y2QxNjFjNi1hZmIxLTQ4NGUtODk4Yy1mMTg2ZjlmMmYxZDU=/logo.svg"
            alt="Schematic logo"
            width={180}
            height={38}
            priority
          />
        </div>

        <ApiKey
          apiKey={apiKey}
          setApiKey={(apiKey) => {
            setResponse(null);
            setApiKey(apiKey);
          }}
        />

        <button
          onClick={upsertCompany}
          className="w-full h-8 rounded border border-solid dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm px-4"
        >
          Upsert company with locale site traits
        </button>

        <CodeBlock
          language="typescript"
          code={`// Step 1: get the company

const apiKey = "${"•".repeat(apiKey.length)}";
const client = new SchematicClient({ apiKey });

const company = await client.companies.lookupCompany({
  keys: { workspace_id: "${workspaceId}" },
});
`}
        />

        <CodeBlock
          language="typescript"
          code={`// Step 2: get locale limit from the plan entitlement

const entitlements = await client.entitlements.listPlanEntitlements({
  planId: company.data.plan?.id,
});
const entitlement = entitlements.data
  .filter((e) => e.feature?.name === "locale")
  .at(0)?.valueNumeric;
const localesLimit = entitlement ?? 0;
`}
        />

        <CodeBlock
          language="typescript"
          code={`// Step 3: get site locale trait

const workspaceTraits = company.data.traits ?? {};

const workspaceLocaleTrait = workspaceTraits.locale as Record<
  string,
  { count: number }
>;

const siteLocaleTrait = workspaceLocaleTrait["${siteId}"] ?? { count: 0 };
`}
        />

        <CodeBlock
          language="typescript"
          code={`// Step 4: actual check

const canAddLocale = siteLocaleTrait.count < localesLimit;
`}
        />

        <div className="flex w-full flex-col gap-4">
          <form
            className="flex gap-4 w-full h-8"
            onSubmit={(e) => {
              e.preventDefault();
              check(workspaceId, siteId);
            }}
          >
            <input
              type="text"
              placeholder="Company ID"
              className="w-full border border-solid rounded border-black/[.08] dark:border-white/[.145] px-2 py-1 text-sm text-white bg-transparent"
              value={workspaceId}
              disabled
            />
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value as SiteKey)}
              className="w-full border border-solid rounded border-black/[.08] dark:border-white/[.145] px-2 py-1 text-sm text-white bg-transparent"
            >
              <option value="site-1">site-1</option>
              <option value="site-2">site-2</option>
            </select>
            <button
              type="submit"
              className="rounded border border-solid dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm px-4"
            >
              Check
            </button>
          </form>
        </div>

        {response && (
          <div className="w-full flex flex-col gap-2">
            <h2 className="text-gray-500">{response.title}</h2>
            <div
              className={cn(
                "border-l-4 pl-3 py-2 bg-gradient-to-l from-transparent",
                response.code === 200
                  ? "border-green-700 to-green-950"
                  : "border-red-700 to-red-950"
              )}
            >
              <span
                className={cn(
                  "text-sm",
                  response.code === 200 ? "text-green-700" : "text-red-700"
                )}
              >
                Status {response.code}
              </span>
            </div>

            <CodeBlock
              language={response.isJson ? "json" : "html"}
              code={response.data}
              className="pt-0"
            />
          </div>
        )}
      </main>
    </div>
  );
}
