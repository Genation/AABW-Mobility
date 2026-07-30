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

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q);
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
        <div className={styles.masonryGrid}>
          <div className={styles.masonryCol}>
            {filteredPosts
              .filter((_, i) => i % 2 === 0)
              .map((post, idx) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={idx}
                  onClick={() => onPostClick(post.id)}
                />
              ))}
          </div>
          <div className={styles.masonryCol}>
            {filteredPosts
              .filter((_, i) => i % 2 === 1)
              .map((post, idx) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={idx}
                  onClick={() => onPostClick(post.id)}
                />
              ))}
          </div>
        </div>
      )}

      <button
        className={styles.fabButton}
        onClick={onCreateClick}
        aria-label="Tạo bài đăng mới"
        type="button"
      >
        <Plus size={26} />
      </button>
    </div>
  );
}
