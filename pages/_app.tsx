import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { ApplicationShell4 } from "@/components/ui/ApplicationShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkipLink } from "@/components/SkipLink";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="MLCC Dashboard - Community management and administration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SkipLink />
      <ErrorBoundary>
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
          <main id="main-content">
            <Component {...pageProps} />
          </main>
        </ApplicationShell4>
      </ErrorBoundary>
    </>
  );
}
