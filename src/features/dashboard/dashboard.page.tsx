import { useEffect, useState } from "react";
import { healthService } from "./health.service";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "@/lib/dayjs";
import Button from "@/components/ui/button";

// Swagger lives at <host>/docs (not under /api). Derive it from the configured
// API base so the link always tracks VITE_API_URL, falling back to whatever the
// /health response reports if the base URL is unset.
function apiDocsUrl(fallback: string): string {
  const base = import.meta.env.VITE_API_URL as string | undefined;
  if (base) {
    try {
      return new URL("/docs", base).toString();
    } catch {
      // fall through to the health-provided value
    }
  }
  return fallback;
}

export default function DashboardPage() {
  const [health, setHealth] = useState<{
    status: "ok" | "degraded";
    timestamp: string;
    uptime: number;
    environment: "development" | "production";
    docs: string;
    services: {
      database: "up" | "down";
      cloudinary: "up" | "down";
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const data = await healthService.getHealth();
      setHealth(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">System health overview</p>
      </div>

      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : health ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatusCard
            title="API Status"
            value={health.status}
            ok={health.status === "ok"}
          />

          <StatusCard title="Environment" value={health.environment} />

          <StatusCard
            title="Database"
            value={health.services.database}
            ok={health.services.database === "up"}
          />

          <StatusCard
            title="Cloudinary"
            value={health.services.cloudinary}
            ok={health.services.cloudinary === "up"}
          />

          <StatusCard
            title="Uptime"
            value={dayjs.duration(health.uptime, "seconds").humanize()}
          />

          <StatusCard
            title="Last Checked"
            value={dayjs(health.timestamp).fromNow()}
          />

          <DocsCard
            title="API Docs"
            subtitle="Open API Docs →"
            url={apiDocsUrl(health.docs)}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatusCard
            title="No health data available"
            value="Defaulted to null"
          />
        </div>
      )}
    </div>
  );
}

function StatusCard({
  title,
  value,
  ok,
}: {
  title: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div
          className={`text-lg font-semibold ${
            ok === undefined ? "" : ok ? "text-green-600" : "text-red-600"
          }`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function DocsCard({
  title,
  subtitle,
  url,
}: {
  title: string;
  subtitle: string;
  url: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Button asChild size="sm" variant="outline">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {subtitle}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
