"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

type Props = {
  apiKey: string;
  setApiKey: (apiKey: string) => void;
};

export function ApiKey({ apiKey, setApiKey }: Props) {
  const [apiKeyValue, setApiKeyValue] = useState(apiKey);
  const [apiKeyExpanded, setApiKeyExpanded] = useState(false);
  const isSet = apiKey.length > 0;

  return (
    <div className="h-8 w-full">
      {apiKeyExpanded ? (
        <form
          className="flex w-full border border-solid rounded border-black/[.08] dark:border-white/[.145]"
          onSubmit={(e) => {
            e.preventDefault();
            setApiKey(apiKeyValue);
            setApiKeyExpanded(false);
          }}
        >
          <input
            type="password"
            placeholder="API key"
            value={apiKeyValue}
            onChange={(e) => setApiKeyValue(e.target.value)}
            className="rounded-l w-full text-white bg-transparent border border-solid border-black/[.08] dark:border-white/[.145] px-2 py-1 text-sm"
          />
          <button
            type="submit"
            className="rounded-r min-w-28 dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm px-4"
          >
            {isSet ? "Update" : "Set"}
          </button>
        </form>
      ) : (
        <button
          onClick={() => setApiKeyExpanded(true)}
          className={cn(
            "h-8 w-full rounded border border-solid transition-colors flex items-center justify-center border-transparent text-sm px-4",
            isSet
              ? "border-black/[.08] dark:border-white/[.145] hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] "
              : "hover:border-red-500 dark:hover:border-red-500 bg-red-500/[.1] dark:hover:bg-red-500/[.1] text-red-500"
          )}
        >
          {isSet ? (
            <span className="flex items-center gap-1">
              <span className="pr-2">API Key</span>
              {Array.from(apiKey).map((_, i) => (
                <span
                  key={i}
                  className="w-1 h-1 bg-black dark:bg-white rounded"
                />
              ))}
            </span>
          ) : (
            "Set API Key"
          )}
        </button>
      )}
    </div>
  );
}
