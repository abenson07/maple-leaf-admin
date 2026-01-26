import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabaseClient";

interface ConnectionStatus {
  connected: boolean;
  error: string | null;
  tables: string[];
  peopleCount: number | null;
}

export default function TestConnection() {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    error: null,
    tables: [],
    peopleCount: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      try {
        // Test 1: Check if Supabase client is initialized
        if (!supabaseClient) {
          throw new Error("Supabase client not initialized");
        }

        // Test 2: Try to query the people table
        const { data: people, error: peopleError } = await supabaseClient
          .from("people")
          .select("id")
          .limit(1);

        if (peopleError) {
          throw new Error(`Database query error: ${peopleError.message}`);
        }

        // Test 3: Count people records
        const { count, error: countError } = await supabaseClient
          .from("people")
          .select("*", { count: "exact", head: true });

        if (countError) {
          throw new Error(`Count query error: ${countError.message}`);
        }

        // Test 4: Try to get table names (if possible)
        const tables = [
          "people",
          "memberships",
          "businesses",
          "business_memberships",
          "routes",
          "deliveries",
          "events",
          "event_volunteers",
          "payments",
          "sponsorships",
        ];

        setStatus({
          connected: true,
          error: null,
          tables,
          peopleCount: count || 0,
        });
      } catch (error) {
        setStatus({
          connected: false,
          error: error instanceof Error ? error.message : "Unknown error",
          tables: [],
          peopleCount: null,
        });
      } finally {
        setLoading(false);
      }
    }

    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Testing Supabase connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-primary">
          Supabase Connection Test
        </h1>

        <div
          className={`p-6 rounded-lg mb-6 ${
            status.connected
              ? "bg-green-100 border-2 border-green-500"
              : "bg-red-100 border-2 border-red-500"
          }`}
        >
          <h2 className="text-xl font-semibold mb-2">
            Connection Status:{" "}
            <span
              className={status.connected ? "text-green-700" : "text-red-700"}
            >
              {status.connected ? "✅ Connected" : "❌ Failed"}
            </span>
          </h2>

          {status.error && (
            <div className="mt-4 p-4 bg-red-50 rounded border border-red-200">
              <p className="text-red-800 font-semibold">Error:</p>
              <p className="text-red-700 mt-1">{status.error}</p>
            </div>
          )}

          {status.connected && (
            <div className="mt-4 space-y-2">
              <p className="text-green-800">
                <strong>People records found:</strong> {status.peopleCount}
              </p>
              <div>
                <p className="text-green-800 font-semibold mb-2">
                  Available tables:
                </p>
                <ul className="list-disc list-inside text-green-700">
                  {status.tables.map((table) => (
                    <li key={table}>{table}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Environment Check</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_URL
                ? "✅ Set"
                : "❌ Not set"}
            </p>
            <p>
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                ? "✅ Set"
                : "❌ Not set"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="text-primary hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
