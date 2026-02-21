'use client';
import React, { useState, useEffect } from 'react';
import IconSave from '@/components/icon/icon-save';
import IconUsers from '@/components/icon/menu/icon-menu-users';
import IconCalendar from '@/components/icon/menu/icon-menu-calendar';
import IconPlus from '@/components/icon/icon-plus';
import IconChecks from '@/components/icon/icon-checks';
import IconX from '@/components/icon/icon-x';
import axios from 'axios';
import Swal from 'sweetalert2';

const AttendancePage = () => {
    const [labours, setLabours] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<any>({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchLaboursAndAttendance = async () => {
        setLoading(true);
        try {
            const { data: labourJson } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/labour`);
            if (labourJson.success) {
                const activeLabours = labourJson.data.filter((l: any) => l.status === 'active');
                setLabours(activeLabours);

                const initial: any = {};
                activeLabours.forEach((l: any) => {
                    initial[l._id] = { status: 'Present', overtimeHours: 0 };
                });

                const { data: attJson } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/labour/attendance?date=${selectedDate}`);
                if (attJson.success && attJson.data.length > 0) {
                    attJson.data.forEach((record: any) => {
                        if (initial[record.labour._id]) {
                            initial[record.labour._id] = {
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
        labours.forEach(l => {
            updated[l._id] = { ...updated[l._id], status: 'Present' };
        });
        setAttendanceData(updated);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const dataToSave = Object.keys(attendanceData).map(id => ({
                labour: id,
                ...attendanceData[id]
            }));

            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/labour/attendance`, {
                date: selectedDate,
                attendanceData: dataToSave
            });

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Attendance Saved',
                    text: 'Records have been updated successfully!',
                    timer: 2000,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save attendance' });
        } finally {
            setSaving(false);
        }
    };

    const stats = {
        present: Object.values(attendanceData).filter((a: any) => a.status === 'Present').length,
        absent: Object.values(attendanceData).filter((a: any) => a.status === 'Absent').length,
        halfDay: Object.values(attendanceData).filter((a: any) => a.status === 'Half Day').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
                        <IconCalendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h5 className="text-xl font-extrabold text-black dark:text-white-light ltr:mr-3 rtl:ml-3">Daily Attendance</h5>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-info text-xs font-bold font-primary uppercase tracking-wider">Attendance Registry</span>
                            <span className="bg-info w-1.5 h-1.5 rounded-full animate-pulse"></span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-dark p-2 px-4 rounded-2xl shadow-sm border border-white-light dark:border-white-dark/10">
                    <span className="text-sm font-bold text-white-dark uppercase tracking-wide">Selected Date:</span>
                    <input
                        type="date"
                        className="form-input w-auto border-none focus:ring-0 font-bold text-primary bg-transparent text-lg p-0"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="panel bg-gradient-to-br from-primary/10 to-transparent border-primary/20 flex flex-col justify-center py-4">
                    <div className="flex items-center justify-between">
                        <div className="font-bold text-primary uppercase text-[10px] tracking-widest">Total Staff</div>
                        <IconUsers className="w-4 h-4 text-primary/50" />
                    </div>
                    <div className="text-3xl font-black text-primary mt-1">{labours.length}</div>
                </div>
                <div className="panel bg-gradient-to-br from-success/10 to-transparent border-success/20 flex flex-col justify-center py-4">
                    <div className="flex items-center justify-between">
                        <div className="font-bold text-success uppercase text-[10px] tracking-widest">Present Today</div>
                        <div className="bg-success/20 p-1 rounded-full"><IconChecks className="w-3 h-3 text-success" /></div>
                    </div>
                    <div className="text-3xl font-black text-success mt-1">{stats.present}</div>
                </div>
                <div className="panel bg-gradient-to-br from-warning/10 to-transparent border-warning/20 flex flex-col justify-center py-4">
                    <div className="flex items-center justify-between">
                        <div className="font-bold text-warning uppercase text-[10px] tracking-widest">Half Days</div>
                        <div className="bg-warning/20 p-1 rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px] text-warning">½</div>
                    </div>
                    <div className="text-3xl font-black text-warning mt-1">{stats.halfDay}</div>
                </div>
                <div className="panel bg-gradient-to-br from-danger/10 to-transparent border-danger/20 flex flex-col justify-center py-4">
                    <div className="flex items-center justify-between text-danger">
                        <div className="font-bold uppercase text-[10px] tracking-widest">Absentees</div>
                        <div className="w-2.5 h-2.5 rounded-full bg-danger animate-ping"></div>
                    </div>
                    <div className="text-3xl font-black mt-1">{stats.absent}</div>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <h6 className="text-base font-bold dark:text-white-light flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    Worker List
                </h6>
                <button
                    onClick={handleBulkMarkPresent}
                    className="btn btn-outline-success btn-sm font-bold uppercase tracking-wider text-[10px] flex items-center gap-2"
                >
                    <IconChecks className="w-4 h-4" />
                    Mark All Present
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                    <div className="col-span-full text-center py-20">
                        <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <div className="mt-4 font-bold text-primary animate-pulse">Scanning Staff Database...</div>
                    </div>
                ) : labours.length === 0 ? (
                    <div className="col-span-full panel text-center py-20 bg-gray-50 dark:bg-dark-light/10">
                        <IconUsers className="w-12 h-12 text-white-dark mx-auto opacity-20" />
                        <div className="mt-4 font-bold text-white-dark text-lg">No active workers found in current lineup.</div>
                    </div>
                ) : (
                    labours.map((labour) => (
                        <div
                            key={labour._id}
                            className={`panel transition-all duration-300 p-4 border-2 group hover:shadow-xl ${attendanceData[labour._id]?.status === 'Absent' ? 'border-danger/30 bg-danger/[0.02]' :
                                attendanceData[labour._id]?.status === 'Half Day' ? 'border-warning/30 bg-warning/[0.02]' :
                                    'border-success/30 bg-success/[0.02]'
                                } rounded-2xl relative overflow-hidden`}
                        >
                            <div className="flex flex-col h-full gap-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-black text-lg text-black dark:text-white-light leading-none group-hover:text-primary transition-colors">{labour.name}</div>
                                        <div className="text-[10px] font-bold text-white-dark uppercase tracking-widest mt-1.5">{labour.workType}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <label className="text-[8px] font-bold text-white-dark uppercase tracking-tighter">Overtime (Hrs)</label>
                                        <input
                                            type="number"
                                            className="form-input w-12 h-8 text-center p-0 font-black text-sm border-2 rounded-lg border-white-light dark:border-white-dark/20 focus:border-primary transition-all"
                                            min="0" max="12"
                                            value={attendanceData[labour._id]?.overtimeHours || 0}
                                            onChange={(e) => handleOvertimeChange(labour._id, parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-1.5">
                                    <button
                                        onClick={() => handleStatusChange(labour._id, 'Present')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${attendanceData[labour._id]?.status === 'Present'
                                            ? 'bg-success text-white border-success shadow-lg shadow-success/30 transform scale-105'
                                            : 'bg-white dark:bg-dark text-success border-success/20 hover:bg-success/5'
                                            }`}
                                    >
                                        <IconChecks className="w-4 h-4" />
                                        <span className="text-[8px] font-black uppercase mt-1">Present</span>
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(labour._id, 'Half Day')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${attendanceData[labour._id]?.status === 'Half Day'
                                            ? 'bg-warning text-white border-warning shadow-lg shadow-warning/30 transform scale-105'
                                            : 'bg-white dark:bg-dark text-warning border-warning/20 hover:bg-warning/5'
                                            }`}
                                    >
                                        <span className="text-sm font-black leading-none">½</span>
                                        <span className="text-[8px] font-black uppercase mt-1">Half Day</span>
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(labour._id, 'Absent')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${attendanceData[labour._id]?.status === 'Absent'
                                            ? 'bg-danger text-white border-danger shadow-lg shadow-danger/30 transform scale-105'
                                            : 'bg-white dark:bg-dark text-danger border-danger/20 hover:bg-danger/5'
                                            }`}
                                    >
                                        <IconX className="w-4 h-4" />
                                        <span className="text-[8px] font-black uppercase mt-1">Absent</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="fixed bottom-10 right-10 z-50">
                <button
                    type="button"
                    className="btn btn-primary shadow-[0_10px_30px_rgba(67,97,238,0.5)] px-10 py-3.5 rounded-2xl flex items-center gap-3 transform hover:scale-105 active:scale-95 transition-all text-base font-black uppercase tracking-widest"
                    onClick={handleSave}
                    disabled={saving || loading}
                >
                    {saving ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                        <IconSave className="w-5 h-5" />
                    )}
                    {saving ? 'Syncing...' : 'Confirm Attendance'}
                </button>
            </div>
        </div>
    );
};

export default AttendancePage;

