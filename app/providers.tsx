"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import withAuth from "../utils/withAuth";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

function AppWrapper({ children }: any) {
  return <>{children}</>;
}

const AuthenticatedApp = withAuth(AppWrapper);

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <AuthenticatedApp>{children}</AuthenticatedApp>
      </NextThemesProvider>
    </NextUIProvider>
  );
}
