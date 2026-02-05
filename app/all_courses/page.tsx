import DepartmentRow from "@/components/DepartmentRow";

const DEPARTMENTS = [
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Chemical Engineering",
  "Petroleum Engineering",
  "Agricultural Engineering",
  "Marine Engineering",
];

export default function AllCoursesPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 bg-[#F8F9FB]">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        All Courses
      </h1>

      {DEPARTMENTS.map(dept => (
        <DepartmentRow key={dept} department={dept} />
      ))}
    </div>
  );
}
