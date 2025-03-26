'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CommitActivityChartProps {
  commitsByDay: Record<string, number>;
}

export default function CommitActivityChart({ commitsByDay }: CommitActivityChartProps) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    // Extract and sort dates
    const dates = Object.keys(commitsByDay).sort();
    const counts = dates.map(date => commitsByDay[date]);

    setChartData({
      labels: dates,
      datasets: [
        {
          label: 'Commit Count',
          data: counts,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });
  }, [commitsByDay]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Commit Activity',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Commit Activity</h3>
      {Object.keys(commitsByDay).length > 0 ? (
        <Bar data={chartData} options={options} />
      ) : (
        <div className="text-center py-8 text-gray-500">No commit data available</div>
      )}
    </div>
  );
} 