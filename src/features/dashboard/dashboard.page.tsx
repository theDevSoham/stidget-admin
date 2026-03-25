import { useEffect, useState } from "react";
import { healthService } from "./health.service";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "@/lib/dayjs";

export default function DashboardPage() {
  const [health, setHealth] = useState<{
    status: "ok" | "degraded";
    timestamp: string;
    uptime: number;
    environment: "development" | "production";
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
