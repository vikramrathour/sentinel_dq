import React from 'react';

// ---------------------------------------------------------------------------
// Primitive — reusable pulse bar
// ---------------------------------------------------------------------------

function PulseBar({ className = '' }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

// ---------------------------------------------------------------------------
// MetricCardSkeleton
// Mimics: [icon square] + [large value bar] + [label bar]
// ---------------------------------------------------------------------------

export function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      {/* Icon placeholder */}
      <PulseBar className="w-11 h-11 rounded-lg shrink-0" />

      <div className="flex-1 space-y-2">
        {/* Value */}
        <PulseBar className="h-6 w-24" />
        {/* Label */}
        <PulseBar className="h-3.5 w-32" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TableRowSkeleton
// Mimics a 5-column table row with varying cell widths
// ---------------------------------------------------------------------------

const CELL_WIDTHS = ['w-28', 'w-40', 'w-20', 'w-32', 'w-16'];

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100">
      {CELL_WIDTHS.map((w, i) => (
        <td key={i} className="px-4 py-3">
          <PulseBar className={`h-3.5 ${w}`} />
        </td>
      ))}
    </tr>
  );
}

// ---------------------------------------------------------------------------
// CardGridSkeleton
// Renders `count` generic card skeletons: title bar + two content bars
// ---------------------------------------------------------------------------

export function CardGridSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3"
        >
          {/* Card title */}
          <PulseBar className="h-4 w-3/5" />
          {/* Content line 1 */}
          <PulseBar className="h-3 w-full" />
          {/* Content line 2 — slightly shorter */}
          <PulseBar className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TableSkeleton
// Full table skeleton: header row + N body rows via TableRowSkeleton
// ---------------------------------------------------------------------------

const HEADER_WIDTHS = ['w-24', 'w-32', 'w-16', 'w-28', 'w-12'];

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {HEADER_WIDTHS.map((w, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <PulseBar className={`h-3 ${w}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default export — named collection for convenient destructuring
// ---------------------------------------------------------------------------

const SkeletonLoader = {
  MetricCardSkeleton,
  TableRowSkeleton,
  CardGridSkeleton,
  TableSkeleton,
};

export default SkeletonLoader;
