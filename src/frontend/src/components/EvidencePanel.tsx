import { useState } from 'react';
import type { EvidenceRecord } from '../api/generated';
import { Icon } from './Icons';
import { RecordInspector } from './RecordInspector';
import { CitationButton } from './CitationButton';
interface Props {
  records: EvidenceRecord[];
  selectedEvidenceIds: string[];
  onSelectionChange: (ids: string[]) => void;
  activeId: string;
  onOpen: (id: string) => void;
  readOnly: boolean;
}
export function EvidencePanel({
  records,
  selectedEvidenceIds,
  onSelectionChange,
  activeId,
  onOpen,
  readOnly,
}: Props) {
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('all');
  const query = search.trim().toLowerCase();
  const visible = records.filter(
    (record) =>
      (kind === 'all' || record.kind === kind) &&
      [record.id, record.title, record.content, ...record.indicators]
        .join(' ')
        .toLowerCase()
        .includes(query),
  );
  visible.sort(
    (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp) || a.id.localeCompare(b.id),
  );
  const selected = records.find((record) => record.id === activeId);
  return (
    <section className="panel evidence-panel" aria-labelledby="evidence-title">
      <div className="panel-heading">
        <div>
          <span className="step-number">01</span>
          <h2 id="evidence-title">Evidence</h2>
        </div>
        <span className="panel-count">{records.length} records</span>
      </div>
      <div className="panel-body">
        <div className="evidence-tools">
          <div className="search-field">
            <Icon name="search" size={16} />
            <input
              type="search"
              aria-label="Search evidence"
              placeholder="Search records or indicators"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
            />
            {search && (
              <button
                type="button"
                className="icon-button"
                aria-label="Clear search"
                onClick={() => {
                  setSearch('');
                }}
              >
                <Icon name="close" size={15} />
              </button>
            )}
          </div>
          <div className="filter-row">
            <label className="sr-only" htmlFor="record-type">
              Record type
            </label>
            <select
              id="record-type"
              value={kind}
              onChange={(event) => {
                setKind(event.target.value);
              }}
            >
              <option value="all">All record types</option>
              {['Email', 'Network', 'Endpoint'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            {(search || kind !== 'all') && (
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setSearch('');
                  setKind('all');
                }}
              >
                Clear filters
              </button>
            )}
            <span className="muted">
              {visible.length} of {records.length}
            </span>
          </div>
        </div>
        <div id="evidence-record-list" className="records-list">
          {!records.length ? (
            <p className="empty-state">No evidence records are available for this case.</p>
          ) : !visible.length ? (
            <p className="empty-state">No records match your filters.</p>
          ) : (
            visible.map((record) => (
              <div
                key={record.id}
                className={`record-row ${activeId === record.id ? 'record-active' : ''}`}
              >
                <button
                  type="button"
                  className="record-open"
                  aria-pressed={activeId === record.id}
                  onClick={() => onOpen(record.id)}
                >
                  <span className="record-id mono">{record.id}</span>{' '}
                  <span className="record-summary">
                    <strong>{record.title}</strong>{' '}
                    <span>{`${record.kind} / ${record.timestamp.slice(11, 19)} UTC`}</span>
                  </span>
                  <Icon name="arrow" size={15} />
                </button>
                <CitationButton
                  id={record.id}
                  cited={selectedEvidenceIds.includes(record.id)}
                  disabled={readOnly}
                  onToggle={() =>
                    onSelectionChange(
                      selectedEvidenceIds.includes(record.id)
                        ? selectedEvidenceIds.filter((id) => id !== record.id)
                        : [...selectedEvidenceIds, record.id],
                    )
                  }
                />
              </div>
            ))
          )}
        </div>
        <p className="selection-hint">
          Cite adds a supporting record to Your findings. Opening a record does not cite or verify
          it.
        </p>
        {selected && visible.length > 0 && !visible.some((record) => record.id === selected.id) && (
          <p className="filter-notice">
            Inspecting {selected.id}, which is outside the current filters.
          </p>
        )}
        <RecordInspector
          record={selected}
          cited={!!selected && selectedEvidenceIds.includes(selected.id)}
          readOnly={readOnly}
          onToggleCitation={() => {
            if (selected)
              onSelectionChange(
                selectedEvidenceIds.includes(selected.id)
                  ? selectedEvidenceIds.filter((id) => id !== selected.id)
                  : [...selectedEvidenceIds, selected.id],
              );
          }}
        />
      </div>
    </section>
  );
}
