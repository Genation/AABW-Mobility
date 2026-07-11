"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, Star, X } from "lucide-react";
import type { RouteMateGroup } from "@/lib/api";
import { needStyle } from "./needs-style";
import type { FlatRecommendation } from "./types";

/** Attribute presets per place bucket (café / restaurant / hotel). */
const ATTR_BY_NEED: Record<string, { label: string; value: string }[]> = {
  cafe: [
    { label: "Wi-Fi", value: "wifi" },
    { label: "Yên tĩnh", value: "yên tĩnh" },
    { label: "View đẹp", value: "view" },
    { label: "Rooftop", value: "rooftop" },
    { label: "Mở khuya", value: "mở khuya" },
    { label: "Chay", value: "chay" },
  ],
  food: [
    { label: "Gia đình", value: "gia đình" },
    { label: "Chay", value: "chay" },
    { label: "Phòng riêng", value: "phòng riêng" },
    { label: "Mở khuya", value: "mở khuya" },
    { label: "Lãng mạn", value: "lãng mạn" },
    { label: "Bãi đỗ xe", value: "bãi đỗ xe" },
  ],
  hotel: [
    { label: "Hồ bơi", value: "hồ bơi" },
    { label: "Bãi đỗ xe", value: "bãi đỗ xe" },
    { label: "Wi-Fi", value: "wifi" },
    { label: "Gia đình", value: "gia đình" },
  ],
};

interface Props {
  groups: RouteMateGroup[];
  visibleByNeed: Record<string, FlatRecommendation[]>;
  targets: Record<string, number>;
  onTarget: (needKey: string, km: number) => void;
  selectedIds: Set<string>;
  onToggle: (rec: FlatRecommendation) => void;
  attrsByNeed: Record<string, string[]>;
  onAttrToggle: (needKey: string, value: string) => void;
  onAttrAdd: (needKey: string, value: string) => void;
  routeKm: number;
  routeMin: number;
  selectedCount: number;
  onRegenerate: () => void;
  regenerating: boolean;
  addedMin: number | null;
  addedKm: number | null;
  collapsed: boolean;
  onCollapse: () => void;
}

const card = {
  background: "var(--card-bg, rgba(20,20,22,0.92))",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
};

function fmtMin(min: number) {
  if (min < 60) return `${min} phút`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}

