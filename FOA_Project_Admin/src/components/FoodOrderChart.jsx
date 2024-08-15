import React from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'Jan', pizza: 4000, burger: 3000, sushi: 2000 },
  { month: 'Feb', pizza: 3000, burger: 3500, sushi: 2500 },
  { month: 'Mar', pizza: 5000, burger: 4000, sushi: 3000 },
  { month: 'Apr', pizza: 4500, burger: 3800, sushi: 3200 },
  { month: 'May', pizza: 5500, burger: 4200, sushi: 3500 },
  { month: 'Jun', pizza: 6000, burger: 1000, sushi: 3800 },
  { month: 'Jul', pizza: 5800, burger: 4300, sushi: 3600 },
  { month: 'Aug', pizza: 5200, burger: 4100, sushi: 3400 },
  { month: 'Sep', pizza: 5500, burger: 4400, sushi: 3700 },
  { month: 'Oct', pizza: 6500, burger: 5000, sushi: 4000 },
  { month: 'Nov', pizza: 7000, burger: 5500, sushi: 4500 },
  { month: 'Dec', pizza: 8000, burger: 6000, sushi: 5000 },
];

const FoodOrderChart = () => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <defs>
          <linearGradient id="colorPizza" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="pizza"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorPizza)"
        />
        <Line type="monotone" dataKey="burger" stroke="crimson" />
        <Line type="monotone" dataKey="sushi" stroke="#ffc658" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default FoodOrderChart;