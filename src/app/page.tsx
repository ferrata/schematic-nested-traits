"use client";

import Image from "next/image";
import { useState } from "react";

import { ApiKey } from "@/components/api-key";
import { CodeBlock } from "@/components/code-block";
import { cn } from "@/lib/cn";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [companyId, setCompanyId] = useState("company-id");
  const [siteId, setSiteId] = useState("site-id");

  const [responseCode, setResponseCode] = useState(-1);
  const [response, setResponse] = useState("");

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

        <ApiKey apiKey={apiKey} setApiKey={setApiKey} />

        <CodeBlock
          language="typescript"
          code={`// Step 1: get the company

const apiKey = "${"•".repeat(apiKey.length)}";
const client = new SchematicClient({ apiKey });

const company = await client.companies.getCompany("${companyId}");
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

const companyTraits = company.data.traits ?? {};

const companyLocaleTrait = companyTraits.locale as Record<
  string,
  { count: number }
>;

const siteLocaleTrait = companyLocaleTrait["${siteId}"] ?? { count: 0 };
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
            className="flex gap-4 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              // console.log("submit");
              fetch("/api/check", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ apiKey, companyId, siteId }),
              })
                .then((res) => {
                  setResponseCode(res.status);
                  return res.json();
                })
                .then((data) => {
                  setResponse(JSON.stringify(data, null, 2));
                });
            }}
          >
            <input
              type="text"
              placeholder="Company ID"
              className="w-full border border-solid rounded-lg border-black/[.08] dark:border-white/[.145] px-2 py-1 text-sm text-white bg-transparent"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            />
            <input
              type="text"
              placeholder="Site ID"
              className="w-full border border-solid rounded-lg border-black/[.08] dark:border-white/[.145] px-2 py-1 text-sm text-white bg-transparent"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-lg border border-solid dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm px-4"
            >
              Check
            </button>
          </form>
        </div>

        {response && (
          <div className="w-full flex flex-col gap-2">
            <div
              className={cn(
                "pb-0",
                responseCode === 200
                  ? "text-green-500"
                  : responseCode >= 400
                  ? "text-red-500"
                  : "text-black"
              )}
            >
              status: {responseCode}
            </div>

            <CodeBlock language="json" code={response} className="pt-0" />
          </div>
        )}
      </main>
    </div>
  );
}
