'use client';

import React from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  ShoppingBagIcon,
  ViewColumnsIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MainPage = () => {
  const activityData = [
    { title: 'NEW ITEMS', qty: 741 },
    { title: 'NEW ORDERS', qty: 123 },
    { title: 'REFUNDS', qty: 12 },
    { title: 'MESSAGE', qty: 1 },
    { title: 'GROUPS', qty: 4 },
  ];

  const salesData = {
    labels: ['Confirmed', 'Packed', 'Refunded', 'Shipped'],
    datasets: [
      {
        data: [65, 80, 20, 90],
        backgroundColor: '#9333EA',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const categories = [
    { icon: '👕', name: 'Clothing' },
    { icon: '🎩', name: 'Accessories' },
    { icon: '👜', name: 'Bags' },
    { icon: '👟', name: 'Shoes' },
    { icon: '🎒', name: 'Backpacks' },
    { icon: '🕶️', name: 'Eyewear' },
  ];

  const stores = [
    { name: 'Manchester, UK', employees: 23, items: 308, orders: 2 },
    { name: 'Yorkshire, UK', employees: 11, items: 291, orders: 15 },
    { name: 'Hull, UK', employees: 5, items: 41, orders: 11 },
    { name: 'Leicester, UK', employees: 16, items: 261, orders: 8 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6">
        <div className="text-2xl font-bold mb-10">GitHub Classroom Tracker</div>
        <nav className="space-y-4">
         
          {/* <a href="#" className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
            <PlusIcon className="h-6 w-6" />
            <span>Add Assignment</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
            <span>Log out</span>
          </a> */}
          {[
            { icon: <ShoppingBagIcon className="h-6 w-6" />, text: 'Assignments', href: '/assignment' }
          ].map((item) => (
            <Link key={item.text} href={item.href} className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
              {item.icon}
              <span>{item.text}</span>
            </Link>
          ))}
        </nav>
      </div>
      </div>

     

        
      

 

        

          
    
  );
};

export default MainPage; 