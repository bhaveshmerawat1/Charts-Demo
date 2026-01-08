export default function RangeSelector({ value, onChange }: any) {
  const ranges = [
    { label: "1D", value: "5min" },
    { label: "1W", value: "30min" },
    { label: "1M", value: "1day" },
    { label: "1Y", value: "1week" }
  ];

  return (
    <div className="flex gap-2">
      {ranges.map(r => (
        <button
          key={r.label}
          className={`px-3 py-1 rounded ${value === r.value ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          onClick={() => onChange(r.value)}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
