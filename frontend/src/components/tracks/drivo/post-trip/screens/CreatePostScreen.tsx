"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { PostTripPost } from "../types";
import { mockUsers } from "../mock-data";
import styles from "../post-trip.module.css";

const COVER_OPTIONS = [
  "/trip-image-1.jpg",
  "/trip-image-2.jpg",
  "/trip-image-3.jpg",
  "/trip-image-4.jpg",
  "/trip-image-5.jpeg",
  "/trip-image-6.webp",
  "/trip-image-7.webp",
  "/trip-image-8.png",
];

const MOOD_OPTIONS = [
  "Phấn khích",
  "Thư giãn",
  "Mệt mà vui",
  "Khó quên",
  "Bình yên",
];

interface Props {
  onSubmit: (post: PostTripPost) => void;
  onCancel: () => void;
  prefill?: {
    title?: string;
  };
}

export function CreatePostScreen({ onSubmit, onCancel, prefill }: Props) {
  const [title, setTitle] = useState(prefill?.title ?? "");
  const [description, setDescription] = useState("");
  const [startName, setStartName] = useState("");
  const [endName, setEndName] = useState("");
  const [totalKm, setTotalKm] = useState("");
  const [movingTime, setMovingTime] = useState("");
  const [avgSpeed, setAvgSpeed] = useState("");
  const [fuelUsed, setFuelUsed] = useState("");
  const [tags, setTags] = useState("");
  const [mood, setMood] = useState(MOOD_OPTIONS[0]);
  const [coverPhoto, setCoverPhoto] = useState(COVER_OPTIONS[0]);

  const handleSubmit = () => {
    const now = new Date().toISOString();
    const post: PostTripPost = {
      id: `post-${Date.now().toString(36)}`,
      author: { ...mockUsers["nguyen-minh-tuan"], id: "current-user" },
      title: title || "Chuyến đi mới",
      description: description || "Chưa có mô tả",
      route: {
        start: { name: startName || "Điểm đi", lat: 10.8231, lng: 106.6297 },
        end: { name: endName || "Điểm đến", lat: 21.0278, lng: 105.8342 },
        waypoints: [],
      },
      stats: {
        totalKm: Number(totalKm) || 0,
        movingTime: movingTime || "0h",
        avgSpeed: Number(avgSpeed) || 0,
        fuelUsed: Number(fuelUsed) || 0,
        totalStops: 0,
      },
      stops: [],
      photos: [coverPhoto],
      coverPhoto,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => (t.startsWith("#") ? t : `#${t}`)),
      mood,
      socialCounts: { likes: 0, comments: 0, shares: 0 },
      publishedAt: now,
      tripDate: new Date().toLocaleDateString("vi-VN"),
    };

    onSubmit(post);
  };

  return (
    <div className={styles.createScreen}>
      <div className={styles.createHeader}>
        <h2 className={styles.createTitle}>Tạo bài đăng mới</h2>
        <button
          className={styles.cancelButton}
          onClick={onCancel}
          type="button"
        >
          <X size={24} />
        </button>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Tiêu đề</label>
        <input
          className={styles.formInput}
          placeholder="Đặt tên cho chuyến đi..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Mô tả</label>
        <textarea
          className={styles.formTextarea}
          placeholder="Chia sẻ cảm nhận của bạn về chuyến đi..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Điểm đi</label>
          <input
            className={styles.formInput}
            placeholder="TP. Hồ Chí Minh"
            value={startName}
            onChange={(e) => setStartName(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Điểm đến</label>
          <input
            className={styles.formInput}
            placeholder="Đà Lạt"
            value={endName}
            onChange={(e) => setEndName(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Tổng km</label>
          <input
            className={styles.formInput}
            type="number"
            placeholder="320"
            value={totalKm}
            onChange={(e) => setTotalKm(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Thời gian</label>
          <input
            className={styles.formInput}
            placeholder="6h 30p"
            value={movingTime}
            onChange={(e) => setMovingTime(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Tốc độ TB (km/h)</label>
          <input
            className={styles.formInput}
            type="number"
            placeholder="49"
            value={avgSpeed}
            onChange={(e) => setAvgSpeed(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Nhiên liệu (L)</label>
          <input
            className={styles.formInput}
            type="number"
            placeholder="28"
            value={fuelUsed}
            onChange={(e) => setFuelUsed(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Tags (phân cách bằng dấu phẩy)</label>
        <input
          className={styles.formInput}
          placeholder="#phượt, #đà_lạt, #weekend"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Tâm trạng</label>
        <select
          className={styles.formSelect}
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        >
          {MOOD_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Ảnh bìa</label>
        <div className={styles.photoPicker}>
          {COVER_OPTIONS.map((photo) => (
            <div
              key={photo}
              className={[
                styles.photoOption,
                coverPhoto === photo ? styles.photoOptionSelected : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setCoverPhoto(photo)}
            >
              <img src={photo} alt="" />
            </div>
          ))}
        </div>
      </div>

      <button
        className={styles.submitButton}
        onClick={handleSubmit}
        type="button"
      >
        Đăng bài
      </button>
    </div>
  );
}
