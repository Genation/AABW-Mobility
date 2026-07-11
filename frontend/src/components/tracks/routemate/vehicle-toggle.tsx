"use client";

import { BatteryCharging, Fuel } from "lucide-react";
import type { VehicleType } from "@/lib/api";

interface Props {
  value: VehicleType;
  onChange: (v: VehicleType) => void;
}

const OPTIONS: { key: VehicleType; label: string; icon: typeof Fuel }[] = [
  { key: "petrol", label: "Xe xăng", icon: Fuel },
  { key: "ev", label: "Xe điện", icon: BatteryCharging },
];

/** EV vs petrol selector — drives which fuel need RouteMate recommends. */
export function VehicleToggle({ value, onChange }: Props) {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 4,
        padding: 4,
        borderRadius: 12,
        background: "rgba(127,127,127,0.08)",
        border: "1px solid rgba(127,127,127,0.25)",
      }}
      role="radiogroup"
      aria-label="Loại xe"
    >
      {OPTIONS.map(({ key, label, icon: Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 9,
              fontSize: 14,
              cursor: "pointer",
              border: "none",
              color: active ? "#fff" : "inherit",
              background: active
                ? (key === "ev" ? "#22C55E" : "#F59E0B")
                : "transparent",
              fontWeight: active ? 600 : 400,
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
