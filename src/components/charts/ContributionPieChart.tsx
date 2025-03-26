'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import type { UserContribution } from '@/services/analyticsService';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

// Function to generate random colors with good visibility
function generateColorArray(length: number) {
  const colors = [];
  const backgroundColors = [];
  
  for (let i = 0; i < length; i++) {
    const r = Math.floor(50 + Math.random() * 150);
    const g = Math.floor(50 + Math.random() * 150);
    const b = Math.floor(50 + Math.random() * 150);
    
    const color = `rgba(${r}, ${g}, ${b}, 0.8)`;
    const backgroundColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
    
    colors.push(color);
    backgroundColors.push(backgroundColor);
  }
  
  return { colors, backgroundColors };
}

interface ContributionPieChartProps {
  userContributions: UserContribution[];
}

export default function ContributionPieChart({ userContributions }: ContributionPieChartProps) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    if (userContributions.length === 0) return;
    
    const users = userContributions.map(u => u.user);
    const contributionPercents = userContributions.map(u => u.contributionPercentage);
    
    // Generate colors
    const { colors, backgroundColors } = generateColorArray(users.length);

    setChartData({
      labels: users,
      datasets: [
        {
          label: 'Contribution Percentage',
          data: contributionPercents,
          backgroundColor: colors,
          borderColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    });
  }, [userContributions]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Team Contribution Distribution',
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Team Contribution Distribution</h3>
      {userContributions.length > 0 ? (
        <Pie data={chartData} options={options} />
      ) : (
        <div className="text-center py-8 text-gray-500">No contribution data available</div>
      )}
    </div>
  );
} 