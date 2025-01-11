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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spacer,
  Pagination,
  Spinner,
} from "@nextui-org/react";
import axios from "axios";

interface GenericTableProps<T> {
  apiEndpoint: string;
  initialData: T[];
}

const GenericTable = <T extends Record<string, any>>({
  apiEndpoint,
  initialData,
}: GenericTableProps<T>) => {
  const [data, setData] = useState<T[]>(initialData);
  const [visible, setVisible] = useState(false);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [newItem, setNewItem] = useState<Partial<T>>({});
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setToken(localStorage.getItem("token") || "");
    fetchData();
  }, [apiEndpoint, token]);

  const fetchData = async () => {
    try {
      const response = await axios.get(apiEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status !== 200) {
        throw new Error("Failed to fetch data");
      }

      setData(response.data);
    } catch (err) {}
  };

  const handleAddItem = async () => {
    if (Object.values(newItem).some((value) => !value)) {
      setError("All fields are required.");

      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(apiEndpoint, newItem, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 201) {
        throw new Error("Failed to add item");
      }

      const createdItem = response.data;

      setData((prev) => [...prev, createdItem]);
      resetItemState();
      setVisible(false);
    } catch (err) {
      setError("Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item: T) => {
    setEditItem(item);
    setNewItem(item);
    setVisible(true);
  };

  const handleSaveEdit = async () => {
    if (Object.values(newItem).some((value) => !value)) {
      setError("All fields are required.");

      return;
    }

    setError("");
    setLoading(true);

    try {
      const uniqueIdentifier = editItem?.id;
      const response = await axios.put(
        `${apiEndpoint}/${uniqueIdentifier}`,
        newItem,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status !== 200) {
        throw new Error("Failed to update item");
      }

      const updatedItem = response.data;

      setData((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      );
      resetItemState();
      setVisible(false);
    } catch (err) {
      setError("Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (uniqueIdentifier: string) => {
    try {
      const response = await axios.delete(
        `${apiEndpoint}/${uniqueIdentifier}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status !== 200) {
        throw new Error("Failed to delete item");
      }

      setData((prev) => prev.filter((item) => item.id !== uniqueIdentifier));
    } catch (err) {}
  };

  const resetItemState = () => {
    setNewItem({});
    setEditItem(null);
    setError("");
  };

  const columns = data.length
    ? Object.keys(data[0])
    : ["name", "email", "group"];

  // Filter data based on search query
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  // Paginate data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading) return <Spinner />;

  return (
    <div style={{ padding: "20px", margin: "auto" }}>
      <div className="flex justify-between items-center mb-6">
        <Input
          className="w-96"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-4">
          <Button
            className="hover:bg-blue-600 transition-colors duration-200"
            color="primary"
            onPress={() => {
              resetItemState();
              setVisible(true);
            }}
          >
            Add Item
          </Button>
        </div>
      </div>

      <Table
        border
        headerLined
        lined
        aria-label="Styled Generic Table"
        className="w-full"
        shadow="sm"
      >
        <TableHeader>
          {columns?.map((col, i) => (
            <TableColumn key={i}>{col.toUpperCase()}</TableColumn>
          ))}
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item, index) => (
            <TableRow
              key={index} // Use index as a fallback key
              className="hover:bg-gray-100 transition-colors duration-200"
            >
              {columns?.map((col) => (
                <TableCell key={col}>{(item as any)[col]}</TableCell>
              ))}
              <TableCell>
                <Button
                  className="mr-2 hover:bg-yellow-500 transition-colors duration-200"
                  size="sm"
                  onPress={() => handleEditItem(item)}
                >
                  Edit
                </Button>
                <Button
                  className="hover:bg-red-700 transition-colors duration-200"
                  color="danger"
                  size="sm"
                  onPress={() => handleRemoveItem(item.id)} // Use a unique field for deletion
                >
                  Remove
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

      <Modal isOpen={visible} onClose={() => setVisible(false)}>
        <ModalContent>
          <ModalHeader>{editItem ? "Edit Item" : "Add Item"}</ModalHeader>
          <ModalBody>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {columns.map((col, i) =>
              col === "id" ? (
                <></>
              ) : (
                <Input
                  key={i}
                  aria-label={col}
                  className="mb-4"
                  hidden={col === "id"}
                  label={col}
                  placeholder={`Enter ${col}`}
                  value={(newItem as any)[col] || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, [col]: e.target.value })
                  }
                />
              ),
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              className="hover:bg-blue-600 transition-colors duration-200"
              color="primary"
              disabled={loading}
              onPress={editItem ? handleSaveEdit : handleAddItem}
            >
              {loading ? "Saving..." : editItem ? "Save" : "Add"}
            </Button>
            <Spacer x={0.5} />
            <Button
              className="hover:bg-gray-200 transition-colors duration-200"
              variant="flat"
              onPress={() => {
                setVisible(false);
                resetItemState();
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default GenericTable;
