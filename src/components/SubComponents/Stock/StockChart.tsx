// "use client";

// import Highcharts from "highcharts/highstock";
// import HighchartsReact from "highcharts-react-official";
// import { useEffect, useState } from "react";

// interface Props {
//   symbol: string;
// }

// export default function StockChart({ symbol }: Props) {
//   const [data, setData] = useState<any[]>([]);

//   useEffect(() => {
//     fetch(`/api/stocks/history?symbol=${symbol}&interval=1day`)
//       .then(res => res.json())
//       .then(setData);
//   }, [symbol]);

//   const options: Highcharts.Options = {
//     rangeSelector: {
//       selected: 1
//     },

//     title: {
//       text: `${symbol} Price Chart`
//     },

//     series: [
//       {
//         type: "line",
//         name: symbol,
//         data,
//         tooltip: {
//           valueDecimals: 2
//         }
//       }
//     ]
//   };

//   return (
//     <HighchartsReact
//       highcharts={Highcharts}
//       constructorType="stockChart"
//       options={options}
//     />
//   );
// }


"use client";

import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";

interface Props {
  series: Highcharts.SeriesOptionsType[];
}

export default function StockChart({ series }: Props) {
  const options: Highcharts.Options = {
    rangeSelector: { enabled: false },
    navigator: { enabled: true },
    scrollbar: { enabled: true },

    title: { text: "" },

    yAxis: {
      labels: { align: "right" },
      title: { text: "Price" }
    },

    series
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      constructorType="stockChart"
      options={options}
    />
  );
}
