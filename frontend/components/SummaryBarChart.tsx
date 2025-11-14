'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell, // Import Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryBarChartProps {
  data: {
    salary: number;
    limit: number;
    spent: number;
  };
}

export function SummaryBarChart({ data }: SummaryBarChartProps) {
  const chartData = [
    { name: 'Salary', value: data.salary, fill: '#82ca9d' },
    { name: 'Limit', value: data.limit, fill: '#FFBB28' },
    { name: 'Spent', value: data.spent, fill: '#FF8042' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs. Limit vs. Spent</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Bar
                dataKey="value"
                label={{ position: 'right', fill: '#000', fontSize: 12, formatter: (value: number) => `$${value.toFixed(0)}` }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}