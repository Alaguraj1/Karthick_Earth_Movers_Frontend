'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useToast } from '@/components/stone-mine/toast-notification';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import IconPhone from '@/components/icon/icon-phone';
import IconMapPin from '@/components/icon/icon-map-pin';
import IconUser from '@/components/icon/icon-user';
import IconArchive from '@/components/icon/icon-archive';

const ContractorDetailsPage = ({ params }: { params: any }) => {
    const id = params.id;
    const router = useRouter();
    const { showToast } = useToast();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const { data: res } = await api.get(`/vendors/labour/${id}`);
            if (res.success) {
                setData(res.data);
            } else {
                showToast('Failed to fetch details', 'error');
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error fetching contractor details', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="panel text-center py-20">
                <h2 className="text-2xl font-bold">Contractor not found</h2>
                <button className="btn btn-primary mt-4" onClick={() => router.back()}>Go Back</button>
            </div>
        );
    }

    const { contractor, workers } = data;

    return (
        <div className="space-y-6 animate__animated animate__fadeIn uppercase">
            {/* Header & Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="btn btn-outline-primary rounded-full w-10 h-10 p-0 flex items-center justify-center hover:scale-110 transition-all font-black"
                >
                    <IconArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-black dark:text-white-light tracking-tight italic">
                        Contractor Profile
                    </h2>
                    <p className="text-white-dark text-xs font-bold tracking-widest opacity-70">
                        Details and associated workers for {contractor.name}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contractor Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="panel border-t-4 border-warning shadow-xl rounded-3xl overflow-hidden group">
                        <div className="flex flex-col items-center text-center p-6 bg-warning/5 border-b border-warning/10">
                            <div className="w-24 h-24 rounded-3xl bg-warning flex items-center justify-center text-white text-4xl font-black mb-4 shadow-2xl rotate-3 group-hover:rotate-0 transition-all">
                                {contractor.name.charAt(0)}
                            </div>
                            <h3 className="text-2xl font-black text-warning tracking-tighter">{contractor.name}</h3>
                            <p className="text-xs font-black text-white-dark/60 tracking-widest mt-1">
                                {contractor.companyName || 'INDIVIDUAL CONTRACTOR'}
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center text-info shrink-0">
                                    <IconPhone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white-dark uppercase tracking-widest">Mobile Number</p>
                                    <p className="font-black text-sm">{contractor.mobileNumber}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <IconMapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white-dark uppercase tracking-widest">Office Address</p>
                                    <p className="font-bold text-xs leading-relaxed">{contractor.address || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white-light dark:border-white-dark/10">
                                <div>
                                    <p className="text-[9px] font-black text-white-dark uppercase tracking-widest mb-1">GST Number</p>
                                    <p className="font-black text-xs text-info">{contractor.gstNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-white-dark uppercase tracking-widest mb-1">PAN Number</p>
                                    <p className="font-black text-xs text-secondary">{contractor.panNumber || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Terms Card */}
                    <div className="panel shadow-xl rounded-3xl p-6 bg-primary/5 border border-primary/20">
                        <h4 className="font-black text-xs tracking-widest text-primary mb-4 flex items-center gap-2">
                            COMMERCIAL TERMS
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-white-dark">PAYMENT MODE</span>
                                <span className="badge badge-outline-primary rounded-xl px-4 italic">{contractor.paymentMode}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-white-dark">CREDIT TERMS</span>
                                <span className="badge badge-outline-secondary rounded-xl px-4 italic">{contractor.creditTerms || 'Immediate'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold pt-4 border-t border-primary/10">
                                <span className="text-danger font-black">OUTSTANDING</span>
                                <span className="text-lg font-black text-danger tracking-tighter italic">₹{(contractor.outstandingBalance || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workers List Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="panel shadow-xl rounded-3xl p-0 overflow-hidden border-none border-t-4 border-info">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-info/5">
                            <h4 className="text-lg font-black text-info italic flex items-center gap-2">
                                <IconUser className="w-5 h-5" />
                                Linked Labours Details ({workers.length})
                            </h4>
                            <div className="text-[10px] font-black tracking-widest bg-info/10 px-3 py-1 rounded-full text-info uppercase">
                                Active Strength
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table-hover custom-table">
                                <thead className="bg-gray-50/50 dark:bg-dark-light/5">
                                    <tr>
                                        <th className="font-black uppercase tracking-widest text-[10px]">Labour Info</th>
                                        <th className="font-black uppercase tracking-widest text-[10px]">Work Type</th>
                                        <th className="font-black uppercase tracking-widest text-[10px] text-right">Wage Details</th>
                                        <th className="font-black uppercase tracking-widest text-[10px] text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-20 text-white-dark italic font-bold">
                                                No workers registered under this contractor yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        workers.map((worker: any) => (
                                            <tr key={worker._id}>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary">
                                                            {worker.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-sm">{worker.name}</div>
                                                            <div className="text-[10px] text-white-dark uppercase tracking-tighter">Joined: {new Date(worker.joiningDate).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="badge badge-outline-info rounded-xl text-[10px] font-black italic tracking-widest">
                                                        {worker.workType || 'General'}
                                                    </div>
                                                </td>
                                                <td className="text-right">
                                                    <div className="font-black text-sm italic tracking-tighter text-primary">₹{worker.wage?.toLocaleString()}</div>
                                                    <div className="text-[9px] text-white-dark uppercase font-bold">{worker.wageType === 'Monthly' ? 'PER MONTH' : 'PER DAY'}</div>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`badge px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${worker.status === 'active' ? 'bg-success/20 text-success border border-success/30' : 'bg-danger/20 text-danger border border-danger/30'}`}>
                                                        {worker.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Remarks Section */}
                    {contractor.notes && (
                        <div className="panel shadow-xl rounded-2xl bg-gray-50 dark:bg-dark-light/5 border-l-4 border-primary p-6">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                Contract Remarks / Notes
                            </p>
                            <p className="italic text-sm font-bold leading-relaxed text-white-dark">
                                "{contractor.notes}"
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContractorDetailsPage;
