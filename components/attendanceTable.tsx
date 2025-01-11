"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Pagination,
  DatePicker,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import axios from "axios";

interface AttendanceTableProps {
  apiUrl: string; // API URL passed as a prop
}

const AttendanceTable = ({ apiUrl }: AttendanceTableProps) => {
  const [employees, setEmployees] = useState<any[]>([]); // Store employee data from API
  const [attendanceData, setAttendanceData] = useState<any[]>([]); // Store attendance data from API
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState(
    parseDate(new Date().toISOString().split("T")[0]), // Use parseDate to create a DateValue
  );
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null); // Selected employee for marking attendance
  const [error, setError] = useState<string>("");
  const [token, setToken] = useState<any>(localStorage.getItem("token"));
  // Get token from localStorage

  // Fetch employee data from API
  useEffect(() => {
    const token = localStorage.getItem("token");

    setToken(token);

    const fetchEmployees = async () => {
      if (!token) {
        setError("No token found. Please log in.");

        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/employees`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the request header
          },
        });

        if (response.status === 200) {
          setEmployees(response.data);
        }
      } catch (err) {
        setError("Failed to fetch employee data.");
      }
    };

    fetchEmployees();
  }, [apiUrl, token]);

  // Fetch attendance data from API for the selected date
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!token) {
        setError("No token found. Please log in.");

        return;
      }

      try {
        const dateString = selectedDate.toString(); // Convert DateValue to string (YYYY-MM-DD)
        const response = await axios.get(
          `${apiUrl}/attendance?date=${dateString}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include token in the request header
            },
          },
        );

        if (response.status === 200) {
          setAttendanceData(response.data);
        }
      } catch (err) {
        setError("Failed to fetch attendance data.");
      }
    };

    fetchAttendanceData();
  }, [apiUrl, selectedDate, token]);

  // Handle attendance submission
  const handleMarkAttendance = async () => {
    if (!selectedEmployee) {
      setError("Please select an employee.");

      return;
    }

    if (!token) {
      setError("No token found. Please log in.");

      return;
    }

    setLoading(true);
    try {
      const dateString = selectedDate.toString(); // Convert DateValue to string (YYYY-MM-DD)
      const response = await axios.post(
        `${apiUrl}/attendance`,
        {
          employeeId: selectedEmployee,
          date: dateString,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the request header
          },
        },
      );

      if (response.status === 201) {
        // Update local state with the new attendance record
        const newAttendance = {
          employeeId: selectedEmployee,
          date: dateString,
        };

        setAttendanceData((prev) => [...prev, newAttendance]);
        setIsModalOpen(false); // Close modal after attendance is marked
        setSelectedEmployee(null); // Reset selected employee
        setError(""); // Clear error message
      }
    } catch (err) {
      setError("Failed to mark attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Combine employees and attendance data
  const combinedData = employees.map((employee) => {
    const attendanceRecord = attendanceData.find(
      (record) => record.employeeId === employee.id,
    );

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      date: selectedDate.toString(), // Convert DateValue to string (YYYY-MM-DD)
      status: attendanceRecord ? attendanceRecord.status : "Not Marked",
    };
  });

  // Filter combined data based on search query
  const filteredData = combinedData.filter((record) =>
    record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Paginate combined data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <div className="flex justify-between items-center mb-6 space-x-16">
        <Input
          className=""
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <DatePicker
          label="Select Date"
          value={selectedDate} // Pass DateValue
          onChange={(date) => setSelectedDate(date)} // Handle DateValue
        />
        <Button variant="ghost" onPress={() => setIsModalOpen(true)}>
          Add
        </Button>
      </div>

      <Table
        border
        headerLined
        lined
        aria-label="Attendance Table"
        className="w-full"
        shadow="sm"
      >
        <TableHeader>
          <TableColumn>EMPLOYEE NAME</TableColumn>
          <TableColumn>DATE</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {paginatedData.map((record, index) => (
            <TableRow
              key={index}
              className="hover:bg-gray-100 transition-colors duration-200"
            >
              <TableCell>{record.employeeName}</TableCell>
              <TableCell>{record.date}</TableCell>
              <TableCell>{record.status}</TableCell>
              <TableCell>
                <Button
                  className="hover:bg-green-500 transition-colors duration-200"
                  disabled={loading || record.status !== "Not Marked"}
                  size="sm"
                  onPress={() => {
                    setSelectedEmployee(record.employeeId);
                    setIsModalOpen(true);
                  }}
                >
                  {loading ? "Marking..." : "Mark Attendance"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center mt-6">
        <Pagination
          initialPage={1}
          page={currentPage}
          total={Math.ceil(filteredData.length / itemsPerPage)}
          onChange={setCurrentPage}
        />
      </div>

      {/* Modal for adding attendance */}
      <Modal
        aria-labelledby="attendance-dialog"
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployee(null); // Reset selected employee when modal is closed
          setError(""); // Clear error message
        }}
      >
        <ModalContent>
          <ModalHeader id="attendance-dialog">Mark Attendance</ModalHeader>
          <ModalBody>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered">
                  {selectedEmployee
                    ? employees.find((emp) => emp.id === selectedEmployee)?.name
                    : "Select Employee"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Employee Selection"
                onAction={(key) => setSelectedEmployee(key as string)}
              >
                {employees.map((employee) => (
                  <DropdownItem key={employee.id}>{employee.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              disabled={loading || !selectedEmployee}
              onPress={handleMarkAttendance}
            >
              {loading ? "Marking..." : "Mark Attendance"}
            </Button>
            <Button variant="flat" onPress={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AttendanceTable;
