'use client';

import React, { useState, useCallback, useId, useRef } from 'react';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import styles from './ImageToPixelModal.module.css';
import AppDialog from '../../shared/AppDialog';
import Field, { FieldInput } from '../../shared/Field';
import Icon from '../../shared/Icon';
import Slider from '../../shared/Slider';
import useProjectStore from '../../../store/useProjectStore';
import type { Project } from '../../../types';
import {
  loadImageFromFile,
  getImageData,
  pixelizeImage,
} from '../../../utils/imageToPixel';
import YarnStashDialog from '../YarnStashDialog';
import useYarnStore from '../../../store/useYarnStore';

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
  const [useYarnPalette, setUseYarnPalette] = useState(false);
  const [stashOpen, setStashOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const yarns = useYarnStore(state => state.yarns);
  const switchLabelId = useId();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectFile = useCallback(
    async (file: File) => {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      const img = await loadImageFromFile(file);
      const ratio = img.width / img.height;
      setAspectRatio(ratio);

      const newHeight = Math.round(width / ratio);
      setHeight(Math.min(200, Math.max(1, newHeight)));
    },
    [width]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void selectFile(file);
    },
    [selectFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
      if (file) void selectFile(file);
    },
    [selectFile]
  );

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

    const { grid, toBuy } = pixelizeImage(imageData, {
      targetWidth: width,
      targetHeight: height,
      maxColors,
      yarnPalette: useYarnPalette && yarns.length > 0 ? yarns.map(yarn => yarn.color) : undefined,
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
      toBuy,
    };

    saveProject(updatedProject);
    onCreated(updatedProject);
  }, [imageFile, width, height, maxColors, useYarnPalette, yarns, name, createProject, saveProject, onCreated]);

  return (
    <>
      <AppDialog
        onClose={onClose}
        title="Image to pattern"
        width={440}
        onSubmit={handleSubmit}
        actions={
          <>
            <Button variant="outlined" color="inherit" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" disabled={!imageFile}>
              Create pattern
            </Button>
          </>
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className={styles.fileInput}
          tabIndex={-1}
          aria-hidden="true"
        />

        {previewUrl ? (
          <div
            className={`${styles.previewBox} ${dragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Selected image" className={styles.preview} />
            <Button size="small" onClick={() => fileInputRef.current?.click()}>
              Change image
            </Button>
          </div>
        ) : (
          <button
            type="button"
            className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Icon name="image" size={30} strokeWidth={1.8} color="var(--rose)" />
            <span className={styles.dropTitle}>Drop an image or click to browse</span>
            <span className={styles.dropHint}>PNG, JPG, WEBP or AVIF</span>
          </button>
        )}

        <Field label="Pattern name">
          <FieldInput
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter pattern name"
          />
        </Field>

        <div className={styles.row}>
          <Slider label="Width" value={width} min={8} max={200} onChange={handleWidthChange} />
          <Slider label="Height" value={height} min={8} max={200} onChange={handleHeightChange} />
        </div>

        <Slider
          label="Max colors"
          value={maxColors}
          min={2}
          max={64}
          onChange={handleMaxColorsChange}
          help="Similar shades are merged into one color."
        />

        <div className={styles.matchBox}>
          <div className={styles.matchMain}>
            <Switch
              checked={useYarnPalette && yarns.length > 0}
              disabled={yarns.length === 0}
              onChange={e => setUseYarnPalette(e.target.checked)}
              slotProps={{ input: { 'aria-labelledby': switchLabelId } }}
            />
            <span id={switchLabelId} className={styles.matchText}>
              <span className={styles.matchTitle}>Match to my yarn</span>
              <span className={styles.matchHint}>Missing colors get a cart badge</span>
            </span>
          </div>
          <Button size="small" onClick={() => setStashOpen(true)}>
            {yarns.length === 0 ? 'Add yarn' : `Manage (${yarns.length})`}
          </Button>
        </div>

        <div className={styles.result}>
          <span>Result</span>
          <span className={styles.resultValue}>
            {width} × {height} = {(width * height).toLocaleString('en-US')} stitches
          </span>
        </div>
      </AppDialog>

      {stashOpen && <YarnStashDialog onClose={() => setStashOpen(false)} />}
    </>
  );
}
