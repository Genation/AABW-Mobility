"use client";

import { Sparkles, AlertTriangle, Lightbulb, X } from "lucide-react";
import { AdvisorMessage, formatRelativeTime } from "../advisor-mock-rules";
import styles from "../drivo.module.css";

interface Props {
  messages: AdvisorMessage[];
  unreadCount: number;
  open: boolean;
  onToggle: () => void;
}

export function AIAdvisorWidget({ messages, unreadCount, open, onToggle }: Props) {
  // eslint-disable-next-line react-hooks/purity -- relative-time snapshot per render by design; no interval timer (YAGNI)
  const now = Date.now();

  return (
    <>
      {open && (
        <div className={styles.advisorPanel}>
          <div className={styles.advisorPanelHeader}>
            <span>Trợ lý hành trình</span>
            <button className={styles.advisorPanelCloseBtn} onClick={onToggle} aria-label="Đóng">
              <X size={16} />
            </button>
          </div>
          <div className={styles.advisorPanelBody}>
            {messages.length === 0 ? (
              <div className={styles.advisorEmpty}>
                Chưa có gợi ý nào. Thêm điểm dừng để nhận cảnh báo.
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

      <button
        type="button"
        className={styles.advisorFab}
        onClick={onToggle}
        aria-label="Gợi ý AI"
      >
        <Sparkles size={24} />
        {unreadCount > 0 && <span className={styles.advisorBadge}>{unreadCount}</span>}
      </button>
    </>
  );
}
