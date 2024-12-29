"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();
  const utils = api.useUtils();
  const [name, setName] = useState("");
  
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });

  return (
    <div className="space-y-4">
      {latestPost ? (
        <p className="text-gray-700">
          Your most recent post: <span className="font-medium">{latestPost.name}</span>
        </p>
      ) : (
        <p className="text-gray-500">You have no posts yet.</p>
      )}
      
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate({ name });
        }}
        className="space-y-4"
      >
        <input
          type="text"
          placeholder="What's on your mind?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Posting..." : "Post Update"}
        </button>
      </form>
    </div>
  );
}