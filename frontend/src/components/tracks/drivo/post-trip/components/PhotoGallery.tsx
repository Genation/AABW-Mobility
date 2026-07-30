import styles from "../post-trip.module.css";

interface Props {
  photos: string[];
  onPhotoClick: (index: number) => void;
}

export function PhotoGallery({ photos, onPhotoClick }: Props) {
  return (
    <div className={styles.photoGrid}>
      {photos.map((photo, index) => (
        <img
          key={index}
          src={photo}
          alt={`Ảnh ${index + 1}`}
          className={styles.photoItem}
          loading="lazy"
          onClick={() => onPhotoClick(index)}
        />
      ))}
    </div>
  );
}
