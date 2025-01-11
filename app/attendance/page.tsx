import AttendanceTable from "@/components/attendanceTable";

export default function PricingPage() {
  return (
    <>
      <AttendanceTable apiUrl={`${process.env.NEXT_PUBLIC_API_URL}`} />
    </>
  );
}
