'use client';
import React, { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useToast } from '@/components/stone-mine/toast-notification';
import RoleGuard from '@/components/stone-mine/role-guard';
import PaymentConfirmModal from '@/components/stone-mine/payment-confirm-modal';

const WagesCalculationPage = () => {
    const [summaries, setSummaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const { showToast } = useToast();
    const [payoutItem, setPayoutItem] = useState<any>(null);
    const [vendorPayoutItem, setVendorPayoutItem] = useState<any>(null);

    const months = [
        { id: 1, label: 'January' }, { id: 2, label: 'February' }, { id: 3, label: 'March' },
        { id: 4, label: 'April' }, { id: 5, label: 'May' }, { id: 6, label: 'June' },
        { id: 7, label: 'July' }, { id: 8, label: 'August' }, { id: 9, label: 'September' },
        { id: 10, label: 'October' }, { id: 11, label: 'November' }, { id: 12, label: 'December' }
    ];

    const years = Array.from({ length: (new Date().getFullYear() + 1) - 2024 + 1 }, (_, i) => 2024 + i).reverse();

    const fetchWagesSummary = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/labour/wages-summary?month=${selectedMonth}&year=${selectedYear}`);
            if (data.success) setSummaries(data.data);
        } catch (error) {
            console.error(error);
            showToast('Error fetching wages summary', 'error');
        } finally {
            setLoading(false);
        }
    };

    /* Settle logic for direct labour */
    const confirmSettle = async (mode: string) => {
        if (!payoutItem) return;
        try {
            await api.post('/expenses', {
                category: 'Labour Wages',
                amount: parseFloat(payoutItem.totalWages) + parseFloat(payoutItem.otAmount || 0),
                date: new Date(),
                paymentMode: mode,
                description: `Wages for ${selectedMonth}/${selectedYear}`,
                labourId: payoutItem.labourId,
                labourName: payoutItem.name,
                workType: payoutItem.workType,
                quantity: payoutItem.attendance.total,
                rate: payoutItem.dailyWage,
                otAmount: parseFloat(payoutItem.otAmount || 0),
                advanceDeduction: parseFloat(payoutItem.totalAdvance || 0),
                netPay: parseFloat(payoutItem.netPayable),
                salaryMonth: selectedMonth,
                salaryYear: selectedYear
            });

            await api.post('/labour/mark-wages-paid', {
                month: selectedMonth,
                year: selectedYear,
                labourId: payoutItem.labourId
            });

            showToast('Payment successful! Recorded in Expenses.', 'success');
            fetchWagesSummary();
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Error recording payment.', 'error');
        } finally {
            setPayoutItem(null);
        }
    };

    /* Settle logic for vendor contractor */
    const confirmVendorSettle = async (mode: string) => {
        if (!vendorPayoutItem) return;
        try {
            await api.post('/vendors/payments', {
                date: new Date(),
                vendorId: vendorPayoutItem.contractorId,
                vendorType: 'LabourContractor',
                vendorName: vendorPayoutItem.contractorName,
                invoiceAmount: parseFloat(vendorPayoutItem.netPayable),
                paidAmount: parseFloat(vendorPayoutItem.netPayable),
                paymentMode: mode,
                referenceNumber: '',
                notes: `Wages payout for ${selectedMonth}/${selectedYear} based on actual attendance of ${vendorPayoutItem.labourCount} vendor labours.`
            });

            await api.post('/labour/mark-wages-paid', {
                month: selectedMonth,
                year: selectedYear,
                contractorId: vendorPayoutItem.contractorId
            });

            showToast('Vendor payment success! Recorded in Vendor Payments.', 'success');
            fetchWagesSummary();
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Error recording vendor payment.', 'error');
        } finally {
            setVendorPayoutItem(null);
        }
    };

    useEffect(() => {
        fetchWagesSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMonth, selectedYear]);

    return (
        <RoleGuard allowedRoles={['owner', 'manager']} redirectTo="/expenses/diesel">
            <div>
                <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                    <li><a href="/" className="text-primary hover:underline font-bold">Dashboard</a></li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 font-bold text-white-dark uppercase tracking-widest text-[10px]"><span>Labour</span></li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 font-bold text-white-dark uppercase tracking-widest text-[10px]"><span>Wages Calculation</span></li>
                </ul>

                <div className="panel border-none shadow-2xl rounded-3xl overflow-hidden">
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
                            <button className="btn btn-primary w-full rounded-xl font-black uppercase h-[42px] shadow-[0_10px_20px_rgba(67,97,238,0.3)]" onClick={fetchWagesSummary}>Calculate Wages</button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-black/20 text-[10px] font-black uppercase tracking-widest text-white-dark">
                                    <th className="py-4 px-6">Labourer</th>
                                    <th>Category</th>
                                    <th>Work Days</th>
                                    <th>OT Hours</th>
                                    <th>Basic + OT</th>
                                    <th>Advance</th>
                                    <th className="text-success text-center">Net Payable</th>
                                    <th className="text-center px-6">Action</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold">
                                {loading ? (
                                    <tr><td colSpan={8} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs uppercase tracking-[0.2em] text-primary">Calculating Wages...</span>
                                        </div>
                                    </td></tr>
                                ) : summaries.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-20 opacity-30 font-black uppercase tracking-widest text-sm">No records found for this period</td></tr>
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
                                                    <div className="font-black text-[10px] text-warning/70 uppercase">P: {summary.attendance.present} | H: {summary.attendance.half}</div>
                                                    {summary.attendance.totalDaysAll > summary.attendance.total && (
                                                        <div className="text-[9px] text-emerald-600 font-black mt-1 uppercase tracking-tighter bg-emerald-100/50 px-1 py-0.5 rounded inline-block">
                                                            Confirmed: {summary.attendance.totalDaysAll} Days ({summary.attendance.totalDaysAll - summary.attendance.total} Paid)
                                                        </div>
                                                    )}
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
                                                    {summary.attendance.total === 0 ? (
                                                        <span className="badge badge-outline-success font-black text-[9px] uppercase tracking-widest bg-success/10 py-1.5 px-3 rounded-lg overflow-hidden relative">
                                                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-success/20"></div>
                                                            Already Paid
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => setVendorPayoutItem(summary)}
                                                            className="btn btn-sm btn-warning rounded-lg font-black text-[9px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                                                        >
                                                            Pay Vendor
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr key={`direct-${summary.labourId}`} className="group hover:bg-primary/5 transition-all">
                                                <td className="py-4 font-black text-black dark:text-white uppercase px-6">{summary.name}</td>
                                                <td className="text-[10px] font-black text-white-dark group-hover:text-primary transition-colors">{summary.workType}</td>
                                                <td>
                                                    <div className="font-bold">{summary.attendance.total} Days</div>
                                                    <div className="text-[10px] text-white-dark font-black uppercase">P: {summary.attendance.present} | H: {summary.attendance.half}</div>
                                                    {summary.attendance.totalDaysAll > summary.attendance.total && (
                                                        <div className="text-[9px] text-emerald-600 font-black mt-1 uppercase tracking-tighter bg-emerald-100/50 px-1 py-0.5 rounded inline-block">
                                                            Total: {summary.attendance.totalDaysAll} Days ({summary.attendance.totalDaysAll - summary.attendance.total} Paid)
                                                        </div>
                                                    )}
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
                                                    {summary.attendance.total === 0 ? (
                                                        <span className="badge badge-outline-success font-black text-[9px] uppercase tracking-widest bg-success/10 py-1.5 px-3 rounded-lg overflow-hidden relative">
                                                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-success/20"></div>
                                                            Already Paid
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => setPayoutItem(summary)}
                                                            className="btn btn-sm btn-outline-success rounded-lg font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all"
                                                        >
                                                            Settle & Pay
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="m-6 p-8 bg-primary/5 rounded-3xl border border-primary/10 flex flex-wrap justify-between items-center bg-gradient-to-r from-primary/5 via-transparent to-primary/5 shadow-inner">
                        <div className="text-[10px] italic text-white-dark uppercase tracking-[0.2em] font-black opacity-60">
                            Formula: (Work Days * Daily Wage) + (OT Hours * Hourly Rate) - Advance = Net Payable
                        </div>
                        <div className="text-3xl font-black text-primary tracking-tighter">
                            <span className="text-sm uppercase tracking-widest mr-3 opacity-60 font-bold">Consolidated Payout:</span>
                            ₹ {summaries.reduce((sum, s) => sum + parseFloat(s.netPayable), 0).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
};

export default WagesCalculationPage;
