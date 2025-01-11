// Ensure this file is treated as a client component
"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Higher-Order Component (HOC) for authentication
 *
 * Wraps a component, redirecting to login if user is not authenticated
 */
const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const AuthenticatedComponent: React.FC<P> = ({ ...props }) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/"); // Specific login route
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
};

export default withAuth;