'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import IconBox from '@/components/icon/icon-box';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconMenuCharts from '@/components/icon/menu/icon-menu-charts';

const StockTracking = () => {
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/production/stock-report`);
            setReport(data.data);
        } catch (error) {
            console.error('Error fetching stock report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black uppercase tracking-tight">Quantity Tracking (அளவு கண்காணிப்பு)</h2>
                <button className="btn btn-outline-primary rounded-xl font-black uppercase tracking-widest text-[10px]" onClick={fetchData}>Refresh Inventory</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="panel h-60 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl border-none"></div>
                    ))
                ) : report.length === 0 ? (
                    <div className="col-span-full panel py-20 text-center text-white-dark uppercase font-black tracking-widest text-sm opacity-20 border-none shadow-xl">No production items configured</div>
                ) : (
                    report.map((item: any) => (
                        <div key={item._id} className="panel p-0 border-none shadow-2xl rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all duration-500">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <h6 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-1">Stone Variant</h6>
                                        <h3 className="text-3xl font-black uppercase">{item.name}</h3>
                                    </div>
                                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                        <IconBox className="w-6 h-6" />
                                    </div>
                                </div>

                                <div className="mt-12 relative z-10">
                                    <h6 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-1">Total Stock Available</h6>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black tabular-nums">{item.balance.toLocaleString()}</span>
                                        <span className="text-sm font-black opacity-70 uppercase tracking-widest">{item.unit}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-6 bg-white dark:bg-black/20">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="panel bg-success/5 border-success/10 p-4 rounded-2xl flex items-center gap-4">
                                        <div className="bg-success/20 p-2 rounded-lg text-success"><IconCaretDown className="w-4 h-4" /></div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-white-dark tracking-widest">Incoming (Total)</p>
                                            <p className="text-base font-black text-success">+{item.produced.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="panel bg-danger/5 border-danger/10 p-4 rounded-2xl flex items-center gap-4">
                                        <div className="bg-danger/20 p-2 rounded-lg text-danger"><IconCaretDown className="w-4 h-4 rotate-180" /></div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-white-dark tracking-widest">Outgoing (Total)</p>
                                            <p className="text-base font-black text-danger">-{item.dispatched.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white-dark font-bold uppercase tracking-widest">Market Value Estimate</span>
                                        <span className="font-black text-primary">₹{(item.produced * (item.defaultPrice || 0)).toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div className="bg-primary h-full rounded-full w-[100%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="panel border-none shadow-xl rounded-2xl p-8 bg-black text-white relative overflow-hidden mt-12">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <IconMenuCharts className="w-40 h-40 rtl:rotate-180" />
                </div>
                <div className="relative z-10 md:max-w-xl">
                    <h4 className="text-2xl font-black uppercase tracking-tight mb-4">Live Stock Control</h4>
                    <p className="text-gray-400 font-medium text-sm leading-relaxed">
                        This dashboard calculates real-time balance stock by comparing **Total Production** quantity against **Live Sales** invoices.
                        Formula: `(Opening Stock + Produced) - Sold = Current Stock`.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <div className="px-4 py-2 bg-success/20 text-success rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                            Sales Aggregation Active
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockTracking;
