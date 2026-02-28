"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface DailyData {
  day: string
  date: string
  total: number
  completed: number
  pending: number
}

interface TypeData {
  name: string
  value: number
}

const barChartConfig = {
  completed: {
    label: "Completed",
    color: "var(--color-primary)",
  },
  pending: {
    label: "Pending",
    color: "oklch(0.75 0.15 75)",
  },
} satisfies ChartConfig

// MD3-inspired palette for pie chart
const PIE_COLORS = [
  "var(--color-primary)",
  "oklch(0.65 0.15 160)",
  "oklch(0.75 0.15 75)",
  "oklch(0.60 0.18 300)",
  "oklch(0.70 0.12 200)",
  "oklch(0.65 0.10 30)",
]

export function DashboardCharts({
  dailyData,
  typeData,
}: {
  dailyData: DailyData[]
  typeData: TypeData[]
}) {
  const hasWeekData = dailyData.some((d) => d.total > 0)
  const hasTypeData = typeData.length > 0

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-5">
      {/* Weekly Bar Chart */}
      <Card className="lg:col-span-3 bg-secondary/50 dark:bg-secondary/30 shadow-none border-0">
        <CardHeader className="px-5 pt-5 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Weekly Appointments
            </CardTitle>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Last 7 days
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {!hasWeekData ? (
            <div className="h-[260px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No appointment data for this week yet.
              </p>
            </div>
          ) : (
            <ChartContainer config={barChartConfig} className="h-[260px] w-full">
              <BarChart
                data={dailyData}
                margin={{ top: 8, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-foreground/[0.06]"
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="rounded-xl border-0 shadow-lg bg-popover"
                      labelFormatter={(_, payload) => {
                        const item = payload?.[0]?.payload as DailyData
                        return item?.date || ""
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="completed"
                  stackId="a"
                  fill="var(--color-completed)"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="pending"
                  stackId="a"
                  fill="var(--color-pending)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Appointment Types Donut */}
      <Card className="lg:col-span-2 bg-secondary/50 dark:bg-secondary/30 shadow-none border-0">
        <CardHeader className="px-5 pt-5 pb-2">
          <CardTitle className="text-sm font-semibold">
            Visit Types
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {!hasTypeData ? (
            <div className="h-[260px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No visit data available.
              </p>
            </div>
          ) : (
            <div className="h-[260px] flex flex-col">
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {typeData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const data = payload[0]
                        return (
                          <div className="rounded-xl bg-popover px-3 py-2 shadow-lg text-sm">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-muted-foreground text-xs">
                              {data.value} appointments
                            </p>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                {typeData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div
                      className="size-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                    />
                    <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                      {item.name}
                    </span>
                    <span className="text-xs font-medium tabular-nums">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
