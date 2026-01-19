"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import GlobalHighchart from "@/components/Charts/HighCharts/HighchartWrapper";
import {
  summary,
  studentsByClass,
  streamPieSeries,
  streamDrilldown,
  getAttendanceByDay
} from "./Data";
import { classOptions, genderOptions, monthOptions } from "./Filter";
import images from "@/assets";
import SelectDropdown from "@/components/SelectDropdown/SelectDropdown";
import Button from "@/components/Button/Button";
import userData from "../../../utils/userData.json"
type FilterType = "role" | "region";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState("Jan");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [filterByRole, setByRoleFilter] = useState<FilterType>("role");

  const chartOptions = useMemo(() => {
    const activeColor = filterByRole === "role" ? "#dc2626" : "#2563eb";
    if (filterByRole === "role") {
      return {
        title: { text: "Users by Role" },
        xAxis: {
          categories: userData.usersByRole.map(item => item.role),
          title: { text: "Role" }
        },
        yAxis: {
          title: { text: "Users Count" }
        },
        series: [
          {
            name: "Users",
            data: userData.usersByRole.map(item => item.count),
            color: activeColor
          }
        ],
        optionsOverride: {
          xAxis: {
            categories: userData.usersByRole.map(item => item.role),
            labels: {
              style: {
                color: activeColor,
                fontWeight: 'bold',
                fontSize: '16px'
              },

            }
          },
          plotOptions: {
            column: {
              pointPadding: 0.3,
              borderWidth: 0,
              colorByPoint: false
            }
          },
        }
      };
    }

    return {
      title: { text: "Users by Region" },
      xAxis: {
        categories: userData.usersByRegion.map(item => item.region),
        title: { text: "Region" }
      },
      yAxis: {
        title: { text: "Users Count" }
      },
      series: [
        {
          name: "Users",
          data: userData.usersByRegion.map(item => item.users),
          color: activeColor
        }
      ],
      optionsOverride: {
        xAxis: {
          categories: userData.usersByRegion.map(item => item.region),
          labels: {
            style: {
              color: activeColor,
              fontWeight: 'bold',
              fontSize: '16px'
            }
          }
        },
        plotOptions: {
          column: {
            colorByPoint: true
          }
        }
      }
    };
  }, [filterByRole]);

  const dayWise = getAttendanceByDay(selectedMonth);

  const filteredStudentsByClass =
    selectedClass === "All"
      ? studentsByClass
      : studentsByClass.filter(c => c.name.endsWith(selectedClass));

  const summaryByClass = filteredStudentsByClass.reduce(
    (acc, cur) => {
      acc.total += cur.students;
      acc.boys += cur.boys;
      acc.girls += cur.girls;
      return acc;
    },
    { total: 0, boys: 0, girls: 0 }
  );

  const genderSeries: Highcharts.SeriesOptionsType[] =
    selectedGender === "All"
      ? [
        { type: "column", name: "Girls", data: filteredStudentsByClass.map(i => i.girls), color: '#ff69b4' },
        { type: "column", name: "Boys", data: filteredStudentsByClass.map(i => i.boys), color: '#2563eb' }
      ]
      : selectedGender === "Female"
        ? [{ type: "column", name: "Girls", data: filteredStudentsByClass.map(i => i.girls), color: '#ff69b4' }]
        : [{ type: "column", name: "Boys", data: filteredStudentsByClass.map(i => i.boys), color: '#2563eb' }];
  const seriesDatabyClass: Highcharts.SeriesOptionsType[] = [
    { type: "column", name: "Students", data: filteredStudentsByClass.map(i => i.students) },
    ...genderSeries
  ];
  console.log("Filtered Students By Class:", selectedClass);

  function SummaryCard({ icon, title, value }: any) {
    return (
      <div className="bg-white rounded-md border border-gray-200 p-4 flex items-center gap-4">
        <Image src={icon} alt={title} width={80} height={80} className="mr-1" />
        <div>
          <p className="text-lg text-gray-600 font-bold">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    );
  }

  function Card({ children, className = "" }: any) {
    return (
      <div className={`bg-white rounded-xl shadow p-4 ${className}`}>{children}</div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen mb-4">
      <h1 className="text-3xl font-semibold text-center mb-10 mt-4 text-gray-900">
        School Management Analysis Dashboard
      </h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 mt-6">
        <SummaryCard icon={images.totalStudentIcon} title="Total Students" value={selectedClass === "All" ? summary.totalStudents : summaryByClass.total} />
        <SummaryCard icon={images.boyStudentIcon} title="Boys" value={selectedClass === "All" ? summary.boys : summaryByClass.boys} />
        <SummaryCard icon={images.girlStudentIcon} title="Girls" value={selectedClass === "All" ? summary.girls : summaryByClass.girls} />
        <SummaryCard icon={images.maleTeacherIcon} title="Total Teachers" value={summary.totalTeachers} />
        <SummaryCard
          icon={images.bothTeachersIcon}
          title="Male / Female"
          value={`${summary.maleTeachers} / ${summary.femaleTeachers}`}
        />
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-2 gap-6">
        {/* Students by Class */}
        <Card>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <SelectDropdown label="Class" value={selectedClass} onChange={setSelectedClass} options={classOptions} />
            <SelectDropdown label="Gender" value={selectedGender} onChange={setSelectedGender} options={genderOptions} />
          </div>
          <GlobalHighchart
            type="line"
            title="Students by Class"
            categories={filteredStudentsByClass.map(i => i.name)}
            series={seriesDatabyClass}
            yAxisTitle="Students Count"
          />
        </Card>

        {/* Stream Distribution */}
        <Card>
          <GlobalHighchart
            type="pie"
            title="Stream Distribution (Class 11 & 12)"
            series={streamPieSeries as Highcharts.SeriesOptionsType[]}
            drilldownSeries={streamDrilldown as Highcharts.SeriesOptionsType[]}
            optionsOverride={{
              plotOptions: {
                pie: {
                  allowPointSelect: true,
                  borderWidth: 2,
                  cursor: 'pointer',
                  dataLabels: {
                    enabled: true,
                    format: '{point.name}',
                    style: {
                      fontSize: '14px',
                      textOutline: 'none',
                      color: '{point.color}',
                    },
                    connectorPadding: 5,
                    connectorWidth: 2,
                    distance: 20
                  },
                  showInLegend: true
                },
              },
              tooltip: {
                headerFormat: '<span style="font-size:12px">{series.name}</span><br>',
              },
              exporting: {
                enabled: false
              }
            }}
          />
        </Card>

        {/* Attendance Day-wise Drilldown */}
        <Card>
          <div className="grid grid-cols-2 gap-4 mb-6 ">
            <SelectDropdown label="Month" value={selectedMonth} onChange={setSelectedMonth} options={monthOptions} />
          </div>
          <GlobalHighchart
            type="column"
            title={`Attendance Day-wise (${selectedMonth})`}
            categories={dayWise.map(d => d.day)}
            series={[
              { type: "column", name: "Present", data: dayWise.map(d => d.present), color: '#22c55e' },
              { type: "column", name: "Absent", data: dayWise.map(d => d.absent), color: '#ff4d4d' }
            ]}
            yAxisTitle="Percentage"
            optionsOverride={
              {
                exporting: {
                  enabled: false
                }
              }
            }
          />
        </Card>
        <Card>
          <div className="flex justify-end gap-4 mb-6">
            <Button
              variant="secondary"
              className={filterByRole === "role" ? "bg-red-600 text-white" : ""}
              onClick={() => setByRoleFilter("role")}
            >
              Users by Role
            </Button>
            <Button
              className={filterByRole === "region" ? "bg-blue-600" : "text-gray-900"}
              onClick={() => setByRoleFilter("region")}
            >
              Users by Region
            </Button>
          </div>
          <GlobalHighchart
            type={"column"}
            title={chartOptions.title.text}
            categories={chartOptions.xAxis.categories}
            yAxisTitle={chartOptions.yAxis.title.text}
            height={400}
            theme="light"
            series={chartOptions.series.map((s: any) => ({ ...s, type: "column" }))}
            drilldownSeries={[]}
            optionsOverride={chartOptions.optionsOverride}
          />
        </Card>
      </div>
    </div>
  );
}