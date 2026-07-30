"use client";

import { useState } from "react";
import type { PostTripPost, PostTripScreen } from "./types";
import { mockPosts } from "./mock-data";
import { DiscoveryFeedScreen } from "./screens/DiscoveryFeedScreen";
import { PostDetailScreen } from "./screens/PostDetailScreen";
import { CreatePostScreen } from "./screens/CreatePostScreen";
import styles from "./post-trip.module.css";

export function PostTripApp() {
  const [screen, setScreen] = useState<PostTripScreen>("FEED");
  const [posts, setPosts] = useState<PostTripPost[]>(mockPosts);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const selectedPost = posts.find((p) => p.id === selectedPostId) ?? null;

  const navigateToDetail = (id: string) => {
    setSelectedPostId(id);
    setScreen("DETAIL");
  };

  const navigateToFeed = () => {
    setSelectedPostId(null);
    setScreen("FEED");
  };

  const navigateToCreate = () => {
    setScreen("CREATE");
  };

  const handleAddPost = (newPost: PostTripPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setScreen("FEED");
  };

  return (
    <div className={styles.container}>
      {screen === "FEED" && (
        <DiscoveryFeedScreen
          posts={posts}
          onPostClick={navigateToDetail}
          onCreateClick={navigateToCreate}
        />
      )}
      {screen === "DETAIL" && selectedPost && (
        <PostDetailScreen post={selectedPost} onBack={navigateToFeed} />
      )}
      {screen === "CREATE" && (
        <CreatePostScreen
          onSubmit={handleAddPost}
          onCancel={navigateToFeed}
        />
      )}
    </div>
  );
}
