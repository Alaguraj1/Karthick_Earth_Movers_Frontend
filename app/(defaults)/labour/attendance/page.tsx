'use client';
import React, { useState, useEffect, useMemo } from 'react';
import IconSave from '@/components/icon/icon-save';
import IconUsers from '@/components/icon/menu/icon-menu-users';
import IconCalendar from '@/components/icon/menu/icon-menu-calendar';
import IconChecks from '@/components/icon/icon-checks';
import IconX from '@/components/icon/icon-x';
import IconSearch from '@/components/icon/icon-search';
import axios from 'axios';
import Swal from 'sweetalert2';

const AttendancePage = () => {
    const [labours, setLabours] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<any>({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'Direct' | 'Vendor'>('all');
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

    const fetchLaboursAndAttendance = async () => {
        setLoading(true);
        try {
            const { data: labourJson } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/labour`);
            if (labourJson.success) {
                const activeLabours = labourJson.data.filter((l: any) => l.status === 'active');
                setLabours(activeLabours);

                const initial: any = {};
                activeLabours.forEach((l: any) => {
                    initial[l._id] = { status: null, overtimeHours: 0 };
                });

                const { data: attJson } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/labour/attendance?date=${selectedDate}`);
                if (attJson.success && attJson.data.length > 0) {
                    attJson.data.forEach((record: any) => {
                        // Extract labour ID from populated object or ID string
                        const labourId = record.labour?._id || record.labour;
                        if (labourId && initial[labourId]) {
                            initial[labourId] = {
                                status: record.status,
                                overtimeHours: record.overtimeHours || 0
                            };
                        }
                    });
                }
                setAttendanceData(initial);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLaboursAndAttendance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);

    const handleStatusChange = (labourId: string, status: string) => {
        setAttendanceData((prev: any) => ({
            ...prev,
            [labourId]: { ...prev[labourId], status }
        }));
    };

    const handleOvertimeChange = (labourId: string, hours: number) => {
        setAttendanceData((prev: any) => ({
            ...prev,
            [labourId]: { ...prev[labourId], overtimeHours: hours }
        }));
    };

    const handleBulkMarkPresent = () => {
        const updated = { ...attendanceData };
        filteredLabours.forEach(l => {
            updated[l._id] = { ...updated[l._id], status: 'Present' };
        });
        setAttendanceData(updated);
    };

    const handleBulkMarkAbsent = () => {
        const updated = { ...attendanceData };
        filteredLabours.forEach(l => {
            updated[l._id] = { ...updated[l._id], status: 'Absent' };
        });
        setAttendanceData(updated);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const dataToSave = Object.keys(attendanceData)
                .filter(id => attendanceData[id].status !== null && attendanceData[id].status !== '')
                .map(id => ({
                    labour: id,
                    ...attendanceData[id]
                }));

            if (dataToSave.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No Selection',
                    text: 'Please select an attendance option for at least one worker.',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
                setSaving(false);
                return;
            }

            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/labour/attendance`, {
                date: selectedDate,
                attendanceData: dataToSave
            });

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Attendance Saved!',
                    text: 'Attendance saved successfully!',
                    timer: 2000,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true
                });
                // Re-fetch to ensure local state matches server
                await fetchLaboursAndAttendance();
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save attendance' });
        } finally {
            setSaving(false);
        }
    };

    // Filter labours based on search and type
    const filteredLabours = useMemo(() => {
        return labours.filter(l => {
            const matchSearch = l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                l.workType?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchType = filterType === 'all' || l.labourType === filterType;
            return matchSearch && matchType;
        });
    }, [labours, searchQuery, filterType]);

    // Group labours by type
    const directLabours = filteredLabours.filter(l => l.labourType === 'Direct' || !l.labourType);
    const vendorLabours = filteredLabours.filter(l => l.labourType === 'Vendor');

    // Stats
    const stats = {
        total: labours.length,
        present: Object.values(attendanceData).filter((a: any) => a.status === 'Present').length,
        absent: Object.values(attendanceData).filter((a: any) => a.status === 'Absent').length,
        halfDay: Object.values(attendanceData).filter((a: any) => a.status === 'Half Day').length,
    };

    const presentPercent = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

    const getInitials = (name: string) => {
        return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            'from-blue-500 to-blue-600', 'from-emerald-500 to-emerald-600',
            'from-violet-500 to-violet-600', 'from-amber-500 to-amber-600',
            'from-rose-500 to-rose-600', 'from-cyan-500 to-cyan-600',
            'from-indigo-500 to-indigo-600', 'from-orange-500 to-orange-600',
        ];
        const idx = (name?.charCodeAt(0) || 0) % colors.length;
        return colors[idx];
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr + 'T00:00:00');
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `${days[d.getDay()]}, ${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    };

    const renderWorkerCard = (labour: any) => {
        const status = attendanceData[labour._id]?.status || null;
        const isVendor = labour.labourType === 'Vendor';

        return (
            <div
                key={labour._id}
                className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 hover:shadow-xl ${status === 'Present'
                    ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-900/20 dark:to-gray-800 dark:border-emerald-800'
                    : status === 'Half Day'
                        ? 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-900/20 dark:to-gray-800 dark:border-amber-800'
                        : status === 'Absent'
                            ? 'border-red-200 bg-gradient-to-br from-red-50/80 to-white dark:from-red-900/20 dark:to-gray-800 dark:border-red-800'
                            : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700'
                    }`}
            >
                {/* Status Indicator Strip */}
                <div className={`h-1 w-full ${status === 'Present' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                    status === 'Half Day' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                        status === 'Absent' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                            'bg-gray-200 dark:bg-gray-700'
                    }`}></div>

                <div className="p-4">
                    {/* Worker Info Row */}
                    <div className="flex items-center gap-3 mb-4">
                        {/* Avatar */}
                        <div className={`flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br ${getAvatarColor(labour.name)} flex items-center justify-center text-white font-black text-sm shadow-lg`}>
                            {getInitials(labour.name)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900 dark:text-white truncate text-[15px]">{labour.name}</h4>
                                {isVendor && (
                                    <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-md bg-violet-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
                                        Contractor
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{labour.workType || 'General'}</span>
                                {labour.wage > 0 && (
                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">₹{labour.wage}/{labour.wageType === 'Monthly' ? 'mo' : 'day'}</span>
                                )}
                            </div>
                        </div>

                        {/* Overtime */}
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">OT Hrs</span>
                            <input
                                type="number"
                                className="w-14 h-9 text-center font-black text-sm border-2 rounded-xl border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white dark:bg-gray-700 dark:text-white"
                                min="0" max="12"
                                value={attendanceData[labour._id]?.overtimeHours || 0}
                                onChange={(e) => handleOvertimeChange(labour._id, parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    {/* Status Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => handleStatusChange(labour._id, 'Present')}
                            className={`group relative flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-300 border-2 ${status === 'Present'
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/30 scale-[1.02]'
                                : 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${status === 'Present' ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/50'
                                }`}>
                                <IconChecks className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">Present</span>
                        </button>

                        <button
                            onClick={() => handleStatusChange(labour._id, 'Half Day')}
                            className={`group relative flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-300 border-2 ${status === 'Half Day'
                                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white border-amber-500 shadow-lg shadow-amber-500/30 scale-[1.02]'
                                : 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-300'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${status === 'Half Day' ? 'bg-white/20' : 'bg-amber-100 dark:bg-amber-900/50'
                                }`}>
                                <span className="text-xs font-black">½</span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">Half Day</span>
                        </button>

                        <button
                            onClick={() => handleStatusChange(labour._id, 'Absent')}
                            className={`group relative flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-300 border-2 ${status === 'Absent'
                                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-500 shadow-lg shadow-red-500/30 scale-[1.02]'
                                : 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${status === 'Absent' ? 'bg-white/20' : 'bg-red-100 dark:bg-red-900/50'
                                }`}>
                                <IconX className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">Absent</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderWorkerRow = (labour: any) => {
        const status = attendanceData[labour._id]?.status || null;
        const isVendor = labour.labourType === 'Vendor';

        return (
            <tr key={labour._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 h-9 w-9 rounded-lg bg-gradient-to-br ${getAvatarColor(labour.name)} flex items-center justify-center text-white font-bold text-xs shadow`}>
                            {getInitials(labour.name)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 dark:text-white text-sm">{labour.name}</span>
                                {isVendor && (
                                    <span className="inline-flex rounded bg-violet-100 px-1 py-0.5 text-[8px] font-black uppercase text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">Contractor</span>
                                )}
                            </div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">{labour.workType || 'General'}</span>
                        </div>
                    </div>
                </td>
                <td className="px-3 py-3">
                    {labour.wage > 0 && <span className="text-xs font-bold text-emerald-600">₹{labour.wage}/{labour.wageType === 'Monthly' ? 'mo' : 'day'}</span>}
                </td>
                <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                        {['Present', 'Half Day', 'Absent'].map((s) => (
                            <button
                                key={s}
                                onClick={() => handleStatusChange(labour._id, s)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 border ${status === s
                                    ? s === 'Present' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                                        : s === 'Half Day' ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                                            : 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20'
                                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                                    }`}
                            >
                                {s === 'Present' ? '✓' : s === 'Half Day' ? '½' : '✗'} {s}
                            </button>
                        ))}
                    </div>
                </td>
                <td className="px-3 py-3">
                    <input
                        type="number"
                        className="w-16 h-8 text-center font-bold text-xs border-2 rounded-lg border-gray-200 dark:border-gray-600 focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
                        min="0" max="12"
                        value={attendanceData[labour._id]?.overtimeHours || 0}
                        onChange={(e) => handleOvertimeChange(labour._id, parseInt(e.target.value) || 0)}
                    />
                </td>
            </tr>
        );
    };

    return (
        <div className="space-y-5">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-6 text-white shadow-2xl">
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/5 blur-3xl"></div>
                <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5 blur-3xl"></div>
                <div className="absolute right-6 top-6 opacity-10">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                </div>

                <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                                <IconCalendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight">Daily Attendance</h1>
                                <p className="text-sm text-white/70 font-medium">Attendance Registry</p>
                            </div>
                        </div>
                        <p className="text-xs text-white/50 mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            {formatDate(selectedDate)}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-1">
                            <input
                                type="date"
                                className="bg-transparent border-none text-white font-bold text-sm focus:ring-0 cursor-pointer px-3 py-1.5"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        {/* Quick Date Buttons */}
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => {
                                    const d = new Date(); d.setDate(d.getDate() - 1);
                                    setSelectedDate(d.toISOString().split('T')[0]);
                                }}
                                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
                            >
                                Yesterday
                            </button>
                            <button
                                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors border border-white/10"
                            >
                                Today
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Attendance Progress */}
                <div className="col-span-2 lg:col-span-1 panel !p-4 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 border-blue-200/50 dark:border-blue-800/50">
                    <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Attendance Rate</div>
                    <div className="relative w-20 h-20 mx-auto mb-2">
                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-600" strokeWidth="2.5" />
                            <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" className="text-blue-500"
                                strokeWidth="2.5" strokeDasharray={`${presentPercent} 100`}
                                strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.8s ease' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-black text-blue-600 dark:text-blue-400">{presentPercent}%</span>
                        </div>
                    </div>
                    <div className="text-center text-[10px] text-gray-400">Attendance Rate</div>
                </div>

                {/* Total */}
                <div className="panel !p-4 border-gray-200/50 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total</span>
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <IconUsers className="w-4 h-4 text-gray-500" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-gray-800 dark:text-white">{stats.total}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Total Workers</div>
                </div>

                {/* Present */}
                <div className="panel !p-4 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-800 border-emerald-200/50 dark:border-emerald-800/50">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Present</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center">
                            <IconChecks className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.present}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Present Today</div>
                </div>

                {/* Half Day */}
                <div className="panel !p-4 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800 border-amber-200/50 dark:border-amber-800/50">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Half Day</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center">
                            <span className="text-sm font-black text-amber-600 dark:text-amber-400">½</span>
                        </div>
                    </div>
                    <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{stats.halfDay}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Half Days</div>
                </div>

                {/* Absent */}
                <div className="panel !p-4 bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 border-red-200/50 dark:border-red-800/50">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Absent</span>
                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-800/50 flex items-center justify-center">
                            <IconX className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <div className={`text-3xl font-black ${stats.absent > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-300 dark:text-gray-600'}`}>{stats.absent}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Absent</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="panel !p-3">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Status:</span>
                    <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                        {stats.present > 0 && (
                            <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full transition-all duration-700 rounded-l-full"
                                style={{ width: `${(stats.present / stats.total) * 100}%` }}></div>
                        )}
                        {stats.halfDay > 0 && (
                            <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-700"
                                style={{ width: `${(stats.halfDay / stats.total) * 100}%` }}></div>
                        )}
                        {stats.absent > 0 && (
                            <div className="bg-gradient-to-r from-red-400 to-red-500 h-full transition-all duration-700 rounded-r-full"
                                style={{ width: `${(stats.absent / stats.total) * 100}%` }}></div>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-[9px] font-bold">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{stats.present}</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>{stats.halfDay}</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>{stats.absent}</span>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search worker by name or work type..."
                        className="form-input pl-10 rounded-xl border-gray-200 dark:border-gray-600 text-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Type Filter */}
                <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-1 gap-1">
                    {[
                        { key: 'all' as const, label: 'All', en: 'All' },
                        { key: 'Direct' as const, label: 'Direct', en: 'Direct' },
                        { key: 'Vendor' as const, label: 'Contractor', en: 'Contractor' },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilterType(f.key)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filterType === f.key
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-1 gap-1">
                    <button onClick={() => setViewMode('card')}
                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'card' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </button>
                    <button onClick={() => setViewMode('table')}
                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" /></svg>
                    </button>
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center gap-2">
                    <button onClick={handleBulkMarkPresent}
                        className="btn btn-sm btn-outline-success font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 rounded-xl !py-2">
                        <IconChecks className="w-3.5 h-3.5" />
                        All Present
                    </button>
                    <button onClick={handleBulkMarkAbsent}
                        className="btn btn-sm btn-outline-danger font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 rounded-xl !py-2">
                        <IconX className="w-3.5 h-3.5" />
                        All Absent
                    </button>
                </div>
            </div>

            {/* Worker List */}
            {loading ? (
                <div className="text-center py-24">
                    <div className="inline-flex h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <div className="mt-5 font-bold text-primary text-lg animate-pulse">Loading Workers...</div>
                    <div className="text-sm text-gray-400 mt-1">Fetching worker data...</div>
                </div>
            ) : filteredLabours.length === 0 ? (
                <div className="panel text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <IconUsers className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto" />
                    <div className="mt-4 font-bold text-gray-400 text-lg">No Workers Found</div>
                    <div className="text-sm text-gray-400 mt-1">No workers found matching your filter</div>
                </div>
            ) : viewMode === 'table' ? (
                /* ===== TABLE VIEW ===== */
                <div className="panel !p-0 overflow-hidden rounded-2xl">
                    {directLabours.length > 0 && (
                        <>
                            <div className="bg-gradient-to-r from-blue-500/10 to-transparent px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Direct Workers — {directLabours.length}
                                </span>
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                        <th className="px-4 py-2.5 text-left">Worker</th>
                                        <th className="px-3 py-2.5 text-left">Wage</th>
                                        <th className="px-3 py-2.5 text-left">Status</th>
                                        <th className="px-3 py-2.5 text-left">OT Hrs</th>
                                    </tr>
                                </thead>
                                <tbody>{directLabours.map(renderWorkerRow)}</tbody>
                            </table>
                        </>
                    )}
                    {vendorLabours.length > 0 && (
                        <>
                            <div className="bg-gradient-to-r from-violet-500/10 to-transparent px-5 py-3 border-y border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                                    Contractor Workers — {vendorLabours.length}
                                </span>
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                        <th className="px-4 py-2.5 text-left">Worker</th>
                                        <th className="px-3 py-2.5 text-left">Wage</th>
                                        <th className="px-3 py-2.5 text-left">Status</th>
                                        <th className="px-3 py-2.5 text-left">OT Hrs</th>
                                    </tr>
                                </thead>
                                <tbody>{vendorLabours.map(renderWorkerRow)}</tbody>
                            </table>
                        </>
                    )}
                </div>
            ) : (
                /* ===== CARD VIEW ===== */
                <div className="space-y-6">
                    {/* Direct Workers Section */}
                    {directLabours.length > 0 && (
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-px flex-1 bg-gradient-to-r from-blue-300 to-transparent dark:from-blue-700"></div>
                                <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Direct Workers — {directLabours.length}
                                </span>
                                <div className="h-px flex-1 bg-gradient-to-l from-blue-300 to-transparent dark:from-blue-700"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {directLabours.map(renderWorkerCard)}
                            </div>
                        </div>
                    )}

                    {/* Contractor Workers Section */}
                    {vendorLabours.length > 0 && (
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-px flex-1 bg-gradient-to-r from-violet-300 to-transparent dark:from-violet-700"></div>
                                <span className="text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest flex items-center gap-2 bg-violet-50 dark:bg-violet-900/30 px-4 py-1.5 rounded-full border border-violet-200 dark:border-violet-800">
                                    <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                                    Contractor Workers — {vendorLabours.length}
                                </span>
                                <div className="h-px flex-1 bg-gradient-to-l from-violet-300 to-transparent dark:from-violet-700"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {vendorLabours.map(renderWorkerCard)}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Save Button */}
            <div className="fixed bottom-8 right-8 z-50">
                <button
                    type="button"
                    className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-[0_10px_40px_rgba(79,70,229,0.45)] px-8 py-4 rounded-2xl flex items-center gap-3 transform hover:scale-105 active:scale-95 transition-all duration-300 font-black uppercase tracking-widest text-sm"
                    onClick={handleSave}
                    disabled={saving || loading}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    {saving ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                        <IconSave className="w-5 h-5" />
                    )}
                    {saving ? 'Saving...' : 'Save Attendance'}
                </button>
            </div>

            {/* Bottom Spacer */}
            <div className="h-20"></div>
        </div>
    );
};

export default AttendancePage;
