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

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Both fields are required.");

      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");

      return;
    }

    setError(""); // Clear previous errors
    setLoading(true); // Indicate loading state

    try {
      const url = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(`${url}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", response.data.role);

      setEmail("");
      setPassword("");
      onLoginSuccess();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data.message || "Login failed. Please try again.",
        );
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <Modal aria-labelledby="login-dialog" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader id="login-dialog">Login</ModalHeader>
        <ModalBody>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <Input
            aria-label="Email"
            className="mb-4"
            label="Email"
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            aria-label="Password"
            label="Password"
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" disabled={loading} onPress={handleSubmit}>
            {loading ? "Logging in..." : "Login"}
          </Button>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
