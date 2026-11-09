import React from 'react';
import styles from './SectionLabel.module.css';

interface Props {
  children: React.ReactNode;
  id?: string;
  as?: 'h2' | 'h3' | 'span';
  className?: string;
}

export default function SectionLabel({ children, id, as: Tag = 'h2', className }: Props) {
  return (
    <Tag id={id} className={`${styles.label} ${className ?? ''}`}>
      {children}
    </Tag>
  );
}
