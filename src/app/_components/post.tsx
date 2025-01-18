"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";

/**
 * A unified comment component that can display + create posts
 * for EITHER a case (via `caseId`) OR a politician (via `politicianId`).
 *
 * Usage:
 *   <Comments caseId="SOME_CASE_ID" />
 *    or
 *   <Comments politicianId="SOME_POLITICIAN_ID" />
 */
type CommentsProps = {
  caseId?: string;         // Provide this if you're dealing with a case
  politicianId?: string;   // Provide this if you're dealing with a politician
  refetchInterval?: number;
  staticId?: string; // new prop for "frontpage" or any static pages
};

export function Comments({
  caseId,
  politicianId,
  staticId,
  refetchInterval = 20000,
}: CommentsProps) {
  const [name, setName] = useState("");
  const utils = api.useUtils();

  // 1) Decide which query to call
  let postsQuery;
  if (caseId) {
    postsQuery = api.post.getByCaseId.useQuery({ caseId });
  } else if (politicianId) {
    postsQuery = api.post.getByPoliticianId.useQuery({ politicianId });
  } else if (staticId) {
    postsQuery = api.post.getByStaticId.useQuery({ staticId });
  }

  const posts = postsQuery?.data ?? [];

  // 2) Single “create” mutation
  const createMutation = api.post.create.useMutation({
    onSuccess: async () => {
      if (caseId) {
        await utils.post.getByCaseId.invalidate({ caseId });
      } else if (politicianId) {
        await utils.post.getByPoliticianId.invalidate({ politicianId });
      } else if (staticId) {
        await utils.post.getByStaticId.invalidate({ staticId });
      }
      setName("");
    },
  });

  // 3) Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, caseId, politicianId, staticId });
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Form at top */}
      <div className="flex-shrink-0 mb-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Del dine tanker..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Sender..." : "Send kommentar"}
          </button>
        </form>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto">
        {posts.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            Ingen kommentarer enda. Vær den første til å kommentere!
          </p>
        )}

        <div className="space-y-4">
          {posts
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-2">
                  {post.createdBy.image && post.createdBy.image !== "" ? (
                    <img
                      src={post.createdBy.image}
                      alt={post.createdBy.name ?? "User"}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        {post.createdBy.name?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{post.createdBy.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString("no-NB", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700">{post.name}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}