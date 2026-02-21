'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import IconCalendar from '@/components/icon/menu/icon-menu-calendar';
import IconPlus from '@/components/icon/icon-plus';

const FuelLog = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [filter, setFilter] = useState({ vehicle: '', startDate: '', endDate: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/fuel-tracking`, {
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
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 font-bold text-white-dark uppercase tracking-widest text-[10px]"><span>Fuel Tracking</span></li>
            </ul>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 panel p-6 rounded-2xl shadow-xl border-none">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-success/10 text-success rounded-xl">
                        <IconCalendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h5 className="text-xl font-black text-black dark:text-white-light uppercase">Fuel Tracking (எரிபொருள் கண்காணிப்பு)</h5>
                        <p className="text-white-dark text-xs font-bold tracking-widest uppercase mt-1">Diesel tracking and analysis for all assets</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <select
                        className="form-select border-2 font-bold rounded-xl h-12 w-full md:w-60"
                        value={filter.vehicle}
                        onChange={(e) => setFilter({ ...filter, vehicle: e.target.value })}
                    >
                        <option value="">All Machines / Vehicles</option>
                        {vehicles.map((v) => (
                            <option key={v._id} value={v.name + (v.vehicleNumber ? ` (${v.vehicleNumber})` : '')}>
                                {v.name} {v.vehicleNumber ? `(${v.vehicleNumber})` : ''}
                            </option>
                        ))}
                    </select>
                    <Link href="/expenses/diesel" className="btn btn-success shadow-[0_10px_20px_rgba(0,171,85,0.3)] rounded-xl py-3 px-6 font-black uppercase tracking-widest text-[10px]">
                        <IconPlus className="mr-2" /> Fill Fuel
                    </Link>
                </div>
            </div>

            <div className="panel shadow-lg rounded-2xl border-none overflow-hidden">
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr className="!bg-success/5">
                                <th className="font-black uppercase tracking-widest text-[10px] py-4">Date</th>
                                <th className="font-black uppercase tracking-widest text-[10px] py-4">Machine / Vehicle</th>
                                <th className="font-black uppercase tracking-widest text-[10px] py-4 text-center">Quantity (Liters)</th>
                                <th className="font-black uppercase tracking-widest text-[10px] py-4 text-center">Rate (₹)</th>
                                <th className="font-black uppercase tracking-widest text-[10px] py-4 text-right">Total Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="font-bold">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-20 uppercase tracking-[0.2em] text-xs font-black opacity-30">Analyzing Fuel Data...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-20 text-white-dark uppercase font-black tracking-widest text-sm opacity-20">No fuel records found</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-success/5 transition-all">
                                        <td>{new Date(log.date).toLocaleDateString()}</td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="text-black dark:text-white-light">{log.vehicleOrMachine || '-'}</span>
                                                <span className="text-[10px] text-white-dark uppercase tracking-widest">{log.meterReading ? `Reading: ${log.meterReading}` : ''}</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="bg-success/10 text-success px-3 py-1 rounded-lg text-sm">{log.quantity} L</span>
                                        </td>
                                        <td className="text-center text-white-dark">₹{log.rate}</td>
                                        <td className="text-right text-success font-black text-lg">₹{log.amount?.toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FuelLog;
