export default function StockHeader({ symbol, quote }: any) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-semibold">{symbol}</h1>
      <div className="flex items-center gap-4">
        <span className="text-3xl font-bold">₹{quote.price}</span>
        <span
          className={`font-medium ${quote.change >= 0 ? "text-green-600" : "text-red-600"
            }`}
        >
          {quote.change} ({quote.percent}%)
        </span>
      </div>
    </div>
  );
}