export function SuggestionSheet({
  groups,
  visibleByNeed,
  targets,
  onTarget,
  selectedIds,
  onToggle,
  attrsByNeed,
  onAttrToggle,
  onAttrAdd,
  routeKm,
  routeMin,
  selectedCount,
  onRegenerate,
  regenerating,
  addedMin,
  addedKm,
  collapsed,
  onCollapse,
}: Props) {
  return (
    <div
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 1000,
        borderRadius: 16,
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        backdropFilter: "blur(10px)",
        maxHeight: collapsed ? undefined : "58%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ...card,
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onCollapse}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          background: "transparent",
          border: "none",
          borderBottom: collapsed ? "none" : "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700 }}>Có thể bạn sẽ thích</span>
        <span style={{ fontSize: 12, opacity: 0.6 }}>
          {routeKm.toFixed(0)} km · {fmtMin(routeMin)}
        </span>
        <span style={{ marginLeft: "auto", opacity: 0.7 }}>
          {collapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {!collapsed && (
        <div style={{ overflowY: "auto", padding: "6px 16px 12px" }}>
          {groups.map((group) => {
            const style = needStyle(group.need_key);
            const recs = visibleByNeed[group.need_key] ?? [];
            const target = targets[group.need_key];
            // Stop nearest the slider marker — the "suggested around ~X km".
            const suggestedId =
              group.slider && target != null && recs.length
                ? recs.reduce((best, r) =>
                    Math.abs((r.progress_km ?? 0) - target) <
                    Math.abs((best.progress_km ?? 0) - target)
                      ? r
                      : best,
                  ).poi_id
                : null;
            return (
              <div key={group.need_key} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 7,
                      background: style.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                    }}
                  >
                    {style.emoji}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{group.label}</span>
                  {group.why && <span style={{ opacity: 0.5, fontSize: 12 }}>· {group.why}</span>}
                </div>

                {/* Distance slider (fuel / charging / hotel) */}
                {group.slider && target != null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 2px 4px" }}>
                    <span style={{ fontSize: 12, opacity: 0.7, whiteSpace: "nowrap" }}>
                      Quanh mốc
                    </span>
                    <input
                      type="range"
                      min={group.slider.min}
                      max={group.slider.max}
                      step={5}
                      value={target}
                      onChange={(e) => onTarget(group.need_key, Number(e.target.value))}
                      style={{ flex: 1, accentColor: style.color }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, color: style.color, minWidth: 56, textAlign: "right" }}>
                      ~{Math.round(target)} km
                    </span>
                  </div>
                )}

                {/* Per-bucket attribute filter (café / restaurant / hotel) */}
                {ATTR_BY_NEED[group.need_key] && (
                  <BucketFilter
                    needKey={group.need_key}
                    color={style.color}
                    options={ATTR_BY_NEED[group.need_key]}
                    selected={attrsByNeed[group.need_key] ?? []}
                    onToggle={onAttrToggle}
                    onAdd={onAttrAdd}
                  />
                )}

                {/* Candidate cards */}
                {recs.length === 0 ? (
                  <div style={{ fontSize: 12, opacity: 0.5, marginTop: 8 }}>
                    {(attrsByNeed[group.need_key]?.length ?? 0) > 0
                      ? "Không có địa điểm phù hợp tiêu chí đã chọn."
                      : "Không tìm thấy trong hành lang tuyến đường."}
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginTop: 8 }}>
                    {recs.map((rec) => {
                      const active = selectedIds.has(rec.poi_id);
                      const suggested = rec.poi_id === suggestedId;
                      const border = active
                        ? `1.5px solid ${style.color}`
                        : suggested
                          ? `1.5px dashed ${style.color}`
                          : "1px solid rgba(255,255,255,0.12)";
                      return (
                        <button
                          key={rec.poi_id}
                          type="button"
                          onClick={() => onToggle(rec)}
                          style={{
                            flex: "0 0 auto",
                            width: 194,
                            textAlign: "left",
                            cursor: "pointer",
                            borderRadius: 10,
                            padding: 10,
                            color: "#fff",
                            background: active ? `${style.color}22` : "rgba(255,255,255,0.06)",
                            border,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {rec.name}
                            </span>
                            {active && <span style={{ color: style.color, fontSize: 13 }}>✓</span>}
                          </div>
                          <div style={{ fontSize: 11, opacity: 0.75, marginTop: 3, display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {rec.rating != null && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                                <Star size={10} fill="currentColor" /> {rec.rating}
                              </span>
                            )}
                            <span>cách điểm đi ~{Math.round(rec.progress_km ?? 0)} km</span>
                            <span style={{ color: style.color }}>+{rec.detour_min}′ đi vòng</span>
                          </div>
                          {suggested && !active && (
                            <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: style.color }}>
                              ≈ quanh mốc {Math.round(target ?? 0)} km
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer — regenerate */}
      {!collapsed && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {addedMin != null && addedKm != null ? (
            <span style={{ fontSize: 12, opacity: 0.85 }}>
              Lộ trình mới: thêm ~{addedMin} phút · {addedKm.toFixed(1)} km
            </span>
          ) : (
            <span style={{ fontSize: 12, opacity: 0.6 }}>
              Chọn điểm dừng rồi tạo lại lộ trình
            </span>
          )}
          <button
            type="button"
            onClick={onRegenerate}
            disabled={selectedCount === 0 || regenerating}
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: selectedCount === 0 || regenerating ? "not-allowed" : "pointer",
              opacity: selectedCount === 0 || regenerating ? 0.5 : 1,
              color: "#fff",
              background: "linear-gradient(135deg, #0EA5E9, #16A34A)",
            }}
          >
            <RotateCcw size={15} />
            Tạo lại lộ trình{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </button>
        </div>
      )}
    </div>
  );
}

interface BucketFilterProps {
  needKey: string;
  color: string;
  options: { label: string; value: string }[];
  selected: string[];
  onToggle: (needKey: string, value: string) => void;
  onAdd: (needKey: string, value: string) => void;
}

/** Inline attribute filter for one place bucket, with its own free-text input. */
function BucketFilter({ needKey, color, options, selected, onToggle, onAdd }: BucketFilterProps) {
  const [input, setInput] = useState("");
  const submit = () => {
    onAdd(needKey, input);
    setInput("");
  };
  const optionValues = new Set(options.map((o) => o.value));
  const customs = selected.filter((v) => !optionValues.has(v));

  return (
    <div style={{ margin: "8px 2px 2px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: 11, opacity: 0.55 }}>Lọc:</span>
        {options.map((o) => {
          const on = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onToggle(needKey, o.value)}
              style={{
                fontSize: 11,
                padding: "3px 9px",
                borderRadius: 20,
                cursor: "pointer",
                color: on ? "#0b0b0c" : "#fff",
                background: on ? color : "rgba(255,255,255,0.08)",
                border: on ? `1px solid ${color}` : "1px solid rgba(255,255,255,0.15)",
                fontWeight: on ? 600 : 400,
              }}
            >
              {on ? "✓ " : ""}
              {o.label}
            </button>
          );
        })}
        {customs.map((v) => (
          <span
            key={v}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              padding: "3px 8px",
              borderRadius: 20,
              color: "#0b0b0c",
              background: color,
            }}
          >
            {v}
            <X size={11} style={{ cursor: "pointer" }} onClick={() => onToggle(needKey, v)} />
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="+ tiêu chí…"
          style={{
            width: 110,
            padding: "4px 8px",
            fontSize: 11,
            borderRadius: 8,
            outline: "none",
            color: "#fff",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        />
      </div>
    </div>
  );
}
