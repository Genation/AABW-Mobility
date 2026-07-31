"use client";

import { AlertTriangle, Lightbulb, X, Bot } from "lucide-react";
import Image from "next/image";
import { AdvisorMessage, formatRelativeTime } from "../advisor-mock-rules";
import styles from "../drivo.module.css";

interface Props {
  messages: AdvisorMessage[];
  unreadCount: number;
  open: boolean;
  thinking: boolean;
  onToggle: () => void;
}

export function AIAdvisorWidget({ messages, unreadCount, open, thinking, onToggle }: Props) {
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
                  <span className={styles.advisorThinkingLoaderLabel}>Đang phân tích điểm dừng</span>
                  <div className={styles.advisorThinkingBar}>
                    <div className={styles.advisorThinkingBarFill} />
                  </div>
                  <span className={styles.advisorThinkingLoaderHint}>Đang đánh giá thời gian, độ an toàn và tiện ích xung quanh...</span>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className={styles.advisorEmpty}>
                {/* <Bot size={32} style={{ opacity: 0.3 }} /> */}
                <span>Chưa có gợi ý nào. Thêm điểm dừng để nhận cảnh báo thông minh.</span>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={styles.advisorMsgRow}>
                  {msg.severity === "warning" ? (
                    <AlertTriangle size={16} className={styles.advisorMsgIconWarning} />
                  ) : (
                    <Lightbulb size={16} className={styles.advisorMsgIconTip} />
                  )}
                  <div className={styles.advisorMsgBody}>
                    <div className={styles.advisorMsgText}>{msg.text}</div>
                    <div className={styles.advisorMsgTime}>{formatRelativeTime(msg.createdAt, now)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className={`${styles.advisorFabWrapper} ${open ? styles.advisorFabWrapperHidden : ""}`}>
        {/* {!open && (
          <span className={`${styles.advisorFabLabel} ${thinking ? styles.advisorFabLabelThinking : ""}`}>
            {thinking ? "Đang phân tích..." : "Trợ lý"}
          </span>
        )} */}
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
