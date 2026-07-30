"use client";

import { useState, useMemo } from "react";
import { Plus, SearchX } from "lucide-react";
import type { PostTripPost } from "../types";
import { PostCard } from "../components/PostCard";
import { SearchBar } from "../components/SearchBar";
import styles from "../post-trip.module.css";

interface Props {
  posts: PostTripPost[];
  onPostClick: (id: string) => void;
  onCreateClick: () => void;
}

export function DiscoveryFeedScreen({
  posts,
  onPostClick,
  onCreateClick,
}: Props) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesQuery =
        !query ||
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description.toLowerCase().includes(query.toLowerCase());
      const matchesTags =
        activeTags.length === 0 ||
        activeTags.some((t) => post.tags.includes(t));
      return matchesQuery && matchesTags;
    });
  }, [posts, query, activeTags]);

  const handleTagToggle = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleToggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  return (
    <div className={styles.feedContainer}>
      <SearchBar
        query={query}
        activeTags={activeTags}
        onQueryChange={setQuery}
        onTagToggle={handleTagToggle}
      />

      {filteredPosts.length === 0 ? (
        <div className={styles.emptyState}>
          <SearchX className={styles.emptyStateIcon} />
          <div className={styles.emptyStateText}>
            Không tìm thấy chuyến đi nào
          </div>
          <div className={styles.emptyStateHint}>
            Thử từ khóa khác hoặc bỏ bộ lọc tag
          </div>
        </div>
      ) : (
        filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onClick={() => onPostClick(post.id)}
            onToggleLike={() => handleToggleLike(post.id)}
            isLiked={likedPosts.has(post.id)}
          />
        ))
      )}

      <button
        className={styles.fabButton}
        onClick={onCreateClick}
        title="Tạo bài đăng mới"
        type="button"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
