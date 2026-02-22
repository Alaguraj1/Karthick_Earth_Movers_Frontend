'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/components/stone-mine/toast-notification';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';
import IconPlus from '@/components/icon/icon-plus';
import IconSave from '@/components/icon/icon-save';
import IconSearch from '@/components/icon/icon-search';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';

const API = process.env.NEXT_PUBLIC_API_URL;

const LabourContractorManagement = () => {
    const { showToast } = useToast();
    const [contractors, setContractors] = useState<any[]>([]);
    const [balances, setBalances] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const initialContract = {
        workType: 'Quarry loading',
        rateType: 'Per Day',
        agreedRate: '0',
        labourCount: '0'
    };

    const initialFormState = {
        name: '',
        companyName: '',
        mobileNumber: '',
        address: '',
        gstNumber: '',
        panNumber: '',
        contracts: [{ ...initialContract }],
        noOfWorkers: '0',
        supervisorName: '',
        shift: 'Day',
        paymentMode: 'Cash',
        creditTerms: '7 days',
        advancePaid: '0',
        outstandingBalance: '0'
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [labRes, balRes] = await Promise.all([
                axios.get(`${API}/vendors/labour`),
                axios.get(`${API}/vendors/outstanding`)
            ]);

            if (labRes.data.success) setContractors(labRes.data.data);

            const balMap: any = {};
            if (balRes.data.success) {
                balRes.data.data.forEach((b: any) => {
                    if (b.vendorType === 'LabourContractor') {
                        balMap[b.vendorId] = b.balance;
                    }
                });
            }
            setBalances(balMap);
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
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleContractChange = (index: number, e: any) => {
        const { name, value } = e.target;
        const updatedContracts = [...formData.contracts];
        updatedContracts[index] = { ...updatedContracts[index], [name]: value };
        setFormData({ ...formData, contracts: updatedContracts });
    };

    const addContractRow = () => {
        setFormData({
            ...formData,
            contracts: [...formData.contracts, { ...initialContract }]
        });
    };

    const removeContractRow = (index: number) => {
        if (formData.contracts.length === 1) {
            showToast('At least one contract detail is required', 'error');
            return;
        }
        const updatedContracts = formData.contracts.filter((_, i) => i !== index);
        setFormData({ ...formData, contracts: updatedContracts });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                contracts: formData.contracts.map(c => ({
                    ...c,
                    agreedRate: Number(c.agreedRate),
                    labourCount: Number(c.labourCount)
                })),
                noOfWorkers: totalWorkers,
                advancePaid: Number(formData.advancePaid || 0),
                outstandingBalance: Number(formData.outstandingBalance || 0)
            };
            if (editId) {
                await axios.put(`${API}/vendors/labour/${editId}`, data);
                showToast('Contractor updated successfully!', 'success');
            } else {
                await axios.post(`${API}/vendors/labour`, data);
                showToast('Contractor registered successfully!', 'success');
            }
            resetForm();
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error saving contractor', 'error');
        }
    };

    const handleEdit = (vendor: any) => {
        setFormData({
            name: vendor.name,
            companyName: vendor.companyName || '',
            mobileNumber: vendor.mobileNumber,
            address: vendor.address || '',
            gstNumber: vendor.gstNumber || '',
            panNumber: vendor.panNumber || '',
            contracts: vendor.contracts && vendor.contracts.length > 0 ? vendor.contracts : [{ ...initialContract }],
            noOfWorkers: vendor.noOfWorkers?.toString() || '0',
            supervisorName: vendor.supervisorName || '',
            shift: vendor.shift || 'Day',
            paymentMode: vendor.paymentMode || 'Cash',
            creditTerms: vendor.creditTerms || '7 days',
            advancePaid: vendor.advancePaid?.toString() || '0',
            outstandingBalance: vendor.outstandingBalance?.toString() || '0'
        });
        setEditId(vendor._id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setEditId(null);
        setShowForm(false);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`${API}/vendors/labour/${deleteId}`);
            showToast('Contractor deleted successfully!', 'success');
            setDeleteId(null);
            fetchData();
        } catch (error) {
            showToast('Error deleting contractor', 'error');
        }
    };

    const totalWorkers = formData.contracts.reduce((acc: number, c: any) => acc + Number(c.labourCount || 0), 0);
    const totalContractAmount = formData.contracts.reduce((acc: number, c: any) => acc + (Number(c.labourCount || 0) * Number(c.agreedRate || 0)), 0);

    const filteredContractors = contractors.filter((c) =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mobileNumber?.includes(searchQuery)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white-light">Labour Contractor Management (தொழிலாளர் ஒப்பந்ததாரர்)</h2>
                    <p className="text-white-dark text-sm mt-1">Manage external contractors, multiple work contracts, and payment balances.</p>
                </div>
                {!showForm && (
                    <button className="btn btn-warning" onClick={() => setShowForm(true)}>
                        <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        Add New Contractor
                    </button>
                )}
            </div>

            {showForm && (
                <div className="panel animate__animated animate__fadeIn">
                    <div className="flex items-center justify-between mb-5 border-b pb-4 dark:border-[#1b2e4b]">
                        <h5 className="font-bold text-lg">{editId ? 'Edit Contractor' : 'Register New Contractor'}</h5>
                        <button className="text-white-dark hover:text-danger" onClick={resetForm}>✕ Cancel</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <h6 className="text-primary font-bold mb-4 flex items-center">
                                <span className="bg-primary text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">1</span>
                                Basic Details (அடிப்படை தகவல்)
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="text-sm font-bold">Contractor Name *</label>
                                    <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Company Name (If Any)</label>
                                    <input type="text" name="companyName" className="form-input" value={formData.companyName} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Mobile Number *</label>
                                    <input type="text" name="mobileNumber" className="form-input" value={formData.mobileNumber} onChange={handleChange} required />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="text-sm font-bold">Address</label>
                                    <input type="text" name="address" className="form-input" value={formData.address} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">GST Number</label>
                                    <input type="text" name="gstNumber" className="form-input" value={formData.gstNumber} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">PAN Number</label>
                                    <input type="text" name="panNumber" className="form-input" value={formData.panNumber} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t dark:border-[#1b2e4b]">
                            <div className="flex flex-col sm:items-center sm:justify-between sm:flex-row gap-4 mb-4">
                                <h6 className="text-info font-bold flex items-center">
                                    <span className="bg-info text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">2</span>
                                    Contract Details (ஒப்பந்த விவரம்)
                                </h6>
                                <button type="button" className="btn btn-sm btn-outline-info w-fit" onClick={addContractRow}>
                                    <IconPlus className="w-4 h-4 mr-1" /> Add Work Contract
                                </button>
                            </div>

                            <div className="table-responsive">
                                <table className="table-hover custom-table min-w-[1000px]">
                                    <thead>
                                        <tr>
                                            <th className="w-48">Work Type</th>
                                            <th className="w-40">Rate Type</th>
                                            <th className="w-32 text-right whitespace-nowrap">Labour Count</th>
                                            <th className="w-40 text-right">Rate (Per Lab) (₹) *</th>
                                            <th className="w-40 text-right">Total Rate (₹)</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.contracts.map((contract: any, index: number) => (
                                            <tr key={index}>
                                                <td>
                                                    <select className="form-select text-xs" name="workType" value={contract.workType} onChange={(e) => handleContractChange(index, e)} required>
                                                        <option value="Quarry loading">Quarry loading</option>
                                                        <option value="Drilling">Drilling</option>
                                                        <option value="Crusher labour">Crusher labour</option>
                                                        <option value="Blasting support">Blasting support</option>
                                                        <option value="Transporter">Transporter</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <select className="form-select text-xs" name="rateType" value={contract.rateType} onChange={(e) => handleContractChange(index, e)}>
                                                        <option value="Per Day">Per Day</option>
                                                        <option value="Per Ton">Per Ton</option>
                                                        <option value="Per Load">Per Load</option>
                                                        <option value="Monthly Contract">Monthly Contract</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <input type="number" className="form-input text-xs text-right" name="labourCount" value={contract.labourCount} onChange={(e) => handleContractChange(index, e)} min="0" />
                                                </td>
                                                <td>
                                                    <input type="number" className="form-input text-xs text-right font-bold" name="agreedRate" value={contract.agreedRate} onChange={(e) => handleContractChange(index, e)} required min="0" step="any" />
                                                </td>
                                                <td>
                                                    <div className="form-input text-xs text-right bg-dark/5 font-black text-primary">
                                                        ₹{(Number(contract.labourCount || 0) * Number(contract.agreedRate || 0)).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <button type="button" onClick={() => removeContractRow(index)} className="text-danger hover:text-white dark:hover:text-danger hover:bg-danger/10 rounded p-1 transition-colors">
                                                        <IconTrash className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="pt-4 border-t dark:border-[#1b2e4b]">
                            <h6 className="text-secondary font-bold mb-4 flex items-center">
                                <span className="bg-secondary text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">3</span>
                                Labour Strength (தொழிலாளர் எண்ணிக்கை)
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="text-sm font-bold text-info">No. of Workers (Auto-filled)</label>
                                    <input type="number" name="noOfWorkers" className="form-input bg-info/5 font-bold text-info" value={totalWorkers} readOnly />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Supervisor Name</label>
                                    <input type="text" name="supervisorName" className="form-input" value={formData.supervisorName} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Shift</label>
                                    <select name="shift" className="form-select" value={formData.shift} onChange={handleChange}>
                                        <option value="Day">Day</option>
                                        <option value="Night">Night</option>
                                        <option value="Both">Both</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t dark:border-[#1b2e4b]">
                            <h6 className="text-success font-bold mb-4 flex items-center">
                                <span className="bg-success text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">4</span>
                                Payment Details (கட்டணம் தகவல்)
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                <div>
                                    <label className="text-sm font-bold">Payment Mode</label>
                                    <select name="paymentMode" className="form-select" value={formData.paymentMode} onChange={handleChange}>
                                        <option value="Cash">Cash</option>
                                        <option value="Bank">Bank</option>
                                        <option value="UPI">UPI</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Credit Terms</label>
                                    <select name="creditTerms" className="form-select" value={formData.creditTerms} onChange={handleChange}>
                                        <option value="7 days">7 days</option>
                                        <option value="15 days">15 days</option>
                                        <option value="30 days">30 days</option>
                                        <option value="Immediate">Immediate</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Advance Paid (₹)</label>
                                    <input type="number" name="advancePaid" className="form-input" value={formData.advancePaid} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-primary">Total Contract Amount (₹)</label>
                                    <input type="text" className="form-input bg-primary/5 font-black text-primary" value={totalContractAmount.toLocaleString()} readOnly />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-danger">Opening Balance (₹)</label>
                                    <input type="number" name="outstandingBalance" className="form-input font-bold border-danger/20 text-danger" value={formData.outstandingBalance} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-5 gap-3 border-t dark:border-[#1b2e4b]">
                            <button type="button" className="btn btn-outline-danger" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="btn btn-warning px-10">
                                <IconSave className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                {editId ? 'Update Contractor' : 'Save Contractor'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <div className="panel border-t-4 border-warning">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                        <h5 className="font-bold text-lg dark:text-white-light">Registered Contractors</h5>
                        <div className="relative w-full max-w-xs">
                            <input type="text" placeholder="Search..." className="form-input ltr:pr-11 rtl:pl-11" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            <IconSearch className="w-5 h-5 absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-white-dark" />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Contractor Info</th>
                                    <th>Work Contracts</th>
                                    <th className="!text-center">Workers</th>
                                    <th>Payment Settings</th>
                                    <th className="!text-right text-danger">Outstanding (₹)</th>
                                    <th className="!text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                                ) : filteredContractors.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-8">No matching contractors found.</td></tr>
                                ) : (
                                    filteredContractors.map((c) => (
                                        <tr key={c._id}>
                                            <td>
                                                <div className="font-bold text-warning">{c.name}</div>
                                                <div className="text-xs text-white-dark">{c.mobileNumber}</div>
                                            </td>
                                            <td>
                                                {c.contracts?.map((contract: any, idx: number) => (
                                                    <div key={idx} className="mb-2 last:mb-0 pb-1 border-b border-white-light/10 last:border-0">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] font-bold text-info uppercase">{contract.workType}</span>
                                                            <span className="badge bg-warning/10 text-warning text-[10px]">{contract.labourCount || 0} x ₹{contract.agreedRate}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-1 italic">
                                                            <span className="text-[9px] text-white-dark uppercase">{contract.rateType}</span>
                                                            <span className="text-[11px] font-black text-primary">Total: ₹{(Number(contract.labourCount || 0) * Number(contract.agreedRate || 0)).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="text-center">
                                                <div className="badge bg-dark/10 text-dark dark:text-white-light px-3">{c.noOfWorkers || 0}</div>
                                                <div className="text-[10px] mt-1 uppercase font-bold text-white-dark">{c.shift}</div>
                                            </td>
                                            <td>
                                                <div className="text-xs font-semibold">{c.paymentMode} | {c.creditTerms}</div>
                                                <div className="text-[10px] text-success font-bold mt-1">Adv: ₹{c.advancePaid?.toLocaleString() || 0}</div>
                                            </td>
                                            <td className="!text-right font-black text-danger text-base whitespace-nowrap">
                                                ₹{(() => {
                                                    const contractTotal = c.contracts?.reduce((acc: number, con: any) => acc + (Number(con.labourCount || 0) * Number(con.agreedRate || 0)), 0) || 0;
                                                    const balance = (contractTotal + (c.outstandingBalance || 0)) - (c.advancePaid || 0) + (balances[c._id] || 0);
                                                    return balance.toLocaleString();
                                                })()}
                                            </td>
                                            <td className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleEdit(c)} className="btn btn-sm btn-outline-primary p-1"><IconEdit className="w-4 h-4" /></button>
                                                    <button onClick={() => setDeleteId(c._id)} className="btn btn-sm btn-outline-danger p-1"><IconTrashLines className="w-4 h-4" /></button>
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
                title="Delete Contractor"
                message="Are you sure you want to delete this labour contractor? This action cannot be undone."
            />
        </div>
    );
};

export default LabourContractorManagement;
