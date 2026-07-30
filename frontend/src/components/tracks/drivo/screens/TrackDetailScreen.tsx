"use client";

import { useState } from "react";
import { DrivoTrack, DrivoDestination } from "../types";
import { SmartLocationInput } from "../components/SmartLocationInput";
import { ArrowLeft, Check, MapPin, X } from "lucide-react";
import styles from "../drivo.module.css";

interface Props {
  track: DrivoTrack;
  onSave: (track: DrivoTrack) => void;
  onCancel: () => void;
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
}

export function TrackDetailScreen({ track: initialTrack, onSave, onCancel, onSearchFocus, onSearchBlur }: Props) {
  const [track, setTrack] = useState<DrivoTrack>(initialTrack);
  const [addingDest, setAddingDest] = useState(false);

  const handleAddDest = (dest: DrivoDestination) => {
    setTrack(prev => ({
      ...prev,
      destinations: [...prev.destinations, dest]
    }));
    setAddingDest(false);
    onSearchBlur?.();
  };

  const handleRemoveDest = (id: string) => {
    setTrack(prev => ({
      ...prev,
      destinations: prev.destinations.filter(d => d.id !== id)
    }));
  };

  const handleStartSearch = () => {
    setAddingDest(true);
    onSearchFocus?.();
  };

  const handleCancelSearch = () => {
    setAddingDest(false);
    onSearchBlur?.();
  };

  return (
    <div className={styles.bottomSheetTall}>
      <div className={styles.detailHeader}>
        <button onClick={onCancel} className={styles.detailHeaderBtn}>
          <ArrowLeft size={24} />
        </button>
        <h3 className={styles.detailHeaderTitle}>Chi tiết Track</h3>
        <button onClick={() => onSave(track)} className={styles.detailHeaderSave}>
          <Check size={24} />
        </button>
      </div>

      <div className={styles.detailBody}>
        <div style={{ marginBottom: 12 }}>
          <label className={styles.fieldLabel}>Tên chặng</label>
          <input
            value={track.name}
            onChange={(e) => setTrack(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ví dụ: Chặng 1 - Lên đèo"
            className={styles.trackNameInput}
          />
        </div>

        <div className={styles.formFields} style={{ marginBottom: 16, gap: 10 }}>
          <div>
            <label className={styles.fieldLabel} style={{ marginBottom: 4 }}>
              <MapPin size={14} color="var(--color-primary)" /> Điểm xuất phát
            </label>
            {track.startLocation ? (
              <div className={styles.selectedLocation}>
                <span className={styles.selectedLocationName}>{track.startLocation.name}</span>
                <button onClick={() => setTrack(prev => ({ ...prev, startLocation: null }))} className={styles.changeBtn}>Đổi</button>
              </div>
            ) : (
              <SmartLocationInput
                placeholder="Nhập điểm bắt đầu chặng..."
                onSelect={(dest) => {
                  setTrack(prev => ({ ...prev, startLocation: dest }));
                  onSearchBlur?.();
                }}
                onFocus={onSearchFocus}
              />
            )}
          </div>

          <div>
            <label className={styles.fieldLabel} style={{ marginBottom: 4 }}>
              <MapPin size={14} color="var(--color-error)" /> Điểm kết thúc
            </label>
            {track.endLocation ? (
              <div className={styles.selectedLocation}>
                <span className={styles.selectedLocationName}>{track.endLocation.name}</span>
                <button onClick={() => setTrack(prev => ({ ...prev, endLocation: null }))} className={styles.changeBtn}>Đổi</button>
              </div>
            ) : (
              <SmartLocationInput
                placeholder="Nhập điểm kết thúc chặng..."
                onSelect={(dest) => {
                  setTrack(prev => ({ ...prev, endLocation: dest }));
                  onSearchBlur?.();
                }}
                onFocus={onSearchFocus}
              />
            )}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 600 }}>Điểm đến trong chặng</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {track.destinations.map((dest, i) => (
              <div key={dest.id} className={styles.destItem}>
                <div className={styles.destIndex}>{i + 1}</div>
                <div className={styles.destInfo}>
                  <div className={styles.destName}>{dest.name}</div>
                  <div className={styles.destCategory}>{dest.category}</div>
                </div>
                <button onClick={() => handleRemoveDest(dest.id)} className={styles.destRemoveBtn}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {addingDest ? (
          <div className={styles.addDestSearchBox}>
            <div className={styles.addDestHeader}>
              <span className={styles.addDestTitle}>Tìm điểm dừng</span>
              <button onClick={handleCancelSearch} className={styles.addDestCancel}>Hủy</button>
            </div>
            <SmartLocationInput
              placeholder="Nhập tên quán, điểm du lịch..."
              onSelect={handleAddDest}
              showCategoryChips={true}
            />
          </div>
        ) : (
          <button
            onClick={handleStartSearch}
            className={styles.addDestBtn}
            style={{ marginTop: track.destinations.length > 0 ? 8 : 0 }}
          >
            <MapPin size={16} /> Thêm điểm dừng
          </button>
        )}
      </div>
    </div>
  );
}
