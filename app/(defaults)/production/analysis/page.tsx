'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import IconTrendingUp from '@/components/icon/icon-trending-up';
import IconCashBanknotes from '@/components/icon/icon-cash-banknotes';
import IconChartSquare from '@/components/icon/icon-chart-square';

const ProductionAnalysis = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch production report and expense report
            const [prodRes, expRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/production/stock-report`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/expenses`)
            ]);

            const productionValue = prodRes.data.data.reduce((acc: number, item: any) => acc + (item.produced * (item.defaultPrice || 0)), 0);
            const totalExpenses = expRes.data.data.reduce((acc: number, item: any) => acc + (item.amount || 0), 0);

            // Simplified breakdown for display
            const expenseBreakdown = {
                Diesel: expRes.data.data.filter((e: any) => e.category === 'Diesel').reduce((acc: number, e: any) => acc + e.amount, 0),
                Wages: expRes.data.data.filter((e: any) => e.category === 'Labour Wages').reduce((acc: number, e: any) => acc + e.amount, 0),
                Maintenance: expRes.data.data.filter((e: any) => e.category === 'Machine Maintenance').reduce((acc: number, e: any) => acc + e.amount, 0),
                Others: expRes.data.data.filter((e: any) => !['Diesel', 'Labour Wages', 'Machine Maintenance'].includes(e.category)).reduce((acc: number, e: any) => acc + e.amount, 0)
            };

            setStats({
                productionValue,
                totalExpenses,
                netProfit: productionValue - totalExpenses,
                breakdown: expenseBreakdown
            });
        } catch (error) {
            console.error('Error fetching analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center font-black uppercase opacity-20 tracking-widest">Calculating Performance...</div>;

    const profitColor = stats?.netProfit >= 0 ? 'text-success' : 'text-danger';

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-black uppercase tracking-tight">Production vs Expense Comparison (உற்பத்தி vs செலவு ஒப்பீடு)</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Production Value */}
                <div className="panel bg-[#eaf1ff] dark:bg-[#1a2941] border-none shadow-xl rounded-3xl p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="bg-primary/20 p-3 rounded-2xl text-primary"><IconTrendingUp className="w-6 h-6" /></div>
                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">Market Valuation</span>
                    </div>
                    <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-white-dark mb-1">Production Value</h6>
                    <div className="text-4xl font-black text-primary">₹{stats?.productionValue.toLocaleString()}</div>
                    <p className="mt-4 text-[10px] font-bold text-white-dark uppercase tracking-widest opacity-60">Total value based on master prices</p>
                </div>

                {/* Total Expense */}
                <div className="panel bg-[#fff3f3] dark:bg-[#2e1616] border-none shadow-xl rounded-3xl p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="bg-danger/20 p-3 rounded-2xl text-danger"><IconCashBanknotes className="w-6 h-6" /></div>
                        <span className="text-[10px] font-black uppercase text-danger tracking-widest">Expenditure</span>
                    </div>
                    <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-white-dark mb-1">Total Expense</h6>
                    <div className="text-4xl font-black text-danger">₹{stats?.totalExpenses.toLocaleString()}</div>
                    <p className="mt-4 text-[10px] font-bold text-white-dark uppercase tracking-widest opacity-60">Cumulative operational costs</p>
                </div>

                {/* Net Profit */}
                <div className={`panel ${stats?.netProfit >= 0 ? 'bg-[#f0fff4] dark:bg-[#11261a]' : 'bg-[#fff5f5] dark:bg-[#281616]'} border-none shadow-xl rounded-3xl p-8 border-b-8 ${stats?.netProfit >= 0 ? 'border-success' : 'border-danger'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <div className={`bg-${stats?.netProfit >= 0 ? 'success' : 'danger'}/20 p-3 rounded-2xl text-${stats?.netProfit >= 0 ? 'success' : 'danger'}`}><IconChartSquare className="w-6 h-6" /></div>
                        <span className={`text-[10px] font-black uppercase text-${stats?.netProfit >= 0 ? 'success' : 'danger'} tracking-widest`}>Performance</span>
                    </div>
                    <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-white-dark mb-1">Estimated Net Profit</h6>
                    <div className={`text-4xl font-black ${profitColor}`}>₹{stats?.netProfit.toLocaleString()}</div>
                    <p className="mt-4 text-[10px] font-bold text-white-dark uppercase tracking-widest opacity-60">Production Value – Total Expense</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                {/* Expense Breakdown */}
                <div className="panel border-none shadow-xl rounded-3xl p-8">
                    <h4 className="text-xl font-black uppercase tracking-tight mb-8">Cost Distribution</h4>
                    <div className="space-y-6">
                        {Object.entries(stats?.breakdown || {}).map(([key, value]: any) => (
                            <div key={key}>
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                                    <span>{key}</span>
                                    <span className="text-white-dark">₹{value.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full bg-primary`}
                                        style={{ width: `${(value / (stats?.totalExpenses || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Analysis Info */}
                <div className="panel border-none shadow-2xl rounded-3xl p-10 bg-gradient-to-br from-primary to-indigo-900 text-white flex flex-col justify-center">
                    <h3 className="text-3xl font-black uppercase mb-6 leading-tight">Business Performance Analysis</h3>
                    <p className="text-white/70 font-medium leading-relaxed mb-8">
                        This module compares your total stone production value against operational expenses like Fuel, Labour, and Maintenance.
                        It helps you understand if your quarry operations are generating a net profit.
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/10 p-4 rounded-2xl">
                            <h5 className="text-xl font-black">₹{stats?.productionValue.toLocaleString()}</h5>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Assets Produced</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl">
                            <h5 className="text-xl font-black">₹{stats?.totalExpenses.toLocaleString()}</h5>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Total Burn</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductionAnalysis;
