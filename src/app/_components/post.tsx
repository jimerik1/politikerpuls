"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "~/trpc/react";

export function LatestPost({ stortingetId }: { stortingetId: string }) {
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wasScrolledToBottom = useRef(true);
  const hasInitiallyScrolled = useRef(false);
  
  // Fetch all posts with polling
  const { data: posts } = api.post.getByCaseId.useQuery(
    { caseId: stortingetId },
    { 
      refetchInterval: 20000 // Refetch every 20 seconds
    }
  );

  
  // Initial scroll to bottom only when first loaded
  useEffect(() => {
    if (posts && !hasInitiallyScrolled.current) {
      messagesEndRef.current?.scrollIntoView();
      hasInitiallyScrolled.current = true;
    }
  }, [posts]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isScrolledToBottom = 
      Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 50;
    wasScrolledToBottom.current = isScrolledToBottom;
  };

  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.getByCaseId.invalidate({ caseId: stortingetId });
      setName("");
      // Always scroll to bottom after user posts
      wasScrolledToBottom.current = true;
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    },
  });


  return (
    <div className="flex flex-col h-[600px]">
      {/* Add onScroll handler to the scrollable container */}
      <div className="flex-1 overflow-y-auto mb-4" onScroll={handleScroll}>
        <div className="space-y-4">
          {posts?.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ).map((post) => (
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
                    {new Date(post.createdAt).toLocaleDateString('no-NB', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <p className="text-gray-700">{post.name}</p>
            </div>
          ))}

          {posts?.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              Ingen kommentarer enda. Vær den første til å kommentere!
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>


      {/* Fixed position form at bottom */}
      <div className="flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createPost.mutate({
              name,
              caseId: stortingetId
            });
          }}
          className="space-y-4"
        >
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
            disabled={createPost.isPending}
          >
            {createPost.isPending ? "Sender..." : "Send kommentar"}
          </button>
        </form>
      </div>
    </div>
  );
}