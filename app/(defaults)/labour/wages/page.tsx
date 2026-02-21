'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WagesCalculationPage = () => {
    const [summaries, setSummaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = [
        { id: 1, label: 'January' }, { id: 2, label: 'February' }, { id: 3, label: 'March' },
        { id: 4, label: 'April' }, { id: 5, label: 'May' }, { id: 6, label: 'June' },
        { id: 7, label: 'July' }, { id: 8, label: 'August' }, { id: 9, label: 'September' },
        { id: 10, label: 'October' }, { id: 11, label: 'November' }, { id: 12, label: 'December' }
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const fetchWagesSummary = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/labour/wages-summary?month=${selectedMonth}&year=${selectedYear}`);
            if (data.success) setSummaries(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWagesSummary();
    }, [selectedMonth, selectedYear]);

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><a href="/" className="text-primary hover:underline">Dashboard</a></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Labour</span></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Wages Calculation</span></li>
            </ul>

            <div className="panel">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#ebedf2] dark:border-[#1b2e4b] pb-5">
                    <div>
                        <h5 className="text-xl font-bold dark:text-white-light text-primary uppercase">Wages Calculation (சம்பளம் கணக்கீடு)</h5>
                        <p className="text-white-dark text-xs mt-1">Based on attendance and advances for the selected period</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select className="form-select w-auto font-bold border-primary" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                            {months.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                        </select>
                        <select className="form-select w-auto font-bold border-primary" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr className="bg-primary/5">
                                <th>Labour Name</th>
                                <th>Work Type</th>
                                <th>Rate (Day)</th>
                                <th>Att. Days</th>
                                <th>Total Wages</th>
                                <th className="text-danger">Advance</th>
                                <th className="text-success font-bold">Net Payable</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-10">Calculating Wages...</td></tr>
                            ) : summaries.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-10 font-bold uppercase text-white-dark">No data found for this period</td></tr>
                            ) : (
                                summaries.map((summary) => (
                                    <tr key={summary.labourId}>
                                        <td className="font-bold">{summary.name}</td>
                                        <td><span className="badge badge-sm badge-outline-secondary">{summary.workType}</span></td>
                                        <td>₹{summary.dailyWage}</td>
                                        <td>
                                            <div className="font-bold">{summary.attendance.total} Days</div>
                                            <div className="text-[10px] text-white-dark">P: {summary.attendance.present} | H: {summary.attendance.half}</div>
                                        </td>
                                        <td className="font-semibold italic">₹{summary.totalWages.toLocaleString()}</td>
                                        <td className="text-danger font-semibold italic">₹{summary.totalAdvance.toLocaleString()}</td>
                                        <td className="text-success font-extrabold text-lg">₹{summary.netPayable.toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20 flex flex-wrap justify-between items-center">
                    <div className="text-xs italic text-white-dark uppercase tracking-wider">
                        Formula: (Work Days * Daily Wage) - Advance = Net Payable
                    </div>
                    <div className="font-bold text-primary">
                        Total Payout: ₹ {summaries.reduce((sum, s) => sum + s.netPayable, 0).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WagesCalculationPage;
