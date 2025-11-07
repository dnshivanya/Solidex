'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedInspection, setSelectedInspection] = useState<string>('all');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-900 via-blue-50/30 dark:via-blue-900/20 to-green-50/30 dark:to-green-900/20">
        <Navbar isPublic={false} />

        <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 py-4 sm:px-0">
            {/* Hero Section */}
            <div className="mb-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-blue via-brand-green to-brand-blue bg-clip-text text-transparent mb-2">
                    Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex gap-2">
                  <Link href="/admin/dc/create" className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm">
                    + New DC
                  </Link>
                  <Link href="/admin/order/create" className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-brand-green text-brand-green dark:text-green-400 rounded-lg hover:bg-brand-green hover:text-white transition-colors text-sm font-medium shadow-sm">
                    + New Order
                  </Link>
                </div>
              </div>
            </div>
            
            {stats ? (
              <>
                {/* Key Metrics - Primary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card className="relative overflow-hidden bg-gradient-to-br from-brand-blue/10 dark:from-gray-800 dark:to-gray-900 via-brand-blue/5 dark:via-gray-800 to-white dark:to-gray-900 border-2 border-brand-blue/20 dark:border-gray-700 hover:border-brand-blue/40 dark:hover:border-gray-600 hover:shadow-xl transition-all duration-300 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 dark:bg-gray-700/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-2 uppercase tracking-wider">Today's DCs</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.todayDCs}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-300">Delivery challans</p>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <span className="text-2xl">📋</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="relative overflow-hidden bg-gradient-to-br from-brand-yellow/10 dark:from-gray-800 dark:to-gray-900 via-brand-yellow/5 dark:via-gray-800 to-white dark:to-gray-900 border-2 border-brand-yellow/20 dark:border-gray-700 hover:border-brand-yellow/40 dark:hover:border-gray-600 hover:shadow-xl transition-all duration-300 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 dark:bg-gray-700/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-2 uppercase tracking-wider">Pending Orders</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.pendingOrders || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-300">Awaiting action</p>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-brand-yellow to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <span className="text-2xl">📝</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="relative overflow-hidden bg-gradient-to-br from-brand-blue/10 dark:from-gray-800 dark:to-gray-900 via-brand-blue/5 dark:via-gray-800 to-white dark:to-gray-900 border-2 border-brand-blue/20 dark:border-gray-700 hover:border-brand-blue/40 dark:hover:border-gray-600 hover:shadow-xl transition-all duration-300 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 dark:bg-gray-700/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-2 uppercase tracking-wider">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">₹{(stats.totalInvoiceAmount || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-300">All time</p>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <span className="text-2xl">💰</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="relative overflow-hidden bg-gradient-to-br from-brand-green/10 dark:from-gray-800 dark:to-gray-900 via-brand-green/5 dark:via-gray-800 to-white dark:to-gray-900 border-2 border-brand-green/20 dark:border-gray-700 hover:border-brand-green/40 dark:hover:border-gray-600 hover:shadow-xl transition-all duration-300 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 dark:bg-gray-700/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-2 uppercase tracking-wider">Pending Invoices</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.pendingInvoices || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-300">Awaiting payment</p>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <span className="text-2xl">🧾</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Recent Activity & Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 hover:border-brand-blue/30 dark:hover:border-gray-600 hover:shadow-xl transition-all duration-300">
                    <div className="p-5 border-b-2 border-gray-100 dark:border-gray-700 bg-gradient-to-r from-brand-blue/5 dark:from-brand-blue/10 to-transparent">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center text-xl">📋</span>
                        Recent DCs
                      </h3>
                        <Link href="/admin/dc" className="text-xs text-brand-blue dark:text-blue-400 hover:text-brand-green dark:hover:text-green-400 font-medium">View all →</Link>
                      </div>
                    </div>
                    <div className="p-0">
                      {stats?.recentDCs?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <div className="max-h-96 overflow-y-auto scrollbar-hide">
                            <table className="w-full">
                              <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 w-16">S.No.</th>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">DC Number</th>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Party Name</th>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Type</th>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Date</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {stats.recentDCs.map((dc: any, index: number) => (
                                  <tr 
                                    key={dc._id} 
                                    onClick={() => router.push(`/admin/dc/${dc._id}`)}
                                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                  >
                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <p className="text-sm font-medium text-gray-500">{index + 1}</p>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-blue dark:group-hover:text-blue-400 transition-colors">{dc.dcNumber}</p>
                                    </td>
                                    <td className="px-5 py-3">
                                      <p className="text-sm text-gray-700 dark:text-gray-200">{dc.partyName}</p>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <Badge variant={dc.type === 'Inward' ? 'success' : 'warning'} size="sm">
                                    {dc.type}
                                  </Badge>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <p className="text-xs text-gray-500 dark:text-gray-300">
                                        {dc.date ? new Date(dc.date).toLocaleDateString() : dc.createdAt ? new Date(dc.createdAt).toLocaleDateString() : '-'}
                                      </p>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                              </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 px-5">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">📋</span>
                          </div>
                          <p className="text-gray-400 dark:text-gray-300 text-sm">No recent DCs</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 hover:border-brand-yellow/30 dark:hover:border-gray-600 hover:shadow-xl transition-all duration-300">
                    <div className="p-5 border-b-2 border-gray-100 dark:border-gray-700 bg-gradient-to-r from-brand-yellow/5 dark:from-gray-800 to-transparent">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="w-10 h-10 bg-brand-yellow/10 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl">⚠️</span>
                        Low Stock Items
                      </h3>
                        <Link href="/admin/stock" className="text-xs text-brand-blue dark:text-blue-400 hover:text-brand-green dark:hover:text-green-400 font-medium">View all →</Link>
                      </div>
                    </div>
                    <div className="p-5">
                      {stats?.lowStock?.length > 0 ? (
                        <div className="space-y-6">
                          {(() => {
                            const maxQuantity = Math.max(...stats.lowStock.map((i: any) => i.quantity || 0), 1);
                            const chartHeight = 200;
                            
                            return (
                              <div className="relative">
                                {/* Y-axis labels */}
                                <div className="flex items-end gap-3 h-[220px]">
                                  {stats.lowStock.map((item: any, index: number) => {
                                    const percentage = ((item.quantity || 0) / maxQuantity) * 100;
                                    const barHeight = (percentage / 100) * chartHeight;
                                    
                                    return (
                                      <Link key={item._id} href={`/admin/stock`} className="flex-1 group">
                                        <div className="flex flex-col items-center h-full justify-end cursor-pointer">
                                          {/* Bar */}
                                          <div 
                                            className="w-full rounded-t-lg bg-gradient-to-t from-brand-yellow to-yellow-400 hover:from-yellow-500 hover:to-brand-yellow transition-all duration-300 relative group-hover:shadow-lg"
                                            style={{ height: `${Math.max(barHeight, 8)}px` }}
                                          >
                                            {/* Quantity label on bar */}
                                            {barHeight > 20 && (
                                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                                <span className="text-xs font-bold text-brand-yellow bg-white dark:bg-gray-700 dark:text-yellow-400 px-1.5 py-0.5 rounded shadow-sm">
                                                  {item.quantity}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                          
                                          {/* Product name */}
                                          <div className="mt-2 w-full text-center">
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-brand-yellow dark:group-hover:text-yellow-400 transition-colors truncate" title={item.product?.name || 'Unknown Product'}>
                                              {item.product?.name || 'Unknown'}
                                            </p>
                                            {barHeight <= 20 && (
                                              <p className="text-xs font-bold text-brand-yellow mt-1">{item.quantity}</p>
                                            )}
                                          </div>
                                  </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                                
                                {/* X-axis line */}
                                <div className="border-t-2 border-gray-300 dark:border-gray-600 mt-4"></div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-green-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl dark:text-green-400">✓</span>
                          </div>
                          <p className="text-gray-400 dark:text-white text-sm">All items in stock</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Quality & Financial */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 hover:border-brand-green/30 dark:hover:border-gray-600 hover:shadow-xl transition-all duration-300">
                    <div className="p-5 border-b-2 border-gray-100 dark:border-gray-700 bg-gradient-to-r from-brand-green/5 dark:from-gray-800 to-transparent">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="w-10 h-10 bg-brand-green/10 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl">✅</span>
                        Recent Quality Checks
                      </h3>
                        <Link href="/admin/quality" className="text-xs text-brand-blue dark:text-blue-400 hover:text-brand-green dark:hover:text-green-400 font-medium">View all →</Link>
                      </div>
                    </div>
                    <div className="p-5">
                      {stats?.recentQCs?.length > 0 ? (
                        <div className="space-y-4">
                          {(() => {
                            // Calculate status counts
                            const statusCounts = stats.recentQCs.reduce((acc: any, qc: any) => {
                              const status = qc.overallStatus || 'Pending';
                              acc[status] = (acc[status] || 0) + 1;
                              return acc;
                            }, {});
                            
                            const total = stats.recentQCs.length;
                            const passed = statusCounts['Passed'] || 0;
                            const failed = statusCounts['Failed'] || 0;
                            const pending = statusCounts['Pending'] || 0;
                            
                            // Calculate percentages
                            const passedPercent = (passed / total) * 100;
                            const failedPercent = (failed / total) * 100;
                            const pendingPercent = (pending / total) * 100;
                            
                            return (
                              <div className="space-y-4">
                                {/* Total Summary */}
                                <div className="text-center mb-4">
                                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-300">Total Quality Checks</p>
                                </div>
                                
                                {/* Horizontal Bar Indicator */}
                                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden flex">
                                  {passed > 0 && (
                                    <div 
                                      className="bg-gradient-to-r from-brand-green to-green-600 flex items-center justify-center transition-all duration-500 hover:from-green-600 hover:to-brand-green"
                                      style={{ width: `${passedPercent}%` }}
                                    >
                                      {passedPercent > 10 && (
                                        <span className="text-xs font-bold text-white">{passedPercent.toFixed(0)}%</span>
                                      )}
                                    </div>
                                  )}
                                  {failed > 0 && (
                                    <div 
                                      className="bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center transition-all duration-500 hover:from-red-600 hover:to-red-500"
                                      style={{ width: `${failedPercent}%` }}
                                    >
                                      {failedPercent > 10 && (
                                        <span className="text-xs font-bold text-white">{failedPercent.toFixed(0)}%</span>
                                      )}
                                    </div>
                                  )}
                                  {pending > 0 && (
                                    <div 
                                      className="bg-gradient-to-r from-brand-yellow to-yellow-500 flex items-center justify-center transition-all duration-500 hover:from-yellow-500 hover:to-brand-yellow"
                                      style={{ width: `${pendingPercent}%` }}
                                    >
                                      {pendingPercent > 10 && (
                                        <span className="text-xs font-bold text-gray-900 dark:text-white">{pendingPercent.toFixed(0)}%</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Status Details */}
                        <div className="space-y-3">
                                  <Link href="/admin/quality" className="block">
                                    <div className="group cursor-pointer">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 bg-brand-green rounded-full"></div>
                                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Passed</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <p className="text-sm font-bold text-brand-green">{passed}</p>
                                          <p className="text-xs text-gray-500 dark:text-gray-300">({passedPercent.toFixed(0)}%)</p>
                                        </div>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="h-full bg-gradient-to-r from-brand-green to-green-600 rounded-full transition-all duration-500 group-hover:from-green-600 group-hover:to-brand-green"
                                          style={{ width: `${passedPercent}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </Link>
                                  
                                  <Link href="/admin/quality" className="block">
                                    <div className="group cursor-pointer">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                          <p className="text-sm font-semibold text-gray-900">Failed</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <p className="text-sm font-bold text-red-600">{failed}</p>
                                          <p className="text-xs text-gray-500 dark:text-gray-300">({failedPercent.toFixed(0)}%)</p>
                                        </div>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500 group-hover:from-red-600 group-hover:to-red-500"
                                          style={{ width: `${failedPercent}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </Link>
                                  
                                  {pending > 0 && (
                                    <Link href="/admin/quality" className="block">
                                      <div className="group cursor-pointer">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-brand-yellow rounded-full"></div>
                                            <p className="text-sm font-semibold text-gray-900">Pending</p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-brand-yellow">{pending}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-300">({pendingPercent.toFixed(0)}%)</p>
                                          </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div 
                                            className="h-full bg-gradient-to-r from-brand-yellow to-yellow-500 rounded-full transition-all duration-500 group-hover:from-yellow-500 group-hover:to-brand-yellow"
                                            style={{ width: `${pendingPercent}%` }}
                                          ></div>
                                        </div>
                                  </div>
                                    </Link>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl dark:text-green-400">✅</span>
                          </div>
                          <p className="text-gray-400 dark:text-white text-sm">No recent quality checks</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 hover:border-brand-blue/30 dark:hover:border-gray-600 hover:shadow-xl transition-all duration-300">
                    <div className="p-5 border-b-2 border-gray-100 dark:border-gray-700 bg-gradient-to-r from-brand-blue/5 dark:from-gray-800 to-transparent">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="w-10 h-10 bg-brand-blue/10 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl">🧾</span>
                        Recent Invoices
                      </h3>
                        <Link href="/admin/invoice" className="text-xs text-brand-blue dark:text-blue-400 hover:text-brand-green dark:hover:text-green-400 font-medium">View all →</Link>
                      </div>
                    </div>
                    <div className="p-0">
                      {stats?.recentInvoices?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <div className="max-h-96 overflow-y-auto">
                            <table className="w-full min-w-[800px]">
                              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                <tr>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 w-16">S.No.</th>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Invoice Number</th>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Party Name</th>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Type</th>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Amount</th>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Status</th>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Date</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {stats.recentInvoices.map((invoice: any, index: number) => (
                                  <tr 
                                    key={invoice._id} 
                                    onClick={() => router.push(`/admin/invoice/${invoice._id}`)}
                                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                                  >
                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <p className="text-sm font-medium text-gray-500 dark:text-gray-300">{index + 1}</p>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-blue dark:group-hover:text-blue-400 transition-colors">{invoice.invoiceNumber}</p>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <p className="text-sm text-gray-700 dark:text-gray-200">{invoice.partyName}</p>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <span className={`px-3 py-1 text-xs rounded-lg font-semibold ${
                                        invoice.type === 'Sales' || invoice.type === 'Outward' ? 'bg-brand-green/20 text-brand-green border border-brand-green/30' :
                                        invoice.type === 'Purchase' || invoice.type === 'Inward' ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30' :
                                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                      }`}>
                                        {invoice.type || 'N/A'}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <p className="text-sm font-bold text-gray-900 dark:text-white">₹{invoice.total.toLocaleString()}</p>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <span className={`px-3 py-1 text-xs rounded-lg font-semibold ${
                                        invoice.status === 'Paid' ? 'bg-brand-green/20 text-brand-green border border-brand-green/30' :
                                        invoice.status === 'Sent' ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30' :
                                        'bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30'
                                    }`}>
                                      {invoice.status}
                                    </span>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <p className="text-xs text-gray-500 dark:text-gray-300">
                                        {invoice.date ? new Date(invoice.date).toLocaleDateString() : invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '-'}
                                      </p>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                              </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 px-5">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">🧾</span>
                          </div>
                          <p className="text-gray-400 dark:text-white text-sm">No recent invoices</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Orders & Inspections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 hover:border-brand-yellow/30 dark:hover:border-gray-600 hover:shadow-xl transition-all duration-300">
                    <div className="p-5 border-b-2 border-gray-100 dark:border-gray-700 bg-gradient-to-r from-brand-yellow/5 dark:from-gray-800 to-transparent">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="w-10 h-10 bg-brand-yellow/10 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl">📝</span>
                        Recent Orders
                      </h3>
                        <Link href="/admin/order" className="text-xs text-brand-blue dark:text-blue-400 hover:text-brand-green dark:hover:text-green-400 font-medium">View all →</Link>
                      </div>
                    </div>
                    <div className="p-0">
                      {stats?.recentOrders?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <div className="max-h-96 overflow-y-auto scrollbar-hide">
                            <table className="w-full">
                              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                <tr>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 w-16">S.No.</th>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Order Number</th>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Customer Name</th>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Status</th>
                                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Date</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {stats.recentOrders.map((order: any, index: number) => (
                                  <tr 
                                    key={order._id} 
                                    onClick={() => router.push(`/admin/order/${order._id}`)}
                                    className="hover:bg-yellow-50/50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                                  >
                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <p className="text-sm font-medium text-gray-500 dark:text-gray-300">{index + 1}</p>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-yellow dark:group-hover:text-yellow-400 transition-colors">{order.orderNumber}</p>
                                    </td>
                                    <td className="px-5 py-3">
                                      <p className="text-sm text-gray-700 dark:text-gray-200">{order.customerName}</p>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <span className={`px-3 py-1 text-xs rounded-lg font-semibold ${
                                        order.status === 'Completed' ? 'bg-brand-green/20 text-brand-green border border-brand-green/30' :
                                        order.status === 'In Production' ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30' :
                                        'bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30'
                                  }`}>
                                    {order.status}
                                  </span>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <p className="text-xs text-gray-500 dark:text-gray-300">
                                        {order.date ? new Date(order.date).toLocaleDateString() : order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                                      </p>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                              </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 px-5">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">📝</span>
                          </div>
                          <p className="text-gray-400 dark:text-white text-sm">No recent orders</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 hover:border-brand-green/30 dark:hover:border-gray-600 hover:shadow-xl transition-all duration-300">
                    <div className="p-5 border-b-2 border-gray-100 dark:border-gray-700 bg-gradient-to-r from-brand-green/5 dark:from-gray-800 to-transparent">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="w-10 h-10 bg-brand-green/10 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl">👥</span>
                        Upcoming Inspections
                      </h3>
                        <Link href="/admin/customer-inspection" className="text-xs text-brand-blue dark:text-blue-400 hover:text-brand-green dark:hover:text-green-400 font-medium">View all →</Link>
                      </div>
                    </div>
                    <div className="p-5">
                      {stats?.recentInspections?.length > 0 ? (
                        <div>
                          {(() => {
                            // Filter inspections based on customer selection
                            let filteredInspections = stats.recentInspections;
                            if (selectedInspection !== 'all') {
                              filteredInspections = stats.recentInspections.filter((inspection: any) => 
                                inspection.customerName === selectedInspection
                              );
                            }
                            
                            // Group inspections by date
                            const inspectionsByDate: any = {};
                            filteredInspections.forEach((inspection: any) => {
                              const date = new Date(inspection.scheduledDate);
                              const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                              if (!inspectionsByDate[dateKey]) {
                                inspectionsByDate[dateKey] = [];
                              }
                              inspectionsByDate[dateKey].push(inspection);
                            });
                            
                            // Get first day of month and number of days
                            const firstDay = new Date(selectedYear, selectedMonth, 1);
                            const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
                            const daysInMonth = lastDay.getDate();
                            const startingDayOfWeek = firstDay.getDay();
                            
                            // Adjust for Monday as first day
                            const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
                            
                            const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                            
                            // Create calendar days array
                            const calendarDays = [];
                            
                            // Add empty cells for days before month starts
                            for (let i = 0; i < adjustedStartDay; i++) {
                              calendarDays.push(null);
                            }
                            
                            // Add days of the month
                            for (let day = 1; day <= daysInMonth; day++) {
                              const dateKey = `${selectedYear}-${selectedMonth}-${day}`;
                              const date = new Date(selectedYear, selectedMonth, day);
                              const isToday = date.toDateString() === new Date().toDateString();
                              const inspections = inspectionsByDate[dateKey] || [];
                              
                              calendarDays.push({
                                day,
                                date,
                                isToday,
                                inspections,
                                hasInspections: inspections.length > 0
                              });
                            }
                            
                            // Get unique customer names and assign colors
                            const uniqueCustomers: string[] = Array.from(new Set(stats.recentInspections.map((i: any) => i.customerName || 'Unknown'))) as string[];
                            
                            // Color palette for customers (solid colors)
                            const customerColors = [
                              { bg: 'bg-brand-blue', text: 'text-white', dot: 'bg-brand-blue' },
                              { bg: 'bg-brand-green', text: 'text-white', dot: 'bg-brand-green' },
                              { bg: 'bg-brand-yellow', text: 'text-gray-900', dot: 'bg-brand-yellow' },
                              { bg: 'bg-purple-500', text: 'text-white', dot: 'bg-purple-500' },
                              { bg: 'bg-pink-500', text: 'text-white', dot: 'bg-pink-500' },
                              { bg: 'bg-indigo-500', text: 'text-white', dot: 'bg-indigo-500' },
                              { bg: 'bg-orange-500', text: 'text-white', dot: 'bg-orange-500' },
                            ];
                            
                            // Create customer color map
                            const customerColorMap: any = {};
                            uniqueCustomers.forEach((customer, index) => {
                              customerColorMap[customer] = customerColors[index % customerColors.length];
                            });
                            
                            return (
                        <div className="space-y-3">
                                {/* Month and Inspection Dropdowns */}
                                <div className="flex gap-2">
                                  <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                                  >
                                    {monthNames.map((month, index) => (
                                      <option key={index} value={index}>
                                        {month} {selectedYear}
                                      </option>
                                    ))}
                                  </select>
                                  
                                  <select
                                    value={selectedInspection}
                                    onChange={(e) => setSelectedInspection(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                                  >
                                    <option value="all">All Customers</option>
                                    {uniqueCustomers.map((customer: string) => (
                                      <option key={customer} value={customer}>{customer}</option>
                                    ))}
                                  </select>
                                </div>
                                
                                {/* Calendar Grid - Reduced Size */}
                                <div className="grid grid-cols-7 gap-1 max-w-md mx-auto">
                                  {/* Day Headers */}
                                  {daysOfWeek.map((day) => (
                                    <div key={day} className="text-center py-0.5">
                                      <p className="text-[9px] font-semibold text-gray-600 dark:text-gray-300">{day}</p>
                                    </div>
                                  ))}
                                  
                                  {/* Calendar Days */}
                                  {calendarDays.map((calendarDay, index) => {
                                    if (!calendarDay) {
                                      return <div key={`empty-${index}`} className="w-6 h-6"></div>;
                                    }
                                    
                                    const customerNames = calendarDay.inspections.map((i: any) => i.customerName || 'Unknown') as string[];
                                    const uniqueCustomersOnDate = Array.from(new Set(customerNames));
                                    const hasMultipleCustomers = uniqueCustomersOnDate.length > 1;
                                    const firstCustomerColor = uniqueCustomersOnDate.length > 0 ? customerColorMap[uniqueCustomersOnDate[0]] : null;
                                    const secondCustomerColor = uniqueCustomersOnDate.length > 1 ? customerColorMap[uniqueCustomersOnDate[1]] : null;
                                    
                                    return (
                                      <div
                                        key={calendarDay.day}
                                        className="w-6 h-6 rounded-full cursor-pointer transition-all group relative overflow-hidden flex items-center justify-center mx-auto"
                                      >
                                        {/* Background colors - split if multiple customers */}
                                        {calendarDay.hasInspections ? (
                                          hasMultipleCustomers ? (
                                            <>
                                              <div className={`absolute inset-0 ${firstCustomerColor?.bg || 'bg-gray-300'} rounded-full`} style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                                              <div className={`absolute inset-0 ${secondCustomerColor?.bg || 'bg-gray-400'} rounded-full`} style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
                                            </>
                                          ) : (
                                            <div className={`absolute inset-0 ${firstCustomerColor?.bg || 'bg-gray-300'} rounded-full`}></div>
                                          )
                                        ) : (
                                          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 rounded-full"></div>
                                        )}
                                        
                                        {/* Date number */}
                                        <span className={`relative z-10 text-[10px] font-semibold ${
                                          calendarDay.hasInspections && firstCustomerColor
                                            ? firstCustomerColor.text
                                            : 'text-gray-700 dark:text-gray-200'
                                        }`}>
                                          {calendarDay.day}
                                        </span>
                                        
                                        {/* Hover tooltip */}
                                        {calendarDay.hasInspections && (
                                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-48">
                                            <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                                              <div className="font-semibold mb-2">
                                                {calendarDay.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                              </div>
                                              <div className="space-y-1">
                                                {calendarDay.inspections.map((inspection: any, idx: number) => {
                                                  const customerColor = customerColorMap[inspection.customerName || 'Unknown'] || customerColors[0];
                                                  return (
                                                    <div key={idx} className="flex items-center gap-2">
                                                      <div className={`w-2 h-2 ${customerColor.dot} rounded-full`}></div>
                                                      <div className="flex-1">
                                                        <div className="font-medium">{inspection.inspectionNumber}</div>
                                                        <div className="text-gray-300 text-[10px]">{inspection.customerName}</div>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                {/* Customer Color Legend */}
                                {uniqueCustomers.length > 0 && (
                                  <div className="pt-2 border-t border-gray-200">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                      {uniqueCustomers.slice(0, 6).map((customer: string) => {
                                        const color = customerColorMap[customer] || customerColors[0];
                                        return (
                                          <div key={customer} className="flex items-center gap-1.5">
                                            <div className={`w-3 h-3 ${color.bg} rounded`}></div>
                                            <span className="text-xs text-gray-600 truncate">{customer}</span>
                                          </div>
                                        );
                                      })}
                                      {uniqueCustomers.length > 6 && (
                                        <div className="flex items-center gap-1.5">
                                          <div className="w-3 h-3 bg-gray-200 rounded"></div>
                                          <span className="text-xs text-gray-600">+{uniqueCustomers.length - 6} more</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">👥</span>
                          </div>
                          <p className="text-gray-400 dark:text-white text-sm">No upcoming inspections</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-brand-blue/20 border-t-brand-blue mb-4"></div>
                <p className="text-gray-600 font-medium">Loading dashboard...</p>
                <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your data</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

