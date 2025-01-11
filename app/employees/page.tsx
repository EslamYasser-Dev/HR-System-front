"use client";
import GenericTable from "@/components/genericTable";

const EmployeePage = () => {
  return (
    <div>
      <GenericTable
        apiEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employees`}
        initialData={[]}
      />
    </div>
  );
};

export default EmployeePage;
