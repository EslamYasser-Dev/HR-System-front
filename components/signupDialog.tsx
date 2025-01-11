"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import axios from "axios";

interface SignUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: any;
}

export const SignUpDialog: React.FC<SignUpDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [group, setGroup] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !group) {
      setError("All fields are required.");

      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");

      return;
    }

    setError("");
    setLoading(true);

    try {
      const url = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${url}/employees`,
        {
          name,
          email,
          group,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      onSuccess();
      onClose();
      setName("");
      setEmail("");
      setGroup("");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data.message || "Operation failed. Please try again.",
        );
      } else {
        setError("Operation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal aria-labelledby="login-dialog" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader id="login-dialog">Add New Employee</ModalHeader>
        <ModalBody>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <Input
            aria-label="Name"
            label="Employee Full Name"
            placeholder="Enter Employee Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            aria-label="Email"
            className="mb-4"
            label="Email"
            placeholder="Enter Employee Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            aria-label="Group"
            label="Group"
            placeholder="Enter Employee Group"
            type="text"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" disabled={loading} onPress={handleSubmit}>
            {loading ? "Saving new employee..." : "Submit"}
          </Button>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};


