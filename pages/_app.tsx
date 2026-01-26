import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { ApplicationShell4 } from "@/components/ui/ApplicationShell";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApplicationShell4>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#333",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#6b8e23",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <Component {...pageProps} />
    </ApplicationShell4>
  );
}
