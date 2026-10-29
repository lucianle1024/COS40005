import { useEffect, useRef, useState } from 'react';
import type { EvidenceRecord } from '../api/generated';
import { Icon } from './Icons';
import { Modal } from './Modal';
import { CitationButton } from './CitationButton';
export function RecordInspector({
  record,
  cited,
  readOnly,
  onToggleCitation,
}: {
  record: EvidenceRecord | undefined;
  cited: boolean;
  readOnly: boolean;
  onToggleCitation: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const raw = useRef<HTMLPreElement>(null);
  useEffect(() => {
    if (raw.current) raw.current.scrollTop = 0;
  }, [record?.id]);
  if (!record)
    return (
      <div className="record-placeholder">Choose a record to inspect its original content.</div>
    );
  return (
    <section
      className="record-inspector"
      aria-label="Original record"
      tabIndex={-1}
      id="record-inspector"
    >
      <div className="inspector-header">
        <div className="inspector-identity">
          <span className="record-key mono">{record.id}</span>
          <h3>{record.title}</h3>
          <span className="read-only-label">Read only</span>
        </div>
        <div className="inspector-actions">
          <CitationButton
            id={record.id}
            cited={cited}
            disabled={readOnly}
            onToggle={onToggleCitation}
          />
          <button
            type="button"
            className="expand-record-button"
            aria-label={`Expand record ${record.id}`}
            onClick={() => setExpanded(true)}
          >
            <Icon name="expand" size={15} />
            Expand record
          </button>
        </div>
      </div>
      <div className="source-line">
        <span>{record.source}</span>
        <span className="mono">{record.timestamp.slice(11, 19)} UTC</span>
      </div>
      <pre
        ref={raw}
        className="record-content"
        tabIndex={0}
        role="region"
        aria-label={`Raw text for ${record.id}`}
      >
        {record.content.split('\n').map((line, index) => (
          <span className="log-line" key={index}>
            <span className="line-number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="line-text">{line || ' '}</span>
          </span>
        ))}
      </pre>
      <div className="indicator-list">
        <span className="indicator-label">Indicators</span>
        {record.indicators.length ? (
          record.indicators.map((indicator) => <code key={indicator}>{indicator}</code>)
        ) : (
          <span>None supplied</span>
        )}
      </div>
      <Modal
        open={expanded}
        onOpenChange={setExpanded}
        title={`${record.id}: ${record.title}`}
        description="Original synthetic record. Read only; indicators are inert text."
        wide
      >
        <pre className="record-content expanded-record" tabIndex={0}>
          {record.content}
        </pre>
      </Modal>
    </section>
  );
}
