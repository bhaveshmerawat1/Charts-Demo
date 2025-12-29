import { color } from "highcharts";

export const summary = {
  totalStudents: 5000,
  boys: 3000,
  girls: 2000,
  totalTeachers: 500,
  maleTeachers: 350,
  femaleTeachers: 150
};

export const studentsByClass = [
  { name: "Class 6", students: 900, boys: 500, girls: 400 },
  { name: "Class 7", students: 800, boys: 450, girls: 350 },
  { name: "Class 8", students: 750, boys: 420, girls: 330 },
  { name: "Class 9", students: 850, boys: 480, girls: 370 },
  { name: "Class 10", students: 820, boys: 460, girls: 360 },
  { name: "Class 11", students: 900, boys: 520, girls: 380 },
  { name: "Class 12", students: 950, boys: 530, girls: 420 }
];

export const streamPieSeries = [
  {
    type: "pie",
    name: "Students",
    data: [
      { name: "Science", y: 1000, drilldown: "Science", color: "#2563eb" },
      { name: "Commerce", y: 500, drilldown: "Commerce", color: "#ff69b4" },
      { name: "Arts", y: 700, drilldown: "Arts", color: "#f59e0b" }
    ],
    animation: {
      duration: 2000
    },
    colorByPoint: true,
  }
];

export const streamDrilldown = [
  { id: "Science", type: "pie", data: [["Boys", 700], ["Girls", 300]] },
  { id: "Commerce", type: "pie", data: [["Boys", 300], ["Girls", 200]] },
  { id: "Arts", type: "pie", data: [["Boys", 300], ["Girls", 400]] }
];

export const teacherGenderSeries = [
  {
    type: "pie",
    name: "Teachers",
    data: [
      { name: "Male", y: 350 },
      { name: "Female", y: 150 }
    ]
  }
];

export const attendanceByMonth = {
  Jan: { present: 88, absent: 12 },
  Feb: { present: 85, absent: 15 },
  Mar: { present: 90, absent: 10 },
  Apr: { present: 82, absent: 18 },
  May: { present: 86, absent: 14 },
  Jun: { present: 80, absent: 20 },
  Jul: { present: 75, absent: 25 },
  Aug: { present: 78, absent: 22 }
};

export function getAttendanceByDay(month: string) {
  return Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    present: Math.floor(70 + Math.random() * 25),
    absent: Math.floor(5 + Math.random() * 25)
  }));
}