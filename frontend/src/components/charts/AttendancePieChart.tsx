import { useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  Legend,
  Tooltip,
} from "recharts";


const COLORS = {
  present: "#22c55e", // green-500
  remote: "#3b82f6", // blue-500
  late: "#eab308", // yellow-500
  absent: "#ef4444", // red-500
};

// labels for the statuses
const LABELS = {
  present: "Aanwezig",
  remote: "Op afstand",
  late: "Te laat",
  absent: "Afwezig",
};

interface AttendanceData {
  present: number;
  remote: number;
  late: number;
  absent: number;
}

interface AttendancePieChartProps {
  data: AttendanceData;
  showLegend?: boolean;
  showTooltip?: boolean;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
  showCenterLabel?: boolean;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  key: keyof AttendanceData;
}

// Custom active shape for hover effect
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  return (
    <g>
      {/* Center text */}
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill="currentColor"
        className="text-lg font-semibold"
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy + 15}
        textAnchor="middle"
        fill="currentColor"
        className="text-2xl font-bold"
      >
        {value}
      </text>
      <text
        x={cx}
        y={cy + 35}
        textAnchor="middle"
        fill="currentColor"
        className="text-sm opacity-70"
      >
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>

      {/* Active sector with expanded radius */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))",
          transition: "all 0.3s ease-out",
        }}
      />
      {/* Inner highlight ring */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ opacity: 0.5 }}
      />
    </g>
  );
};

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-4 py-3 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.payload.color }}
          />
          <span className="font-medium">{data.name}</span>
        </div>
        <div className="text-2xl font-bold">{data.value} dagen</div>
        <div className="text-sm text-muted-foreground">
          {((data.payload.percent || 0) * 100).toFixed(1)}% van totaal
        </div>
      </div>
    );
  }
  return null;
};

// Custom legend
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function AttendancePieChart({
  data,
  showLegend = true,
  showTooltip = true,
  animated = true,
  size = "md",
  showCenterLabel = true,
}: AttendancePieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  // Convert data to chart format
  const chartData: ChartDataItem[] = [
    { name: LABELS.present, value: data.present, color: COLORS.present, key: "present" },
    { name: LABELS.remote, value: data.remote, color: COLORS.remote, key: "remote" },
    { name: LABELS.late, value: data.late, color: COLORS.late, key: "late" },
    { name: LABELS.absent, value: data.absent, color: COLORS.absent, key: "absent" },
  ].filter((item) => item.value > 0); 

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Add percentage to each item
  const chartDataWithPercent = chartData.map((item) => ({
    ...item,
    percent: total > 0 ? item.value / total : 0,
  }));

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(undefined);
  }, []);

  // Size configurations
  const sizeConfig = {
    sm: { height: 250, innerRadius: 50, outerRadius: 80 },
    md: { height: 350, innerRadius: 70, outerRadius: 110 },
    lg: { height: 450, innerRadius: 90, outerRadius: 140 },
  };

  const { height, innerRadius, outerRadius } = sizeConfig[size];

  // If no data, show empty state
  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div>Geen aanwezigheidsdata beschikbaar</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={showCenterLabel ? renderActiveShape : undefined}
            data={chartDataWithPercent}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationBegin={0}
            animationDuration={animated ? 800 : 0}
            animationEasing="ease-out"
          >
            {chartDataWithPercent.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="transparent"
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s ease-out",
                  opacity: activeIndex !== undefined && activeIndex !== index ? 0.6 : 1,
                }}
              />
            ))}
          </Pie>

          {showTooltip && activeIndex === undefined && (
            <Tooltip content={<CustomTooltip />} />
          )}

          {showLegend && <Legend content={<CustomLegend />} />}

          {/* Center label when nothing is hovered */}
          {showCenterLabel && activeIndex === undefined && (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-current"
            >
              <tspan x="50%" dy="-0.5em" className="text-3xl font-bold">
                {total}
              </tspan>
              <tspan x="50%" dy="1.5em" className="text-sm opacity-70">
                dagen totaal
              </tspan>
            </text>
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Export colors and labels for use in other components
export { COLORS as ATTENDANCE_COLORS, LABELS as ATTENDANCE_LABELS };

