'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import IconPlus from '@/components/icon/icon-plus';
import IconMenuWidgets from '@/components/icon/menu/icon-menu-widgets';

const MaintenanceHistory = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [filter, setFilter] = useState({ vehicle: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/maintenance-history`, {
                params: { vehicleOrMachine: filter.vehicle }
            });
            if (data.success) setLogs(data.data);

            const { data: vData } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/master/vehicles`);
            if (vData.success) setVehicles(vData.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter.vehicle]);

    return (
        <div className="space-y-6">
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><Link href="/" className="text-primary hover:underline font-bold">Dashboard</Link></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 font-bold text-white-dark uppercase tracking-widest text-[10px]"><span>Machine & Vehicle</span></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 font-bold text-white-dark uppercase tracking-widest text-[10px]"><span>Maintenance</span></li>
            </ul>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 panel p-6 rounded-2xl shadow-xl border-none">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-info/10 text-info rounded-xl">
                        <IconMenuWidgets className="w-6 h-6" />
                    </div>
                    <div>
                        <h5 className="text-xl font-black text-black dark:text-white-light uppercase">Service & Repair History</h5>
                        <p className="text-white-dark text-xs font-bold tracking-widest uppercase mt-1">Maintenance and breakdown tracking</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <select
                        className="form-select border-2 font-bold rounded-xl h-12 w-full md:w-60"
                        value={filter.vehicle}
                        onChange={(e) => setFilter({ ...filter, vehicle: e.target.value })}
                    >
                        <option value="">All Assets</option>
                        {vehicles.map((v) => (
                            <option key={v._id} value={v.name + (v.vehicleNumber ? ` (${v.vehicleNumber})` : '')}>
                                {v.name} {v.vehicleNumber ? `(${v.vehicleNumber})` : ''}
                            </option>
                        ))}
                    </select>
                    <Link href="/expenses/machine-maintenance" className="btn btn-info shadow-[0_10px_20px_rgba(33,150,243,0.3)] rounded-xl py-3 px-6 font-black uppercase tracking-widest text-[10px]">
                        <IconPlus className="mr-2" /> Log Service
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="text-center py-20 uppercase tracking-[0.2em] text-xs font-black opacity-30">Retrieving Maintenance Data...</div>
                ) : logs.length === 0 ? (
                    <div className="panel py-20 text-center text-white-dark uppercase font-black tracking-widest text-sm opacity-20 border-none shadow-xl">No maintenance records found</div>
                ) : (
                    logs.map((log) => (
                        <div key={log._id} className="panel p-0 border-none shadow-xl rounded-2xl overflow-hidden hover:scale-[1.01] transition-all duration-300">
                            <div className="bg-info/5 p-4 flex flex-wrap items-center justify-between gap-4 border-b border-info/10">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white dark:bg-black p-2 px-4 rounded-xl shadow-sm">
                                        <span className="text-[10px] font-black uppercase text-info block">Service Date</span>
                                        <span className="font-bold text-sm">{new Date(log.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="bg-white dark:bg-black p-2 px-4 rounded-xl shadow-sm">
                                        <span className="text-[10px] font-black uppercase text-info block">Asset Identification</span>
                                        <span className="font-bold text-sm uppercase">{log.vehicleOrMachine || '-'}</span>
                                    </div>
                                    {log.nextServiceDate && (
                                        <div className="bg-warning/10 p-2 px-4 rounded-xl shadow-sm border border-warning/20">
                                            <span className="text-[10px] font-black uppercase text-warning block">Next Service Due</span>
                                            <span className="font-black text-sm text-warning">{new Date(log.nextServiceDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-info text-white p-3 px-6 rounded-xl font-black text-lg">
                                    ₹{log.amount?.toLocaleString()}
                                </div>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-white-dark block mb-2 tracking-widest">Problem & Spares</span>
                                    <p className="font-bold text-black dark:text-white-light leading-relaxed">{log.maintenanceType || 'Routine Maintenance'}</p>
                                    <p className="text-xs text-info mt-1 font-bold">Spares: {log.description || 'General parts changed'}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-white-light/5 p-4 rounded-xl">
                                    <span className="text-[10px] font-black uppercase text-white-dark block mb-2 tracking-widest">Financial Breakdown</span>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold">Spare Parts:</span>
                                        <span className="font-bold">₹{log.sparePartsCost || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold">Labour Cost:</span>
                                        <span className="font-bold">₹{log.labourCharge || 0}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase text-white-dark block mb-2 tracking-widest">Service Provider</span>
                                    <p className="font-bold text-black dark:text-white-light">{log.vendorName || 'In-house Team'}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase text-white-dark block mb-2 tracking-widest">Hour / Meter Reading</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-info animate-pulse"></div>
                                        <p className="font-black text-xl text-info">{log.meterReading || '-'} <span className="text-xs font-bold opacity-70">HRS/KM</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MaintenanceHistory;
