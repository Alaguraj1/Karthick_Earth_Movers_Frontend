'use client';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import IconPlus from '@/components/icon/icon-plus';
import IconSave from '@/components/icon/icon-save';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import IconEye from '@/components/icon/icon-eye';
import Link from 'next/link';
import api from '@/utils/api';
import { useToast } from '@/components/stone-mine/toast-notification';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';
import { canEditRecord } from '@/utils/permissions';

const LabourListPage = () => {
    const currentUser = useSelector((state: IRootState) => state.auth.user);
    const isOwner = currentUser?.role?.toLowerCase() === 'owner';
    const canSeeFinancials = currentUser?.role?.toLowerCase() !== 'supervisor';

    const [data, setData] = useState<any[]>([]);
    const [contractors, setContractors] = useState<any[]>([]);
    const [workTypes, setWorkTypes] = useState<any[]>([]);
    const [selectedContractor, setSelectedContractor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formView, setFormView] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('direct');
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        address: '',
        workType: '',
        wage: '',
        wageType: 'Daily',
        labourType: 'Direct',
        contractor: '',
        joiningDate: new Date().toISOString().split('T')[0],
        description: '',
        status: 'active'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [labourRes, contractorRes, workTypesRes] = await Promise.all([
                api.get('/labour'),
                api.get('/vendors/labour'),
                api.get('/master/work-types')
            ]);
            if (labourRes.data.success) setData(labourRes.data.data);
            if (contractorRes.data.success) setContractors(contractorRes.data.data);
            if (workTypesRes.data.success) setWorkTypes(workTypesRes.data.data);
        } catch (error) {
            console.error(error);
            showToast('Error fetching data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            if (name === 'labourType') {
                if (value === 'Direct') {
                    updated.contractor = '';
                    updated.wage = '';
                    updated.workType = workTypes[0]?.name || '';
                }
            }

            if (name === 'contractor') {
                const vendor = contractors.find(c => c._id === value);
                setSelectedContractor(vendor);
                if (vendor && vendor.contracts && vendor.contracts.length > 0) {
                    const firstContract = vendor.contracts[0];
                    updated.workType = firstContract.workType;
                    updated.wage = firstContract.agreedRate;
                    updated.wageType = firstContract.rateType === 'Per Month' || firstContract.rateType === 'Monthly Contract' ? 'Monthly' : 'Daily';
                }
            }

            return updated;
        });
    };

    const handleContractChange = (contract: any) => {
        setFormData(prev => ({
            ...prev,
            workType: contract.workType,
            wage: contract.agreedRate,
            wageType: contract.rateType === 'Per Month' || contract.rateType === 'Monthly Contract' ? 'Monthly' : 'Daily'
        }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (payload.labourType === 'Direct') {
                payload.contractor = '';
            }

            const endpoint = editItem ? `/labour/${editItem._id}` : '/labour';
            const method = editItem ? 'put' : 'post';

            const { data: json } = await (api as any)[method](endpoint, payload);
            if (json.success) {
                showToast(editItem ? 'Labour profile updated successfully' : 'New labour profile added successfully', 'success');
                resetForm();
                fetchData();
            }
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.error || 'Error saving data', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            mobile: '',
            address: '',
            workType: workTypes[0]?.name || '',
            wage: '',
            wageType: 'Daily',
            labourType: activeTab === 'direct' ? 'Direct' : 'Vendor',
            contractor: '',
            joiningDate: new Date().toISOString().split('T')[0],
            description: '',
            status: 'active'
        });
        setSelectedContractor(null);
        setEditItem(null);
        setFormView(false);
    };

    const handleEdit = (item: any) => {
        setEditItem(item);
        const vendor = item.contractor?._id ? contractors.find(c => c._id === item.contractor._id) : null;
        setSelectedContractor(vendor);

        setFormData({
            name: item.name,
            mobile: item.mobile || '',
            address: item.address || '',
            workType: item.workType || '',
            wage: item.wage || '',
            wageType: item.wageType || 'Daily',
            labourType: item.labourType || 'Direct',
            contractor: item.contractor?._id || item.contractor || '',
            joiningDate: item.joiningDate ? new Date(item.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            description: item.description || '',
            status: item.status || 'active'
        });
        setFormView(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const { data: json } = await api.delete(`/labour/${deleteId}`);
            if (json.success) {
                showToast('Labour profile has been deleted.', 'success');
                fetchData();
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to delete labour profile', 'error');
        } finally {
            setDeleteId(null);
        }
    };

    const filteredLabours = data.filter(item => {
        if (activeTab === 'direct') return item.labourType === 'Direct' || !item.labourType;
        return item.labourType === 'Vendor';
    });

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><a href="/" className="text-primary hover:underline font-bold">Dashboard</a></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 font-bold text-white-dark uppercase tracking-widest text-[10px]"><span>Labour Management</span></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 font-bold text-white-dark uppercase tracking-widest text-[10px]"><span>Labour List</span></li>
            </ul>

            {formView ? (
                <div className="panel shadow-2xl rounded-3xl border-none">
                    <div className="mb-8 flex items-center justify-between border-b border-[#ebedf2] dark:border-[#1b2e4b] pb-5">
                        <div className="flex items-center">
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm ltr:mr-4 rtl:ml-4 flex items-center justify-center rounded-xl w-10 h-10 p-0 transform hover:scale-105 transition-all"
                                onClick={resetForm}
                            >
                                <IconArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h5 className="text-xl font-black dark:text-white-light tracking-tight">{editItem ? 'Edit Labour Profile' : 'Add New Labour'}</h5>
                                <p className="text-primary text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Register Employee (தொழிலாளர் விவரங்களைப் பதிவு செய்யவும்)</p>
                            </div>
                        </div>
                    </div>

                    <form className="max-w-4xl mx-auto space-y-8" onSubmit={handleSubmit}>
                        {/* Section 1: Registration Type */}
                        <div className="space-y-5 bg-primary/5 p-6 rounded-2xl border border-primary/10 shadow-sm">
                            <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest border-b border-primary/10 pb-2 mb-4">
                                <IconPlus className="w-4 h-4" />
                                1. Registration Type (பதிவு வகை)
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase mb-2 block">Labour Category (வகை)</label>
                                    <select name="labourType" className="form-select border-primary font-bold rounded-xl h-11" value={formData.labourType} onChange={handleChange}>
                                        <option value="Direct">Direct Labour (நேரடி தொழிலாளர்)</option>
                                        <option value="Vendor">Contractor/Vendor Labour (ஒப்பந்த தொழிலாளர்)</option>
                                    </select>
                                </div>
                                {formData.labourType === 'Vendor' && (
                                    <div>
                                        <label className="text-[10px] font-black text-white-dark uppercase mb-2 block">Select Contractor (ஒப்பந்ததாரர்)</label>
                                        <select name="contractor" className="form-select border-warning font-bold rounded-xl h-11" value={formData.contractor} onChange={handleChange} required>
                                            <option value="">Select Vendor...</option>
                                            {contractors.map(c => (
                                                <option key={c._id} value={c._id}>{c.name} {c.companyName ? `(${c.companyName})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {formData.labourType === 'Vendor' && selectedContractor && (
                                <div className="mt-4 p-4 bg-warning/5 rounded-2xl border border-warning/20">
                                    <label className="text-[10px] font-black text-warning uppercase mb-2 block">Available Contracts for this Vendor</label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedContractor.contracts?.map((c: any, idx: number) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${formData.workType === c.workType ? 'bg-warning text-white border-warning shadow-lg shadow-warning/20' : 'bg-white text-warning border-warning/30 hover:bg-warning/10'}`}
                                                onClick={() => handleContractChange(c)}
                                            >
                                                {c.workType} (₹{c.agreedRate}/{c.rateType})
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-white-dark mt-3 font-bold uppercase tracking-wider opacity-60">Selecting a contract will automatically fetch details and make them non-editable to prevent mismatch.</p>
                                </div>
                            )}
                        </div>

                        {/* Section 2: Personal & Work Info */}
                        <div className="space-y-5 bg-info/5 p-6 rounded-2xl border border-info/10 shadow-sm">
                            <div className="flex items-center gap-2 text-info font-black uppercase text-[10px] tracking-widest border-b border-info/10 pb-2 mb-4">
                                <IconPlus className="w-4 h-4" />
                                2. Personal &amp; Work Information (தனிப்பட்ட விவரங்கள்)
                            </div>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className="text-[10px] font-black text-white-dark uppercase mb-2 block">Labour Name (பெயர்)</label>
                                    <input type="text" name="name" className="form-input border-info focus:ring-info font-bold rounded-xl h-11" value={formData.name} onChange={handleChange} required placeholder="Enter full name" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase mb-2 block">Mobile number (தொலைபேசி)</label>
                                    <input type="text" name="mobile" className="form-input font-bold rounded-xl h-11" value={formData.mobile} onChange={handleChange} placeholder="10-digit number" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase mb-2 block">Joining Date (சேர்ந்த நாள்)</label>
                                    <input type="date" name="joiningDate" className="form-input font-bold rounded-xl h-11" value={formData.joiningDate} onChange={handleChange} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-white-dark uppercase mb-2 block">Address (முகவரி)</label>
                                    <input type="text" name="address" className="form-input font-bold rounded-xl h-11" value={formData.address} onChange={handleChange} placeholder="Full address" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase mb-2 block">Work Type (வேலை வகை)</label>
                                    <select
                                        name="workType"
                                        className={`form-select font-bold rounded-xl h-11 ${formData.labourType === 'Vendor' ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
                                        value={formData.workType}
                                        onChange={handleChange}
                                        disabled={formData.labourType === 'Vendor'}
                                    >
                                        <option value="">Select Work Type</option>
                                        {workTypes.map((type: any) => (
                                            <option key={type._id} value={type.name}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {canSeeFinancials && (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-black text-white-dark uppercase mb-2 block">Wage Amount (சம்பளம்)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-info font-black">₹</span>
                                                <input
                                                    type="number"
                                                    name="wage"
                                                    className={`form-input pl-8 font-black border-info rounded-xl h-11 ${formData.labourType === 'Vendor' ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
                                                    value={formData.wage}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="0.00"
                                                    readOnly={formData.labourType === 'Vendor'}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-white-dark uppercase mb-2 block">Wage Type (சம்பள முறை)</label>
                                            <select
                                                name="wageType"
                                                className={`form-select font-bold rounded-xl h-11 ${formData.labourType === 'Vendor' ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
                                                value={formData.wageType}
                                                onChange={handleChange}
                                                disabled={formData.labourType === 'Vendor'}
                                            >
                                                <option value="Daily">Daily Wage (தினக்கூலி)</option>
                                                <option value="Monthly">Monthly Salary (மாதச் சம்பளம்)</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest border-b border-primary/10 pb-2">
                                <IconEdit className="w-4 h-4" />
                                Remarks
                            </div>
                            <textarea name="description" className="form-textarea min-h-[100px] font-bold rounded-2xl" value={formData.description} onChange={handleChange} placeholder="Optional notes..."></textarea>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-10 border-t border-[#ebedf2] dark:border-[#1b2e4b]">
                            <button type="button" className="btn btn-outline-danger px-10 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-14 h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-[0_10px_20px_rgba(67,97,238,0.3)]">
                                <IconSave className="ltr:mr-2 rtl:ml-2 w-4 h-4" />
                                {editItem ? 'Update Profile' : 'Save Labour'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="panel shadow-lg rounded-3xl border-none">
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-6 px-4 pt-4">
                        <div className="flex flex-wrap items-center gap-6">
                            <h5 className="text-2xl font-black dark:text-white-light tracking-tight uppercase">Labour Database</h5>
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-light/5 p-1.5 rounded-2xl shadow-inner">
                                <button
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'direct' ? 'bg-white dark:bg-dark text-primary shadow-lg shadow-primary/10' : 'text-white-dark hover:text-primary'}`}
                                    onClick={() => setActiveTab('direct')}
                                >
                                    DIRECT LABOUR
                                </button>
                                <button
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'vendor' ? 'bg-white dark:bg-dark text-primary shadow-lg shadow-primary/10' : 'text-white-dark hover:text-primary'}`}
                                    onClick={() => setActiveTab('vendor')}
                                >
                                    CONTRACTOR
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {activeTab === 'vendor' && (
                                <Link
                                    href="/vendors/labour"
                                    className="btn btn-outline-warning h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:shadow-warning/20 transition-all border-2"
                                >
                                    <span>⚙️</span> Manage Contractors
                                </Link>
                            )}
                            <button type="button" className="btn btn-primary h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-[0_10px_20px_rgba(67,97,238,0.3)] transition-all transform hover:scale-105" onClick={() => {
                                setFormData(prev => ({ ...prev, labourType: activeTab === 'direct' ? 'Direct' : 'Vendor' }));
                                setFormView(true);
                            }}>
                                <IconPlus className="mr-2 w-4 h-4" /> Add New Labour
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr className="!bg-primary/5">
                                    <th className="font-black uppercase tracking-widest text-[10px] py-4 px-6">Labour Name</th>
                                    <th className="font-black uppercase tracking-widest text-[10px] py-4">Work Type</th>
                                    {activeTab === 'vendor' && <th className="font-black uppercase tracking-widest text-[10px] py-4">Contractor</th>}
                                    <th className="font-black uppercase tracking-widest text-[10px] py-4">Mobile</th>
                                    {canSeeFinancials && <th className="font-black uppercase tracking-widest text-[10px] py-4">Wage Rate</th>}
                                    <th className="font-black uppercase tracking-widest text-[10px] py-4">Join Date</th>
                                    <th className="text-center font-black uppercase tracking-widest text-[10px] py-4 px-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold">
                                {loading ? (
                                    <tr><td colSpan={7} className="text-center py-24">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs uppercase tracking-[0.2em] text-primary font-black">Synchronizing Registry...</span>
                                        </div>
                                    </td></tr>
                                ) : filteredLabours.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-24 text-white-dark uppercase font-black tracking-widest text-sm opacity-20">No {activeTab} labours found</td></tr>
                                ) : (
                                    filteredLabours.map((item: any) => (
                                        <tr key={item._id} className="group hover:bg-primary/5 transition-all">
                                            <td className="font-black text-primary py-4 px-6 text-base tracking-tight">{item.name}</td>
                                            <td className="py-4">
                                                <span className="badge badge-outline-info rounded-lg font-black text-[9px] uppercase tracking-widest bg-info/5 px-2.5 py-1.5">{item.workType}</span>
                                            </td>
                                            {activeTab === 'vendor' && (
                                                <td className="font-black text-warning whitespace-nowrap py-4">
                                                    {item.contractor?.name || 'Unknown'}
                                                    <div className="text-[9px] opacity-60 font-bold uppercase mt-1 tracking-tighter">{item.contractor?.companyName}</div>
                                                </td>
                                            )}
                                            <td className="py-4 text-white-dark">{item.mobile || '-'}</td>
                                            {canSeeFinancials && (
                                                <td className="py-4">
                                                    <div className="font-black text-black dark:text-white-light text-base">₹{item.wage}</div>
                                                    <div className="text-[9px] text-primary uppercase font-bold tracking-widest mt-0.5">{item.wageType === 'Daily' ? 'Per Day' : 'Per Month'}</div>
                                                </td>
                                            )}
                                            <td className="py-4">{new Date(item.joiningDate).toLocaleDateString()}</td>
                                            <td className="text-center py-4 px-6">
                                                <div className="flex justify-center items-center gap-3">
                                                    <Link href={`/labour/list/${item._id}`} className="p-2 rounded-xl text-info hover:bg-info hover:text-white transition-all transform hover:scale-110 shadow-lg shadow-transparent hover:shadow-info/20">
                                                        <IconEye className="h-5 w-5" />
                                                    </Link>
                                                    {canEditRecord(currentUser, item.createdAt) && (
                                                        <button type="button" className="p-2 rounded-xl text-primary hover:bg-primary hover:text-white transition-all transform hover:scale-110 shadow-lg shadow-transparent hover:shadow-primary/20" onClick={() => handleEdit(item)}>
                                                            <IconEdit className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                    {isOwner && (<button type="button" className="p-2 rounded-xl text-danger hover:bg-danger hover:text-white transition-all transform hover:scale-110 shadow-lg shadow-transparent hover:shadow-danger/20" onClick={() => setDeleteId(item._id)}>
                                                        <IconTrashLines className="h-5 w-5" />
                                                    </button>)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <DeleteConfirmModal
                show={!!deleteId}
                onCancel={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Labour Profile"
                message="Are you sure you want to delete this labour profile? This action is permanent and cannot be undone."
            />
        </div>
    );
};

export default LabourListPage;
