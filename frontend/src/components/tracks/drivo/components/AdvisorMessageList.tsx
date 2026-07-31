"use client";

import { Lightbulb } from "lucide-react";
import { TripAdvisorWarning } from "../types";
import styles from "../drivo.module.css";

export function formatRelativeTime(createdAt: number, now: number): string {
  const diffSec = Math.max(0, Math.floor((now - createdAt) / 1000));
  if (diffSec < 60) return "vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  return `${diffHour} giờ trước`;
}

interface Props {
  messages: TripAdvisorWarning[];
  emptyText: string;
}

/** Shared row rendering for AI Advisor warnings — used by the floating panel and the inline itinerary section. */
export function AdvisorMessageList({ messages, emptyText }: Props) {
  const now = Date.now();

  if (messages.length === 0) {
    return (
      <div className={styles.advisorEmpty}>
        <span>{emptyText}</span>
      </div>
    );
  }

  return (
    <>
      {messages.map((msg) => (
        <div key={msg.id} className={styles.advisorMsgRow}>
          <Lightbulb size={16} className={styles.advisorMsgIconTip} />
          <div className={styles.advisorMsgBody}>
            <div className={styles.advisorMsgText}>
              {msg.message}
              {msg.confidence != null && (
                <span className={styles.advisorConfidence}>{Math.round(msg.confidence * 100)}%</span>
              )}
            </div>
            <div className={styles.advisorMsgTime}>{formatRelativeTime(msg.createdAt, now)}</div>
          </div>
        </div>
      ))}
    </>
  );
}
