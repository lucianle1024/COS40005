import type { EvidenceRecord } from '../api/generated';
export function SourceLinks({
  ids,
  records,
  onInspect,
}: {
  ids: string[];
  records: EvidenceRecord[];
  onInspect: (id: string) => void;
}) {
  return (
    <div className="source-links">
      <span>Sources</span>
      {ids.length ? (
        ids.map((id) =>
          records.some((record) => record.id === id) ? (
            <button
              key={id}
              type="button"
              aria-label={`Inspect source ${id}`}
              onClick={() => onInspect(id)}
            >
              {id}
              <span aria-hidden="true"> ↗</span>
            </button>
          ) : (
            <span key={id} className="missing-source">
              {id} unavailable
            </span>
          ),
        )
      ) : (
        <span className="missing-source">No sources supplied</span>
      )}
    </div>
  );
}
