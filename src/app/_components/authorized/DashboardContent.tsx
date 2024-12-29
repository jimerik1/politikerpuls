import React from 'react';
import { type Session } from "next-auth";
import { LatestPost } from "../post";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

const StatCard = ({ title, value, change, trend }: StatCardProps) => (
  <div className="rounded-lg bg-white p-6 shadow">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <div className="mt-2 flex items-baseline">
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <span className={`ml-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {change}
      </span>
    </div>
  </div>
);

interface DashboardContentProps {
  session: Session;
}

const DashboardContent = ({ session }: DashboardContentProps) => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Engagements"
          value="2,651"
          change="+4.75%"
          trend="up"
        />
        <StatCard
          title="Avg. Response Time"
          value="2.4h"
          change="-0.5%"
          trend="down"
        />
        <StatCard
          title="Active Issues"
          value="124"
          change="+12%"
          trend="up"
        />
        <StatCard
          title="Satisfaction Rate"
          value="95%"
          change="+2.3%"
          trend="up"
        />
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">Recent Activity:</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Sample data - replace with real data */}
              <tr>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    Issue
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">Climate Change Policy Discussion</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  2024-03-15
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    Active
                  </span>
                </td>
              </tr>
              {/* Add more rows as needed */}
            </tbody>
          </table>
        </div>
      </div>

      {/* Posts Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">Your Posts</h3>
        <div className="w-full max-w-lg">
          <LatestPost />
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;