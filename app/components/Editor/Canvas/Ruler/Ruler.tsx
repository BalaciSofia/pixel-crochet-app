import React from 'react';
import styles from './Ruler.module.css';

const MIN_LABEL_GAP = 22;
const STEPS = [5, 10, 20, 25, 50, 100];

interface Props {
  labels: number[];
  cellSize: number;
  orientation: 'horizontal' | 'vertical';
}

function labelStep(cellSize: number): number {
  return STEPS.find(step => step * cellSize >= MIN_LABEL_GAP) ?? STEPS[STEPS.length - 1];
}

const Ruler = React.memo(function Ruler({ labels, cellSize, orientation }: Props) {
  const step = labelStep(cellSize);
  const horizontal = orientation === 'horizontal';

  return (
    <div
      aria-hidden="true"
      className={`${styles.ruler} ${horizontal ? styles.horizontal : styles.vertical}`}
      style={horizontal ? { width: labels.length * cellSize } : { height: labels.length * cellSize }}
    >
      {labels.map((label, index) =>
        label === 1 || label % step === 0 ? (
          <span
            key={label}
            className={styles.label}
            style={
              horizontal
                ? { left: index * cellSize + 1 + cellSize / 2 }
                : { top: index * cellSize + 1 + cellSize / 2 }
            }
          >
            {label}
          </span>
        ) : null
      )}
    </div>
  );
});

export default Ruler;
