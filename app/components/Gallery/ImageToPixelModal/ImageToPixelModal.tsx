'use client';

import React, { useState, useCallback, useRef } from 'react';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import styles from './ImageToPixelModal.module.css';
import Slider from '../../shared/Slider';
import useProjectStore from '../../../store/useProjectStore';
import type { Project } from '../../../types';
import {
  loadImageFromFile,
  getImageData,
  pixelizeImage,
} from '../../../utils/imageToPixel';

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

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { component: 'form', onSubmit: handleSubmit } }}
    >
      <DialogTitle>Import Image as Pattern</DialogTitle>

      <DialogContent className={styles.content}>
        <div className={styles.uploadArea}>
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Preview" className={styles.preview} />
          ) : (
            <ButtonBase
              className={styles.dropzone}
              onClick={() => fileInputRef.current?.click()}
            >
              <PhotoCameraIcon fontSize="large" color="primary" />
              <Typography variant="body2" color="text.secondary">
                Click to select an image
              </Typography>
            </ButtonBase>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className={styles.fileInput}
          />
          {previewUrl && (
            <Button
              color="inherit"
              fullWidth
              size="small"
              className={styles.changeButton}
              onClick={() => fileInputRef.current?.click()}
            >
              Change Image
            </Button>
          )}
        </div>

        <TextField
          label="Pattern Name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter pattern name"
          fullWidth
        />

        <div className={styles.row}>
          <Slider
            label="Width"
            value={width}
            min={8}
            max={200}
            onChange={handleWidthChange}
          />
          <Slider
            label="Height"
            value={height}
            min={8}
            max={200}
            onChange={handleHeightChange}
          />
        </div>

        <Typography variant="body2" color="text.secondary" className={styles.info}>
          {width} × {height} = {width * height} stitches
        </Typography>

        <div>
          <Slider
            label="Max Colors"
            value={maxColors}
            min={2}
            max={64}
            onChange={handleMaxColorsChange}
          />
          <Typography variant="caption" color="text.disabled">
            Reduce colors by combining similar shades
          </Typography>
        </div>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" type="submit" disabled={!imageFile}>
          Create Pattern
        </Button>
      </DialogActions>
    </Dialog>
  );
}
