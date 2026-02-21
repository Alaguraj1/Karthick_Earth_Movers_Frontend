'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import IconMenuCharts from '@/components/icon/menu/icon-menu-charts';
import IconCalendar from '@/components/icon/menu/icon-menu-calendar';

const MachineCostAnalysis = () => {
    const [report, setReport] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const fetchReport = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/vehicle-cost`, {
                params: { startDate: dateRange.start, endDate: dateRange.end }
            });
            if (data.success) setReport(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    return (
        <div className="space-y-6">
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><Link href="/" className="text-primary hover:underline font-bold">Dashboard</Link></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 font-bold text-white-dark uppercase tracking-widest text-[10px]"><span>Machine & Vehicle</span></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 font-bold text-white-dark uppercase tracking-widest text-[10px]"><span>Cost Analysis</span></li>
            </ul>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 panel p-6 rounded-2xl shadow-xl border-none">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                        <IconMenuCharts className="w-6 h-6" />
                    </div>
                    <div>
                        <h5 className="text-xl font-black text-black dark:text-white-light uppercase">Cost per Machine (மொத்த செலவு)</h5>
                        <p className="text-white-dark text-xs font-bold tracking-widest uppercase mt-1">Total operational expenditure (Fuel + Maintenance + Wages)</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-gray-100 dark:bg-dark-light/10 rounded-xl px-4 py-2">
                        <IconCalendar className="w-4 h-4 text-primary mr-3" />
                        <input type="date" className="bg-transparent border-none text-xs font-bold focus:ring-0" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
                        <span className="mx-2 text-white-dark">to</span>
                        <input type="date" className="bg-transparent border-none text-xs font-bold focus:ring-0" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
                    </div>
                    <button onClick={fetchReport} className="btn btn-primary rounded-xl h-11 px-6 font-black uppercase text-[10px] tracking-widest">Refresh</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="panel h-60 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl"></div>
                    ))
                ) : report.length === 0 ? (
                    <div className="col-span-full panel py-20 text-center text-white-dark uppercase font-black tracking-widest text-sm opacity-20 border-none shadow-xl">No expense data found for assets</div>
                ) : (
                    report.map((item) => (
                        <div key={item._id} className="panel p-0 border-none shadow-2xl rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all duration-500">
                            <div className="bg-gradient-to-br from-primary to-indigo-700 p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <h6 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-1">{item.vehicleCategory || item.vehicleType || 'Asset'}</h6>
                                        <h3 className="text-2xl font-black truncate">{item._id}</h3>
                                    </div>
                                    {item.vehicleType && (
                                        <span className="bg-white/20 text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest">
                                            {item.vehicleType}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-8">
                                    <h6 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-1">Total Expenditure</h6>
                                    <div className="text-4xl font-black">₹{item.totalCost?.toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4 bg-white dark:bg-black/40">
                                <div className="flex justify-between items-center group/row">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-success"></div>
                                        <span className="text-xs font-bold uppercase text-white-dark group-hover/row:text-black dark:group-hover/row:text-white transition-colors">Fuel Consumption</span>
                                    </div>
                                    <span className="font-black text-black dark:text-white">₹{item.fuelCost?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between items-center group/row">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-info"></div>
                                        <span className="text-xs font-bold uppercase text-white-dark group-hover/row:text-black dark:group-hover/row:text-white transition-colors">Maintenance / Repairs</span>
                                    </div>
                                    <span className="font-black text-black dark:text-white">₹{item.maintenanceCost?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between items-center group/row">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-warning"></div>
                                        <span className="text-xs font-bold uppercase text-white-dark group-hover/row:text-black dark:group-hover/row:text-white transition-colors">Operator Wages</span>
                                    </div>
                                    <span className="font-black text-black dark:text-white">₹{item.operatorWages?.toLocaleString() || 0}</span>
                                </div>
                                {item.otherCosts > 0 && (
                                    <div className="flex justify-between items-center group/row">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                            <span className="text-xs font-bold uppercase text-white-dark group-hover/row:text-black dark:group-hover/row:text-white transition-colors">Other Expenses</span>
                                        </div>
                                        <span className="font-black text-black dark:text-white">₹{item.otherCosts?.toLocaleString() || 0}</span>
                                    </div>
                                )}

                                <div className="pt-4 mt-2 border-t border-gray-100 dark:border-white-light/5">
                                    <Link href={`/assets/maintenance?vehicle=${encodeURIComponent(item._id)}`} className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline flex items-center justify-end">
                                        View Detailed Breakdown →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MachineCostAnalysis;
