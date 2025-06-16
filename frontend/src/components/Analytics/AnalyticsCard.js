import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import "./AnalyticsCard.css"

const AnalyticsCard = ({ title, type, data, colors, dataKey, xAxisKey }) => {
  const COLORS = colors || ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey || "name"} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={dataKey || "value"} fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey || "name"} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={dataKey || "value"} stroke={COLORS[0]} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey || "value"}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey || "name"} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey={dataKey || "value"} stroke={COLORS[0]} fill={COLORS[0]} />
            </AreaChart>
          </ResponsiveContainer>
        )

      default:
        return <div>Invalid chart type</div>
    }
  }

  return (
    <div className="analytics-card">
      <h3 className="analytics-title">{title}</h3>
      <div className="analytics-chart">{renderChart()}</div>
    </div>
  )
}

export default AnalyticsCard
