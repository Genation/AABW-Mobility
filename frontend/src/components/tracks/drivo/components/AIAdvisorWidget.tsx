"use client";

import { Lightbulb, X } from "lucide-react";
import Image from "next/image";
import { TripAdvisorWarning } from "../types";
import styles from "../drivo.module.css";

function formatRelativeTime(createdAt: number, now: number): string {
  const diffSec = Math.max(0, Math.floor((now - createdAt) / 1000));
  if (diffSec < 60) return "vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  return `${diffHour} giờ trước`;
}

interface Props {
  messages: TripAdvisorWarning[];
  unreadCount: number;
  open: boolean;
  thinking: boolean;
  toastVisible: boolean;
  onToggle: () => void;
  onToastClick: () => void;
  onToastDismiss: () => void;
}

export function AIAdvisorWidget({
  messages,
  unreadCount,
  open,
  thinking,
  toastVisible,
  onToggle,
  onToastClick,
  onToastDismiss,
}: Props) {
  const now = Date.now();

  return (
    <>
      {open && (
        <div className={`${styles.advisorPanel} ${thinking ? styles.advisorPanelThinking : ""}`}>
          <div className={styles.advisorPanelHeader}>
            <div className={styles.advisorPanelTitle}>
              {thinking ? (
                <>
                  <span className={styles.advisorThinkingDot} />
                  <span>Đang phân tích...</span>
                </>
              ) : (
                <>
                  <Image
                    src="/bot-ai-gif.gif"
                    alt="Trợ lý AI"
                    width={48}
                    height={48}
                    priority
                    unoptimized
                    style={{ borderRadius: "50%" }}
                  />
                  <span>Trợ lý AI</span>
                </>
              )}
            </div>
            <button className={styles.advisorPanelCloseBtn} onClick={onToggle} aria-label="Đóng">
              <X size={16} />
            </button>
          </div>
          <div className={styles.advisorPanelBody}>
            {thinking && messages.length === 0 ? (
              <div className={styles.advisorThinkingLoader}>
                <Image
                  src="/bot-ai-gif.gif"
                  alt="Đang phân tích"
                  width={64}
                  height={64}
                  priority
                  unoptimized
                  style={{ borderRadius: "50%" }}
                />
                <div className={styles.advisorThinkingLoaderText}>
                  <span className={styles.advisorThinkingLoaderLabel}>Đang phân tích toàn hành trình</span>
                  <div className={styles.advisorThinkingBar}>
                    <div className={styles.advisorThinkingBarFill} />
                  </div>
                  <span className={styles.advisorThinkingLoaderHint}>Đang xem xét thứ tự chặng, thời gian và điều kiện dọc đường...</span>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className={styles.advisorEmpty}>
                <span>Chưa có gợi ý nào. Lưu chặng để AI phân tích toàn hành trình.</span>
              </div>
            ) : (
              messages.map((msg) => (
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
              ))
            )}
          </div>
        </div>
      )}

      <div className={`${styles.advisorFabWrapper} ${open ? styles.advisorFabWrapperHidden : ""}`}>
        {toastVisible && !open && (
          <button type="button" className={styles.advisorToast} onClick={onToastClick}>
            AI có gợi ý mới, click để xem
            <span
              className={styles.advisorToastClose}
              onClick={(e) => {
                e.stopPropagation();
                onToastDismiss();
              }}
            >
              <X size={12} />
            </span>
          </button>
        )}
        <button
          type="button"
          className={`${styles.advisorFab} ${thinking ? styles.advisorFabThinking : ""} ${open ? styles.advisorFabActive : ""}`}
          onClick={onToggle}
          aria-label="Gợi ý AI"
        >
          <Image
            src="/bot-ai-gif.gif"
            alt="Trợ lý AI"
            width={40}
            height={40}
            priority
            unoptimized
            style={{ borderRadius: "50%" }}
          />
          {unreadCount > 0 && !thinking && <span className={styles.advisorBadge}>{unreadCount}</span>}
          {thinking && <span className={styles.advisorPulse} />}
        </button>
      </div>
    </>
  );
}
