'use client';

import React, { useState, useCallback, useRef } from 'react';
import styles from './ImageToPixelModal.module.css';
import Button from '../shared/Button';
import Slider from '../shared/Slider';
import useProjectStore from '../../store/useProjectStore';
import type { Project } from '../../types';
import {
  loadImageFromFile,
  getImageData,
  pixelizeImage,
} from '../../utils/imageToPixel';

interface Props {
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export default function ImageToPixelModal({ onClose, onCreated }: Props) {
  const createProject = useProjectStore(state => state.createProject);
  const saveProject = useProjectStore(state => state.saveProject);

  const [name, setName] = useState('Imported Pattern');
  const [width, setWidth] = useState(32);
  const [height, setHeight] = useState(32);
  const [maxColors, setMaxColors] = useState(16);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    const img = await loadImageFromFile(file);
    const ratio = img.width / img.height;
    setAspectRatio(ratio);

    const newHeight = Math.round(width / ratio);
    setHeight(Math.min(200, Math.max(1, newHeight)));
  }, [width]);

  const handleWidthChange = useCallback((newWidth: number) => {
    setWidth(newWidth);
    const newHeight = Math.round(newWidth / aspectRatio);
    setHeight(Math.min(200, Math.max(1, newHeight)));
  }, [aspectRatio]);

  const handleHeightChange = useCallback((newHeight: number) => {
    setHeight(newHeight);
  }, []);

  const handleMaxColorsChange = useCallback((value: number) => {
    setMaxColors(value);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) return;

    const img = await loadImageFromFile(imageFile);
    const imageData = getImageData(img);

    const grid = pixelizeImage(imageData, {
      targetWidth: width,
      targetHeight: height,
      maxColors: maxColors,
      palette: undefined,
    });

    const uniqueColors = new Set<string>();
    for (const row of grid) {
      for (const cell of row) {
        if (cell) {
          uniqueColors.add(cell.toUpperCase());
        }
      }
    }

    const project = createProject(name.trim() || 'Imported Pattern', width, height);

    const updatedProject: Project = {
      ...project,
      grid,
      palette: Array.from(uniqueColors),
    };

    saveProject(updatedProject);
    onCreated(updatedProject);
  }, [imageFile, width, height, maxColors, name, createProject, saveProject, onCreated]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Import Image as Pattern</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.uploadArea}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className={styles.preview} />
            ) : (
              <div
                className={styles.dropzone}
                onClick={() => fileInputRef.current?.click()}
              >
                <span className={styles.uploadIcon}>📷</span>
                <span>Click to select an image</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className={styles.fileInput}
            />
            {previewUrl && (
              <button
                type="button"
                className={styles.changeButton}
                onClick={() => fileInputRef.current?.click()}
              >
                Change Image
              </button>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Pattern Name</label>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter pattern name"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <Slider
                label="Width"
                value={width}
                min={8}
                max={200}
                onChange={handleWidthChange}
              />
            </div>
            <div className={styles.field}>
              <Slider
                label="Height"
                value={height}
                min={8}
                max={200}
                onChange={handleHeightChange}
              />
            </div>
          </div>

          <div className={styles.info}>
            {width} × {height} = {width * height} stitches
          </div>

          <div className={styles.field}>
            <Slider
              label="Max Colors"
              value={maxColors}
              min={2}
              max={64}
              onChange={handleMaxColorsChange}
            />
            <p className={styles.hint}>
              Reduce colors by combining similar shades
            </p>
          </div>

          <div className={styles.actions}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!imageFile}>
              Create Pattern
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
