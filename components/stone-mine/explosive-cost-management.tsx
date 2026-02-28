'use client';
import React, { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { useToast } from '@/components/stone-mine/toast-notification';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconPlus from '@/components/icon/icon-plus';
import IconSave from '@/components/icon/icon-save';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import IconSearch from '@/components/icon/icon-search';
import IconTrash from '@/components/icon/icon-trash';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';

const API = process.env.NEXT_PUBLIC_API_URL;

const ExplosiveCostManagement = () => {
    const { showToast } = useToast();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [masterMaterials, setMasterMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const initialMaterial = {
        name: '',
        unit: 'Nos',
        quantity: '',
        rate: '',
        amount: 0
    };

    const initialFormState = {
        category: 'Explosive Cost',
        date: new Date().toISOString().split('T')[0],
        site: '',
        supplierName: '',
        licenseNumber: '',
        supervisorName: '',
        paymentMode: 'Cash',
        description: '',
        materials: [{ ...initialMaterial }],
        amount: 0 // Grand Total
    };

    const [formData, setFormData] = useState<any>(initialFormState);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [expRes, supRes, matRes] = await Promise.all([
                axios.get(`${API}/expenses`, { params: { category: 'Explosive Cost' } }),
                axios.get(`${API}/vendors/explosive`),
                axios.get(`${API}/master/explosive-materials`)
            ]);

            if (expRes.data.success) setExpenses(expRes.data.data);
            if (supRes.data.success) setSuppliers(supRes.data.data);
            if (matRes.data.success) setMasterMaterials(matRes.data.data);
        } catch (error) {
            console.error(error);
            showToast('Error fetching data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const calculateGrandTotal = (materials: any[]) => {
        return materials.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    };

    const handleMaterialChange = (index: number, e: any) => {
        const { name, value } = e.target;
        const updatedMaterials = [...formData.materials];
        const material = { ...updatedMaterials[index], [name]: value };

        // Auto-calculate individual material amount
        if (name === 'quantity' || name === 'rate') {
            const qty = parseFloat(name === 'quantity' ? value : material.quantity) || 0;
            const rate = parseFloat(name === 'rate' ? value : material.rate) || 0;
            material.amount = qty * rate;
        }

        // If material name changes, try to auto-set unit and rate from master/supplier
        if (name === 'name') {
            const matMaster = masterMaterials.find(m => m.name === value);
            if (matMaster) {
                material.unit = matMaster.unit || 'Nos';
            }

            // Auto-fetch rate from selected supplier's specific pricing
            const selectedSup = suppliers.find(s => s.name === formData.supplierName);
            if (selectedSup && selectedSup.supplyItems) {
                const supItem = selectedSup.supplyItems.find((si: any) => si.material === value);
                if (supItem) {
                    material.rate = supItem.rate;
                    const qty = parseFloat(material.quantity) || 0;
                    material.amount = qty * supItem.rate;
                }
            }
        }

        updatedMaterials[index] = material;
        setFormData({
            ...formData,
            materials: updatedMaterials,
            amount: calculateGrandTotal(updatedMaterials)
        });
    };

    const addMaterialRow = () => {
        setFormData({
            ...formData,
            materials: [...formData.materials, { ...initialMaterial }]
        });
    };

    const removeMaterialRow = (index: number) => {
        if (formData.materials.length === 1) {
            showToast('At least one material is required', 'error');
            return;
        }
        const updatedMaterials = formData.materials.filter((_: any, i: number) => i !== index);
        setFormData({
            ...formData,
            materials: updatedMaterials,
            amount: calculateGrandTotal(updatedMaterials)
        });
    };

    const handleGeneralChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev: any) => {
            const updated = { ...prev, [name]: value };

            if (name === 'supplierName') {
                const selectedSup = suppliers.find(s => s.name === value);
                if (selectedSup) {
                    updated.licenseNumber = selectedSup.explosiveLicenseNumber || '';

                    // Automatically update rates and validate materials based on new supplier selection
                    const supMaterials = selectedSup.supplyItems?.map((i: any) => i.material) || [];
                    updated.materials = prev.materials.map((mat: any) => {
                        // If material is not provided by new supplier, reset it
                        if (mat.name && !supMaterials.includes(mat.name)) {
                            return { ...initialMaterial };
                        }

                        const supItem = selectedSup.supplyItems?.find((si: any) => si.material === mat.name);
                        if (supItem) {
                            const rate = supItem.rate;
                            const qty = parseFloat(mat.quantity) || 0;
                            return { ...mat, rate, amount: qty * rate };
                        }
                        return mat;
                    });
                    updated.amount = calculateGrandTotal(updated.materials);
                } else {
                    updated.licenseNumber = '';
                }
            }
            return updated;
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            // Validation: Ensure all materials have a name
            if (formData.materials.some((m: any) => !m.name)) {
                showToast('Please select material name for all rows', 'error');
                return;
            }

            if (editId) {
                await axios.put(`${API}/expenses/${editId}`, formData);
                showToast('Cost record updated successfully!', 'success');
            } else {
                await axios.post(`${API}/expenses`, formData);
                showToast('Cost record saved successfully!', 'success');
            }
            resetForm();
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error saving record', 'error');
        }
    };

    const handleEdit = (expense: any) => {
        setFormData({
            ...initialFormState,
            ...expense,
            date: expense.date.split('T')[0],
            materials: expense.materials?.length > 0 ? expense.materials : [{ ...initialMaterial }],
            amount: expense.amount || 0
        });
        setEditId(expense._id);
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
            await axios.delete(`${API}/expenses/${deleteId}`);
            showToast('Record deleted successfully!', 'success');
            setDeleteId(null);
            fetchData();
        } catch (error) {
            showToast('Error deleting record', 'error');
        }
    };

    const filteredExpenses = expenses.filter(exp =>
        exp.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.site?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white-light">Explosive Cost (வெடிகுண்டு செலவு)</h2>
                    <p className="text-white-dark text-sm mt-1">Record and track multi-material explosive usage costs.</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        Add New Entry
                    </button>
                )}
            </div>

            {showForm && (
                <div className="panel animate__animated animate__fadeIn">
                    <div className="flex items-center justify-between mb-5 border-b pb-4 dark:border-[#1b2e4b]">
                        <h5 className="font-bold text-lg">{editId ? 'Edit Cost Entry' : 'New Cost Entry'}</h5>
                        <button className="text-white-dark hover:text-danger" onClick={resetForm}>✕ Cancel</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Transaction Details */}
                        <div>
                            <h6 className="text-primary font-bold mb-4 flex items-center">
                                <span className="bg-primary text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">1</span>
                                General Details
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="text-sm font-bold">Entry Date *</label>
                                    <input type="date" name="date" className="form-input" value={formData.date} onChange={handleGeneralChange} required />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Site Location (இடம்) *</label>
                                    <select name="site" className="form-select" value={formData.site} onChange={handleGeneralChange} required>
                                        <option value="">Select Location</option>
                                        <option value="Main Quarry Pit">Main Quarry Pit</option>
                                        <option value="Crusher Side">Crusher Side</option>
                                        <option value="Hill Blasting Zone">Hill Blasting Zone</option>
                                        <option value="Section A">Section A</option>
                                        <option value="Section B">Section B</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Supervisor / Blaster Name</label>
                                    <input type="text" name="supervisorName" className="form-input" value={formData.supervisorName} onChange={handleGeneralChange} placeholder="Licensed Blaster Name" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Supplier Selection */}
                        <div className="pt-4 border-t dark:border-[#1b2e4b]">
                            <h6 className="text-danger font-bold mb-4 flex items-center">
                                <span className="bg-danger text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">2</span>
                                Supplier Selection
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-bold text-danger">Select Supplier (பெயர்) *</label>
                                    <select name="supplierName" className="form-select border-danger/30" value={formData.supplierName} onChange={handleGeneralChange} required>
                                        <option value="">-- Choose Supplier --</option>
                                        {suppliers.map(sup => (
                                            <option key={sup._id} value={sup.name}>{sup.name} ({sup.companyName})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold opacity-70">License Number (Read-only)</label>
                                    <input type="text" name="licenseNumber" className="form-input bg-gray-100 dark:bg-dark-light/10 cursor-not-allowed" value={formData.licenseNumber} readOnly />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Usage Details (Multiple Materials) */}
                        <div className="pt-4 border-t dark:border-[#1b2e4b]">
                            <div className="flex items-center justify-between mb-4">
                                <h6 className="text-warning font-bold flex items-center">
                                    <span className="bg-warning text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">3</span>
                                    Usage Details (பயன்படுத்தப்பட்ட பொருட்கள்)
                                </h6>
                                <button type="button" className="btn btn-sm btn-outline-warning" onClick={addMaterialRow}>
                                    <IconPlus className="w-4 h-4 mr-1" /> Add Material
                                </button>
                            </div>

                            <div className="table-responsive">
                                <table className="table-hover custom-table">
                                    <thead>
                                        <tr>
                                            <th className="w-1/4">Material Type</th>
                                            <th className="w-[15%]">Unit</th>
                                            <th className="w-[15%]">Quantity</th>
                                            <th className="w-[15%]">Rate (₹)</th>
                                            <th className="w-[20%] text-right">Total (₹)</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.materials.map((mat: any, index: number) => (
                                            <tr key={index}>
                                                <td>
                                                    <select
                                                        className="form-select text-xs"
                                                        name="name"
                                                        value={mat.name}
                                                        onChange={(e) => handleMaterialChange(index, e)}
                                                        required
                                                    >
                                                        <option value="">Select</option>
                                                        {suppliers.find(s => s.name === formData.supplierName)?.supplyItems?.map((item: any, idx: number) => (
                                                            <option key={idx} value={item.material}>{item.material}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <select
                                                        className="form-select text-xs"
                                                        name="unit"
                                                        value={mat.unit}
                                                        onChange={(e) => handleMaterialChange(index, e)}
                                                    >
                                                        <option value="Nos">Nos</option>
                                                        <option value="Box">Box</option>
                                                        <option value="Kg">Kg</option>
                                                        <option value="Meters">Meters</option>
                                                        <option value="Units">Units</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-input text-xs"
                                                        name="quantity"
                                                        value={mat.quantity}
                                                        onChange={(e) => handleMaterialChange(index, e)}
                                                        required min="0" step="any"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-input text-xs"
                                                        name="rate"
                                                        value={mat.rate}
                                                        onChange={(e) => handleMaterialChange(index, e)}
                                                        required min="0" step="any"
                                                    />
                                                </td>
                                                <td className="text-right font-bold py-3 text-primary">
                                                    ₹{mat.amount.toLocaleString()}
                                                </td>
                                                <td>
                                                    <button type="button" onClick={() => removeMaterialRow(index)} className="text-danger hover:text-white dark:hover:text-danger hover:bg-danger/10 rounded p-1 transition-colors">
                                                        <IconTrash className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-primary/5">
                                            <td colSpan={4} className="text-right font-black uppercase text-xs py-4">Grand Total (மொத்த தொகை):</td>
                                            <td className="text-right font-black text-lg text-primary py-4">
                                                ₹{formData.amount.toLocaleString()}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="pt-4 border-t dark:border-[#1b2e4b]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-bold">Payment Mode</label>
                                    <select name="paymentMode" className="form-select" value={formData.paymentMode} onChange={handleGeneralChange}>
                                        <option value="Cash">Cash (ரொக்கம்)</option>
                                        <option value="Credit">Credit (கடன்)</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="UPI">UPI / G-Pay</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Description / Remarks</label>
                                    <input type="text" name="description" className="form-input" value={formData.description} onChange={handleGeneralChange} placeholder="Extra notes..." />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-5 gap-3 border-t dark:border-[#1b2e4b]">
                            <button type="button" className="btn btn-outline-danger" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-10">
                                <IconSave className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                {editId ? 'Update Entry' : 'Save Entry'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <div className="panel">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                        <h5 className="font-bold text-lg dark:text-white-light">Usage History</h5>
                        <div className="relative w-full max-w-xs">
                            <input
                                type="text"
                                placeholder="Search by supplier or site..."
                                className="form-input ltr:pr-11 rtl:pl-11"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <IconSearch className="w-5 h-5 absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-white-dark" />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Site</th>
                                    <th>Materials Used</th>
                                    <th>Supplier</th>
                                    <th className="!text-right">Grand Total</th>
                                    <th className="!text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-primary">Loading data...</td></tr>
                                ) : filteredExpenses.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-8">No records found.</td></tr>
                                ) : (
                                    filteredExpenses.map((exp) => (
                                        <tr key={exp._id}>
                                            <td className="font-semibold">{new Date(exp.date).toLocaleDateString()}</td>
                                            <td><span className="badge badge-outline-secondary">{exp.site}</span></td>
                                            <td>
                                                {exp.materials?.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {exp.materials.map((m: any, idx: number) => (
                                                            <div key={idx} className="bg-warning/10 text-warning px-2 py-0.5 rounded text-[10px] border border-warning/20">
                                                                {m.name}: {m.quantity} {m.unit}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="font-bold">{exp.explosiveType} <span className="text-xs font-normal">({exp.quantity} {exp.unit})</span></div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="text-primary font-bold">{exp.supplierName}</div>
                                                <div className="text-[10px] opacity-60">Lic: {exp.licenseNumber}</div>
                                            </td>
                                            <td className="!text-right font-black text-primary text-base">₹{(exp.amount || 0).toLocaleString()}</td>
                                            <td className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleEdit(exp)} className="btn btn-sm btn-outline-primary p-1">
                                                        <IconEdit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteId(exp._id)} className="btn btn-sm btn-outline-danger p-1">
                                                        <IconTrashLines className="w-4 h-4" />
                                                    </button>
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
                title="Delete Entry"
                message="Are you sure you want to delete this explosive cost record?"
            />
        </div>
    );
};

export default ExplosiveCostManagement;
