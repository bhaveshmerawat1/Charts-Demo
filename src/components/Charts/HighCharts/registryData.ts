import { ChartType } from "./types";

export const registryData = {
  usersByRole: {
    type: "column" as ChartType,
    title: "Users by Role",
    yAxisTitle: "Users"
  },
  usersByRegion: {
    type: "bar" as ChartType,
    title: "Users by Region",
    yAxisTitle: "Users"
  },
  activeInactive: {
    type: "pie" as ChartType,
    title: "Active vs Inactive Users",
    yAxisTitle: "Users"
  }
};


export const seriesData = [
  {
    type: registryData.usersByRole.type,
    name: "Users",
    data: [
      { name: "Admin", y: 150, drilldown: "Admin-details" },
      { name: "Manager", y: 300, drilldown: "Manager-details" },
      { name: "Customer", y: 600, drilldown: "Customer-details" }
    ]
  }
]


export const drilldownSeriesData =
  [
    {
      id: "Admin-details",
      type: registryData.usersByRole.type,
      name: "Admin Users",
      data: [
        ["Active", 120],
        ["Inactive", 30]
      ]
    },
    {
      id: "Manager-details",
      type: registryData.usersByRole.type,
      name: "Manager Users",
      data: [
        ["Active", 250],
        ["Inactive", 50]
      ]
    },
    {
      id: "Customer-details",
      type: registryData.usersByRole.type,
      name: "Customer Users",
      data: [
        ["Active", 500],
        ["Inactive", 100]
      ]
    }
  ]
