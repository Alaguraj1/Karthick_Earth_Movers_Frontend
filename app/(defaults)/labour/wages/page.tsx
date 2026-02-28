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

    const handleSettle = async (summary: any) => {
        const mode = window.prompt("Enter Payment Mode (Cash/Bank Transfer/UPI):", "Cash");
        if (!mode) return;

        if (confirm(`Confirm payment of ₹${summary.netPayable} to ${summary.name}? This will record it as an Expense.`)) {
            try {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/expenses`, {
                    category: 'Labour Wages',
                    amount: parseFloat(summary.netPayable),
                    date: new Date(),
                    paymentMode: mode,
                    description: `Wages for ${selectedMonth}/${selectedYear}`,
                    labourName: summary.name,
                    workType: summary.workType,
                    quantity: summary.attendance.total,
                    rate: summary.totalWages / Math.max(summary.attendance.total, 1)
                });

                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/labour/mark-wages-paid`, {
                    month: selectedMonth,
                    year: selectedYear,
                    labourId: summary.labourId
                });

                alert("Payment Success! Recorded in Expenses.");
                fetchWagesSummary();
            } catch (error) {
                console.error(error);
                alert("Error recording payment.");
            }
        }
    };

    const handleVendorSettle = async (summary: any) => {
        const mode = window.prompt("Enter Payment Mode (Cash/Bank Transfer/UPI/Cheque):", "Cash");
        if (!mode) return;

        if (confirm(`Confirm direct payout of ₹${summary.netPayable} to Contractor ${summary.contractorName}? This will record a Vendor Payment.`)) {
            try {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/vendors/payments`, {
                    date: new Date(),
                    vendorId: summary.contractorId,
                    vendorType: 'LabourContractor',
                    vendorName: summary.contractorName,
                    invoiceAmount: parseFloat(summary.netPayable),
                    paidAmount: parseFloat(summary.netPayable),
                    paymentMode: mode,
                    referenceNumber: '',
                    notes: `Wages payout for ${selectedMonth}/${selectedYear} based on actual attendance of ${summary.labourCount} vendor labours.`
                });

                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/labour/mark-wages-paid`, {
                    month: selectedMonth,
                    year: selectedYear,
                    contractorId: summary.contractorId
                });

                alert("Vendor Payment Success! Recorded in Vendor Payments.");
                fetchWagesSummary();
            } catch (error) {
                console.error(error);
                alert("Error recording vendor payment.");
            }
        }
    };

    useEffect(() => {
        fetchWagesSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMonth, selectedYear]);

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><a href="/" className="text-primary hover:underline">Dashboard</a></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Labour</span></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Wages Calculation</span></li>
            </ul>

            <div className="panel border-none shadow-xl rounded-3xl overflow-hidden">
                <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 px-6 pt-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-white-dark mb-2 block">Select Month</label>
                        <select className="form-select font-bold rounded-xl" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                            {months.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-white-dark mb-2 block">Select Year</label>
                        <select className="form-select font-bold rounded-xl" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button className="btn btn-primary w-full rounded-xl font-black uppercase h-[42px]" onClick={fetchWagesSummary}>Calculate Wages</button>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-black/20 text-[10px] font-black uppercase tracking-widest text-white-dark">
                                <th className="py-4">Labourer</th>
                                <th>Category</th>
                                <th>Work Days</th>
                                <th>OT Hours</th>
                                <th>Basic + OT</th>
                                <th>Advance</th>
                                <th className="text-success text-center">Net Payable</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-10"><span className="animate-spin border-2 border-primary border-l-transparent rounded-full w-6 h-6 inline-block"></span></td></tr>
                            ) : summaries.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-10 opacity-30 font-black uppercase">No records found for this period</td></tr>
                            ) : (
                                summaries.map((summary: any) => (
                                    summary.isVendorGroup ? (
                                        <tr key={`vendor-${summary.contractorId}`} className="group hover:bg-warning/5 transition-all bg-warning/5 border-l-4 border-warning">
                                            <td className="py-4 font-black text-warning uppercase px-6">
                                                <div className="flex flex-col">
                                                    <span>{summary.contractorName}</span>
                                                    <span className="text-[9px] text-warning/70 mt-0.5 tracking-widest">{summary.companyName || 'Contractor'}</span>
                                                </div>
                                            </td>
                                            <td className="text-[10px] font-black text-warning group-hover:text-warning transition-colors">
                                                {summary.labourCount} Labours
                                            </td>
                                            <td>
                                                <div className="font-bold text-warning">{summary.attendance.total} Days</div>
                                                <div className="text-[10px] text-warning/70">P: {summary.attendance.present} | H: {summary.attendance.half}</div>
                                            </td>
                                            <td>
                                                <div className="font-bold text-info">{summary.attendance.otHours || 0} Hrs</div>
                                                <div className="text-[10px] text-info italic">₹{summary.otAmount}</div>
                                            </td>
                                            <td className="font-semibold italic">
                                                ₹{parseFloat(summary.totalWages).toLocaleString()}
                                                <div className="text-[10px] text-success font-black tracking-widest">+ ₹{summary.otAmount} (OT)</div>
                                            </td>
                                            <td className="text-danger font-semibold italic">₹{summary.totalAdvance.toLocaleString()}</td>
                                            <td className="text-warning font-extrabold text-lg text-center bg-warning/10">₹{parseFloat(summary.netPayable).toLocaleString()}</td>
                                            <td className="text-center px-6">
                                                <button
                                                    onClick={() => handleVendorSettle(summary)}
                                                    className="btn btn-sm btn-warning rounded-lg font-black text-[9px] uppercase tracking-widest shadow-lg hover:scale-105"
                                                >
                                                    Pay Vendor
                                                </button>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={`direct-${summary.labourId}`} className="group hover:bg-primary/5 transition-all">
                                            <td className="py-4 font-black text-black dark:text-white uppercase px-6">{summary.name}</td>
                                            <td className="text-[10px] font-black text-white-dark group-hover:text-primary transition-colors">{summary.workType}</td>
                                            <td>
                                                <div className="font-bold">{summary.attendance.total} Days</div>
                                                <div className="text-[10px] text-white-dark">P: {summary.attendance.present} | H: {summary.attendance.half}</div>
                                            </td>
                                            <td>
                                                <div className="font-bold text-info">{summary.attendance.otHours || 0} Hrs</div>
                                                <div className="text-[10px] text-info italic">₹{summary.otAmount}</div>
                                            </td>
                                            <td className="font-semibold italic">
                                                ₹{parseFloat(summary.totalWages).toLocaleString()}
                                                <div className="text-[10px] text-success font-black tracking-widest">+ ₹{summary.otAmount} (OT)</div>
                                            </td>
                                            <td className="text-danger font-semibold italic">₹{summary.totalAdvance.toLocaleString()}</td>
                                            <td className="text-success font-extrabold text-lg text-center bg-success/5">₹{parseFloat(summary.netPayable).toLocaleString()}</td>
                                            <td className="text-center px-6">
                                                <button
                                                    onClick={() => handleSettle(summary)}
                                                    className="btn btn-sm btn-outline-success rounded-lg font-black text-[9px] uppercase tracking-widest hover:scale-105"
                                                >
                                                    Settle & Pay
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="m-6 p-6 bg-primary/5 rounded-2xl border border-primary/10 flex flex-wrap justify-between items-center bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="text-[10px] italic text-white-dark uppercase tracking-widest font-black">
                        Formula: (Work Days * Daily Wage) + (OT Hours * Hourly Rate) - Advance = Net Payable
                    </div>
                    <div className="text-2xl font-black text-primary">
                        Total Payout: ₹ {summaries.reduce((sum, s) => sum + parseFloat(s.netPayable), 0).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WagesCalculationPage;
