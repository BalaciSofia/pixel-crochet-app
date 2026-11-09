'use client';

import React from 'react';
import styles from './PatternToolbar.module.css';
import Icon from '../../shared/Icon';
import Segmented, { type SegmentedOption } from '../../shared/Segmented';
import type { ProjectStatus } from '../../../utils/projectStatus';

export type StatusFilter = 'all' | ProjectStatus;
export type SortOrder = 'recent' | 'name' | 'progress';

const FILTERS: SegmentedOption<StatusFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'progress', label: 'In progress' },
  { value: 'new', label: 'Not started' },
  { value: 'finished', label: 'Finished' },
];

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  filter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
  sort: SortOrder;
  onSortChange: (sort: SortOrder) => void;
}

export default function PatternToolbar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
}: Props) {
  return (
    <div className={styles.toolbar}>
      <label className={styles.search}>
        <Icon name="search" color="var(--muted)" />
        <span className={styles.visuallyHidden}>Search patterns</span>
        <input
          type="search"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Search patterns"
          className={styles.searchInput}
        />
      </label>

      <Segmented
        options={FILTERS}
        value={filter}
        onChange={onFilterChange}
        ariaLabel="Filter by status"
        dense
        className={styles.filter}
      />

      <label className={styles.sort}>
        Sort
        <select
          value={sort}
          onChange={e => onSortChange(e.target.value as SortOrder)}
          className={styles.select}
        >
          <option value="recent">Last edited</option>
          <option value="name">Name</option>
          <option value="progress">Progress</option>
        </select>
      </label>
    </div>
  );
}
