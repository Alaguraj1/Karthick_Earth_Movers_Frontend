'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import IconPlus from '@/components/icon/icon-plus';
import IconSave from '@/components/icon/icon-save';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';

const ProductionEntry = () => {
    const [productions, setProductions] = useState([]);
    const [machines, setMachines] = useState([]);
    const [stoneTypes, setStoneTypes] = useState([]);
    const [labours, setLabours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    interface MachineEntry {
        machineId: string;
        workingHours: string;
        dieselUsed: string;
    }

    interface ProductionDetail {
        stoneType: string;
        quantity: string;
        unit: string;
        noOfLoads: string;
        crusherOutput: string;
        openingStock: string;
        dispatchedQuantity: string;
        closingStock: string;
    }

    interface WorkerEntry {
        labourId: string;
        name: string;
        wage: string;
        wageType: string;
    }

    interface ProductionFormData {
        date: string;
        shift: string;
        siteName: string;
        supervisorName: string;
        machines: MachineEntry[];
        productionDetails: ProductionDetail[];
        noOfWorkers: string;
        labourDetails: WorkerEntry[];
        operatorDetails: WorkerEntry[];
        shiftWage: string;
        remarks: {
            breakdown: boolean;
            rainDelay: boolean;
            powerCut: boolean;
            blastingDone: boolean;
            otherRemarks: string;
            [key: string]: any;
        };
        [key: string]: any;
    }

    const emptyWorker: WorkerEntry = { labourId: '', name: '', wage: '0', wageType: 'Daily' };

    const initialFormState: ProductionFormData = {
        date: new Date().toISOString().split('T')[0],
        shift: 'Shift 1',
        siteName: '',
        supervisorName: '',
        machines: [{ machineId: '', workingHours: '', dieselUsed: '' }],
        productionDetails: [{
            stoneType: '',
            quantity: '',
            unit: 'Tons',
            noOfLoads: '',
            crusherOutput: '',
            openingStock: '0',
            dispatchedQuantity: '0',
            closingStock: '0'
        }],
        noOfWorkers: '',
        labourDetails: [{ ...emptyWorker }],
        operatorDetails: [{ ...emptyWorker }],
        shiftWage: '0',
        remarks: {
            breakdown: false,
            rainDelay: false,
            powerCut: false,
            blastingDone: false,
            otherRemarks: ''
        }
    };

    const [formData, setFormData] = useState<ProductionFormData>(initialFormState);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, machRes, stoneRes, labourRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/production`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/master/vehicles`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/master/stone-types`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/master/labours`)
            ]);
            setProductions(prodRes.data.data);
            setMachines(machRes.data.data.filter((v: any) => v.type === 'Machine' || v.category?.toLowerCase().includes('crusher') || v.category?.toLowerCase().includes('jcb')));
            setStoneTypes(stoneRes.data.data);
            setLabours(labourRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Auto calculation for Stock (Modified for Array)
    useEffect(() => {
        const updatedDetails = formData.productionDetails.map(item => {
            const opening = parseFloat(item.openingStock) || 0;
            const production = parseFloat(item.quantity) || 0;
            const dispatched = parseFloat(item.dispatchedQuantity) || 0;

            const totalStock = opening + production;
            const closing = totalStock - dispatched;

            return {
                ...item,
                closingStock: closing.toString()
            };
        });

        // Only update if values actually changed to prevent infinite loop
        const isChanged = JSON.stringify(updatedDetails) !== JSON.stringify(formData.productionDetails);
        if (isChanged) {
            setFormData(prev => ({ ...prev, productionDetails: updatedDetails }));
        }
    }, [formData.productionDetails]);

    const addMachineRow = () => {
        setFormData(prev => ({
            ...prev,
            machines: [...prev.machines, { machineId: '', workingHours: '', dieselUsed: '' }],
            // Auto-add operator row to match machine count
            operatorDetails: [...prev.operatorDetails, { ...emptyWorker }]
        }));
    };

    const removeMachineRow = (index: number) => {
        if (formData.machines.length > 1) {
            const updatedMachines = formData.machines.filter((_, i) => i !== index);
            // Auto-remove last operator row to match machine count
            const updatedOperators = formData.operatorDetails.length > updatedMachines.length
                ? formData.operatorDetails.slice(0, updatedMachines.length)
                : formData.operatorDetails;
            setFormData(prev => ({ ...prev, machines: updatedMachines, operatorDetails: updatedOperators.length > 0 ? updatedOperators : [{ ...emptyWorker }] }));
        }
    };

    const handleMachineChange = (index: number, field: keyof MachineEntry, value: string) => {
        const updated = [...formData.machines];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, machines: updated }));
    };

    const addProductionRow = () => {
        setFormData(prev => ({
            ...prev,
            productionDetails: [...prev.productionDetails, {
                stoneType: '',
                quantity: '',
                unit: 'Tons',
                noOfLoads: '',
                crusherOutput: '',
                openingStock: '0',
                dispatchedQuantity: '0',
                closingStock: '0'
            }]
        }));
    };

    const removeProductionRow = (index: number) => {
        if (formData.productionDetails.length > 1) {
            const updated = formData.productionDetails.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, productionDetails: updated }));
        }
    };

    const handleProductionChange = (index: number, field: keyof ProductionDetail, value: string) => {
        const updated = [...formData.productionDetails];
        updated[index] = { ...updated[index], [field]: value };

        // Auto unit selection & Normalization & Stock Fetching
        if (field === 'stoneType') {
            const selected = stoneTypes.find((s: any) => s._id === value);
            if (selected) {
                let unit = (selected as any).unit || 'Tons';
                // Normalize singular to plural for consistency
                if (unit === 'Ton') unit = 'Tons';
                if (unit === 'Unit') unit = 'Units';
                updated[index].unit = unit;

                // Auto-fetch Opening Stock from Master Current Stock (only for new entries)
                if (!editId) {
                    updated[index].openingStock = (selected as any).currentStock?.toString() || '0';
                }
            }
        }

        setFormData(prev => ({ ...prev, productionDetails: updated }));
    };

    // --- Labour Helpers ---
    const addLabourRow = () => {
        setFormData(prev => ({ ...prev, labourDetails: [...prev.labourDetails, { ...emptyWorker }] }));
    };
    const removeLabourRow = (index: number) => {
        if (formData.labourDetails.length > 1) {
            const updated = formData.labourDetails.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, labourDetails: updated }));
        }
    };
    const handleLabourSelect = (index: number, labourId: string) => {
        const updated = [...formData.labourDetails];
        const found = labours.find((l: any) => l._id === labourId);
        if (found) {
            updated[index] = {
                labourId: (found as any)._id,
                name: (found as any).name,
                wage: (found as any).wage?.toString() || '0',
                wageType: (found as any).wageType || 'Daily'
            };
        } else {
            updated[index] = { ...emptyWorker };
        }
        setFormData(prev => ({ ...prev, labourDetails: updated }));
    };

    // --- Operator Helpers ---
    // Note: Operator rows are auto-managed based on machine count.
    // Manual add only if more operators are needed beyond machine count.
    const addOperatorRow = () => {
        setFormData(prev => ({ ...prev, operatorDetails: [...prev.operatorDetails, { ...emptyWorker }] }));
    };
    const removeOperatorRow = (index: number) => {
        if (formData.operatorDetails.length > 1) {
            const updated = formData.operatorDetails.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, operatorDetails: updated }));
        }
    };
    const handleOperatorSelect = (index: number, labourId: string) => {
        const updated = [...formData.operatorDetails];
        const found = labours.find((l: any) => l._id === labourId);
        if (found) {
            updated[index] = {
                labourId: (found as any)._id,
                name: (found as any).name,
                wage: (found as any).wage?.toString() || '0',
                wageType: (found as any).wageType || 'Daily'
            };
        } else {
            updated[index] = { ...emptyWorker };
        }
        setFormData(prev => ({ ...prev, operatorDetails: updated }));
    };

    // --- Auto-calculate total shift wage ---
    useEffect(() => {
        let total = 0;
        for (const w of formData.labourDetails) {
            const wage = parseFloat(w.wage) || 0;
            if (w.wageType === 'Monthly') {
                total += Math.round(wage / 30); // daily equivalent
            } else {
                total += wage;
            }
        }
        for (const w of formData.operatorDetails) {
            const wage = parseFloat(w.wage) || 0;
            if (w.wageType === 'Monthly') {
                total += Math.round(wage / 30);
            } else {
                total += wage;
            }
        }
        const newTotal = total.toString();
        if (newTotal !== formData.shiftWage) {
            setFormData(prev => ({ ...prev, shiftWage: newTotal }));
        }
    }, [formData.labourDetails, formData.operatorDetails]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof ProductionFormData] as any),
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/production/${editId}`, formData);
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/production`, formData);
            }
            setShowForm(false);
            setEditId(null);
            setFormData(initialFormState);
            fetchData();
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save entry');
        }
    };

    const handleEdit = (prod: any) => {
        setFormData({
            ...initialFormState,
            date: new Date(prod.date).toISOString().split('T')[0],
            shift: prod.shift || 'Shift 1',
            siteName: prod.siteName || '',
            supervisorName: prod.supervisorName || '',
            machines: prod.machines && prod.machines.length > 0
                ? prod.machines.map((m: any) => ({
                    machineId: m.machineId?._id || m.machineId || '',
                    workingHours: m.workingHours?.toString() || '',
                    dieselUsed: m.dieselUsed?.toString() || ''
                }))
                : [{ machineId: '', workingHours: '', dieselUsed: '' }],
            productionDetails: prod.productionDetails && prod.productionDetails.length > 0
                ? prod.productionDetails.map((pd: any) => ({
                    stoneType: pd.stoneType?._id || pd.stoneType || '',
                    quantity: pd.quantity?.toString() || '',
                    unit: pd.unit || 'Tons',
                    noOfLoads: pd.noOfLoads?.toString() || '',
                    crusherOutput: pd.crusherOutput || '',
                    openingStock: pd.openingStock?.toString() || '0',
                    dispatchedQuantity: pd.dispatchedQuantity?.toString() || '0',
                    closingStock: pd.closingStock?.toString() || '0'
                }))
                : initialFormState.productionDetails,
            noOfWorkers: prod.noOfWorkers?.toString() || '',
            labourDetails: prod.labourDetails && prod.labourDetails.length > 0
                ? prod.labourDetails.map((l: any) => ({
                    labourId: l.labourId?._id || l.labourId || '',
                    name: l.name || '',
                    wage: l.wage?.toString() || '0',
                    wageType: l.wageType || 'Daily'
                }))
                : [{ ...emptyWorker }],
            operatorDetails: prod.operatorDetails && prod.operatorDetails.length > 0
                ? prod.operatorDetails.map((o: any) => ({
                    labourId: o.labourId?._id || o.labourId || '',
                    name: o.name || '',
                    wage: o.wage?.toString() || '0',
                    wageType: o.wageType || 'Daily'
                }))
                : [{ ...emptyWorker }],
            shiftWage: prod.shiftWage?.toString() || '0',
            remarks: prod.remarks || initialFormState.remarks
        });
        setEditId(prod._id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this entry?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/production/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-black uppercase tracking-tight">Daily Stone Production (தினசரி உற்பத்தி பதிவு)</h2>
                <button
                    className="btn btn-primary shadow-xl rounded-xl py-2.5 px-6 font-black uppercase tracking-widest text-[10px]"
                    onClick={() => {
                        setShowForm(!showForm);
                        if (!showForm) {
                            setEditId(null);
                            setFormData(initialFormState);
                        }
                    }}
                >
                    {showForm ? 'View All Logs' : <><IconPlus className="mr-2 w-4 h-4" /> New Log Entry</>}
                </button>
            </div>

            {showForm ? (
                <div className="animate__animated animate__fadeInUp space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Basic Details */}
                        <div className="panel border-none shadow-xl rounded-2xl p-8">
                            <h5 className="text-lg font-black uppercase tracking-widest text-primary mb-6 border-l-4 border-primary pl-4">1. Basic Details (அடிப்படை விவரங்கள்)</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white-dark mb-2 block">Date</label>
                                    <Flatpickr value={formData.date} options={{ dateFormat: 'Y-m-d' }} className="form-input font-bold rounded-xl h-12" onChange={(date) => setFormData({ ...formData, date: date[0].toISOString().split('T')[0] })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white-dark mb-2 block">Shift</label>
                                    <select className="form-select font-bold rounded-xl h-12" name="shift" value={formData.shift} onChange={handleChange} required>
                                        <option value="Shift 1">Shift 1</option>
                                        <option value="Shift 2">Shift 2</option>
                                        <option value="Full Day">Full Day</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white-dark mb-2 block">Site / Quarry Name</label>
                                    <input type="text" name="siteName" className="form-input font-bold rounded-xl h-12" value={formData.siteName} onChange={handleChange} placeholder="Enter site name..." />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white-dark mb-2 block">Supervisor Name</label>
                                    <select
                                        name="supervisorName"
                                        className="form-select font-bold rounded-xl h-12"
                                        value={formData.supervisorName}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Supervisor</option>
                                        {labours
                                            .filter((l: any) => l.workType?.toLowerCase() === 'supervisor' || l.workType?.toLowerCase() === 'superviser')
                                            .map((l: any) => (
                                                <option key={l._id} value={l.name}>{l.name}</option>
                                            ))
                                        }
                                        {labours.filter((l: any) => l.workType?.toLowerCase() === 'supervisor' || l.workType?.toLowerCase() === 'superviser').length === 0 && (
                                            <option disabled>No Supervisors found in Labour list</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Machine Details */}
                        <div className="panel border-none shadow-xl rounded-2xl p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h5 className="text-lg font-black uppercase tracking-widest text-warning border-l-4 border-warning pl-4">2. Machine Details (இயந்திர விவரம்)</h5>
                                <button type="button" className="btn btn-outline-warning btn-sm rounded-lg py-1.5 font-bold uppercase tracking-wider text-[10px]" onClick={addMachineRow}>
                                    <IconPlus className="mr-1.5 w-3.5 h-3.5" /> Add Another Machine
                                </button>
                            </div>

                            <div className="space-y-6">
                                {formData.machines.map((mach, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 rounded-2xl border-2 border-dashed border-gray-100 relative group/row">
                                        {formData.machines.length > 1 && (
                                            <button
                                                type="button"
                                                className="absolute -top-3 -right-3 bg-danger text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover/row:opacity-100 transition-opacity"
                                                onClick={() => removeMachineRow(index)}
                                            >
                                                <IconTrashLines className="w-4 h-4" />
                                            </button>
                                        )}
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white-dark mb-2 block">Machine Used</label>
                                            <select
                                                className="form-select font-bold rounded-xl h-12"
                                                value={mach.machineId}
                                                onChange={(e) => handleMachineChange(index, 'machineId', e.target.value)}
                                                required
                                            >
                                                <option value="">Select Machine</option>
                                                {machines.map((m: any) => (
                                                    <option key={m._id} value={m._id}>{m.name} ({m.registrationNumber || m.vehicleNumber})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white-dark mb-2 block">Working Hours</label>
                                            <input
                                                type="number"
                                                className="form-input font-bold rounded-xl h-12"
                                                value={mach.workingHours}
                                                onChange={(e) => handleMachineChange(index, 'workingHours', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white-dark mb-2 block">Diesel Used (Litres)</label>
                                            <input
                                                type="number"
                                                className="form-input font-bold rounded-xl h-12"
                                                value={mach.dieselUsed}
                                                onChange={(e) => handleMachineChange(index, 'dieselUsed', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 3: Production & Stock (Merged & Repeatable) */}
                        <div className="panel border-none shadow-xl rounded-2xl p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h5 className="text-lg font-black uppercase tracking-widest text-success border-l-4 border-success pl-4">3. Production & Stock Details (உற்பத்தி & கையிருப்பு)</h5>
                                <button type="button" className="btn btn-outline-success btn-sm rounded-lg py-1.5 font-bold uppercase tracking-wider text-[10px]" onClick={addProductionRow}>
                                    <IconPlus className="mr-1.5 w-3.5 h-3.5" /> Add Another Stone Type
                                </button>
                            </div>

                            <div className="space-y-10">
                                {formData.productionDetails.map((item, index) => (
                                    <div key={index} className="space-y-6 p-8 rounded-3xl border-2 border-gray-100 bg-gray-50/30 relative mt-4">
                                        {formData.productionDetails.length > 1 && (
                                            <button
                                                type="button"
                                                className="absolute -top-4 -right-4 bg-danger text-white p-2 rounded-full shadow-2xl z-10 hover:scale-110 transition-transform"
                                                onClick={() => removeProductionRow(index)}
                                            >
                                                <IconTrashLines className="w-5 h-5" />
                                            </button>
                                        )}

                                        {/* Production Inputs */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white-dark mb-2 block">Stone Type</label>
                                                <select
                                                    className="form-select font-bold rounded-xl h-12"
                                                    value={item.stoneType}
                                                    onChange={(e) => handleProductionChange(index, 'stoneType', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select Stone</option>
                                                    {stoneTypes.map((s: any) => (
                                                        <option key={s._id} value={s._id}>{s.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white-dark mb-2 block">Quantity Produced</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        className="form-input font-bold rounded-xl h-12 flex-1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleProductionChange(index, 'quantity', e.target.value)}
                                                        required
                                                        placeholder="0.00"
                                                    />
                                                    <select
                                                        className="form-select font-bold rounded-xl h-12 w-28"
                                                        value={item.unit}
                                                        onChange={(e) => handleProductionChange(index, 'unit', e.target.value)}
                                                    >
                                                        <option value="Tons">Tons</option>
                                                        <option value="Units">Units</option>
                                                        <option value="Loads">Loads</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white-dark mb-2 block">No. of Loads</label>
                                                <input
                                                    type="number"
                                                    className="form-input font-bold rounded-xl h-12"
                                                    value={item.noOfLoads}
                                                    onChange={(e) => handleProductionChange(index, 'noOfLoads', e.target.value)}
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white-dark mb-2 block">Crusher Output</label>
                                                <input
                                                    type="text"
                                                    className="form-input font-bold rounded-xl h-12"
                                                    value={item.crusherOutput}
                                                    onChange={(e) => handleProductionChange(index, 'crusherOutput', e.target.value)}
                                                    placeholder="..."
                                                />
                                            </div>
                                        </div>

                                        {/* Stock Inputs */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-gray-200/50">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white-dark mb-2 block">Opening Stock</label>
                                                <input
                                                    type="number"
                                                    className="form-input font-bold rounded-xl h-12"
                                                    value={item.openingStock}
                                                    onChange={(e) => handleProductionChange(index, 'openingStock', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white-dark mb-2 block">Today's Total</label>
                                                <div className="form-input font-black rounded-xl h-12 bg-info/5 flex items-center px-4 text-info">
                                                    {(parseFloat(item.openingStock) + parseFloat(item.quantity) || 0).toLocaleString()}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white-dark mb-2 block">Dispatched Qty</label>
                                                <input
                                                    type="number"
                                                    className="form-input font-bold rounded-xl h-12"
                                                    value={item.dispatchedQuantity}
                                                    onChange={(e) => handleProductionChange(index, 'dispatchedQuantity', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white-dark mb-2 block">Closing Stock</label>
                                                <div className="form-input font-black rounded-xl h-12 bg-primary/10 flex items-center px-4 text-primary text-xl">
                                                    {item.closingStock}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 4: Labour & Operator */}
                        <div className="panel border-none shadow-xl rounded-2xl p-8">
                            <h5 className="text-lg font-black uppercase tracking-widest text-secondary mb-6 border-l-4 border-secondary pl-4">4. Labour & Operator Details</h5>

                            {/* Helpers / Labours */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-info">Helpers / Labours</label>
                                    <button type="button" className="btn btn-outline-info btn-xs rounded-lg py-1 font-bold text-[9px]" onClick={addLabourRow}>
                                        <IconPlus className="w-3 h-3 mr-1" /> Add Labour
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.labourDetails.map((item, index) => (
                                        <div key={index} className="flex gap-3 items-center bg-gray-50 dark:bg-gray-900/30 p-3 rounded-xl">
                                            <select
                                                className="form-select font-bold rounded-xl h-12 flex-1"
                                                value={item.labourId}
                                                onChange={(e) => handleLabourSelect(index, e.target.value)}
                                                required
                                            >
                                                <option value="">Select Labour</option>
                                                {labours
                                                    .filter((l: any) => {
                                                        const wt = l.workType?.toLowerCase() || '';
                                                        // Exclude operators, supervisors from helper list
                                                        if (wt.includes('operator') || wt === 'supervisor' || wt === 'superviser') return false;
                                                        // Prevent duplicate: exclude already selected labours (except current row)
                                                        const alreadySelected = formData.labourDetails
                                                            .filter((_, i) => i !== index)
                                                            .map(ld => ld.labourId);
                                                        return !alreadySelected.includes(l._id);
                                                    })
                                                    .map((l: any) => (
                                                        <option key={l._id} value={l._id}>{l.name}</option>
                                                    ))
                                                }
                                            </select>
                                            <div className="text-center min-w-[100px]">
                                                <div className="text-[9px] font-bold text-white-dark uppercase tracking-wider">Wage</div>
                                                <div className="font-black text-info text-lg">₹{parseFloat(item.wage || '0').toLocaleString()}</div>
                                                <span className={`badge text-[8px] py-0 px-1.5 ${item.wageType === 'Monthly' ? 'badge-outline-warning' : 'badge-outline-success'}`}>{item.wageType}</span>
                                            </div>
                                            {item.wageType === 'Monthly' && parseFloat(item.wage) > 0 && (
                                                <div className="text-center min-w-[80px]">
                                                    <div className="text-[9px] font-bold text-white-dark uppercase">Per Day</div>
                                                    <div className="font-black text-success text-sm">₹{Math.round(parseFloat(item.wage) / 30).toLocaleString()}</div>
                                                </div>
                                            )}
                                            {formData.labourDetails.length > 1 && (
                                                <button type="button" className="btn btn-outline-danger btn-sm p-2 rounded-xl" onClick={() => removeLabourRow(index)}>
                                                    <IconTrashLines className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Operators (Auto-matched with Machines) */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-secondary">Operators <span className="text-[9px] text-white-dark font-normal normal-case">({formData.operatorDetails.length} for {formData.machines.length} machine{formData.machines.length > 1 ? 's' : ''})</span></label>
                                    <button type="button" className="btn btn-outline-secondary btn-xs rounded-lg py-1 font-bold text-[9px]" onClick={addOperatorRow}>
                                        <IconPlus className="w-3 h-3 mr-1" /> Add Operator
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.operatorDetails.map((item, index) => (
                                        <div key={index} className="flex gap-3 items-center bg-gray-50 dark:bg-gray-900/30 p-3 rounded-xl">
                                            <div className="min-w-[28px] h-7 flex items-center justify-center bg-secondary/10 text-secondary rounded-lg text-[10px] font-black">M{index + 1}</div>
                                            <select
                                                className="form-select font-bold rounded-xl h-12 flex-1"
                                                value={item.labourId}
                                                onChange={(e) => handleOperatorSelect(index, e.target.value)}
                                                required
                                            >
                                                <option value="">Select Operator</option>
                                                {labours
                                                    .filter((l: any) => {
                                                        const wt = l.workType?.toLowerCase() || '';
                                                        // Include only operator types (Operator, Machine Operator, etc.)
                                                        if (!wt.includes('operator')) return false;
                                                        // Prevent duplicate: exclude already selected operators (except current row)
                                                        const alreadySelected = formData.operatorDetails
                                                            .filter((_, i) => i !== index)
                                                            .map(od => od.labourId);
                                                        return !alreadySelected.includes(l._id);
                                                    })
                                                    .map((l: any) => (
                                                        <option key={l._id} value={l._id}>{l.name}</option>
                                                    ))
                                                }
                                            </select>
                                            <div className="text-center min-w-[100px]">
                                                <div className="text-[9px] font-bold text-white-dark uppercase tracking-wider">Wage</div>
                                                <div className="font-black text-secondary text-lg">₹{parseFloat(item.wage || '0').toLocaleString()}</div>
                                                <span className={`badge text-[8px] py-0 px-1.5 ${item.wageType === 'Monthly' ? 'badge-outline-warning' : 'badge-outline-success'}`}>{item.wageType}</span>
                                            </div>
                                            {item.wageType === 'Monthly' && parseFloat(item.wage) > 0 && (
                                                <div className="text-center min-w-[80px]">
                                                    <div className="text-[9px] font-bold text-white-dark uppercase">Per Day</div>
                                                    <div className="font-black text-success text-sm">₹{Math.round(parseFloat(item.wage) / 30).toLocaleString()}</div>
                                                </div>
                                            )}
                                            {formData.operatorDetails.length > 1 && (
                                                <button type="button" className="btn btn-outline-danger btn-sm p-2 rounded-xl" onClick={() => removeOperatorRow(index)}>
                                                    <IconTrashLines className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Shift Wage - Auto Calculated */}
                            <div className="mt-6 p-5 bg-gradient-to-r from-primary/10 via-info/5 to-success/10 rounded-2xl border-2 border-primary/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-white-dark">Total Shift Wage (Auto-Calculated)</div>
                                        <div className="text-[9px] text-white-dark mt-1">
                                            {formData.labourDetails.filter(l => l.name).length} Helpers + {formData.operatorDetails.filter(o => o.name).length} Operators
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-primary text-3xl">₹{parseFloat(formData.shiftWage || '0').toLocaleString()}</div>
                                        <div className="text-[9px] text-white-dark font-bold">Today's Cost</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Remarks */}
                        <div className="panel border-none shadow-xl rounded-2xl p-8">
                            <h5 className="text-lg font-black uppercase tracking-widest text-white-dark mb-6 border-l-4 border-gray-400 pl-4">5. Remarks Section</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <label className="flex items-center gap-2 cursor-pointer p-4 rounded-xl border-2 border-gray-100 hover:border-danger transition-all">
                                    <input type="checkbox" name="remarks.breakdown" className="form-checkbox text-danger rounded" checked={formData.remarks.breakdown} onChange={handleChange} />
                                    <span className="text-xs font-black uppercase tracking-widest">Breakdown</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer p-4 rounded-xl border-2 border-gray-100 hover:border-info transition-all">
                                    <input type="checkbox" name="remarks.rainDelay" className="form-checkbox text-info rounded" checked={formData.remarks.rainDelay} onChange={handleChange} />
                                    <span className="text-xs font-black uppercase tracking-widest">Rain Delay</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer p-4 rounded-xl border-2 border-gray-100 hover:border-warning transition-all">
                                    <input type="checkbox" name="remarks.powerCut" className="form-checkbox text-warning rounded" checked={formData.remarks.powerCut} onChange={handleChange} />
                                    <span className="text-xs font-black uppercase tracking-widest">Power Cut</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer p-4 rounded-xl border-2 border-gray-100 hover:border-success transition-all">
                                    <input type="checkbox" name="remarks.blastingDone" className="form-checkbox text-success rounded" checked={formData.remarks.blastingDone} onChange={handleChange} />
                                    <span className="text-xs font-black uppercase tracking-widest">Blasting</span>
                                </label>
                            </div>
                            <textarea name="remarks.otherRemarks" className="form-textarea font-bold rounded-xl min-h-[100px]" value={formData.remarks.otherRemarks} onChange={handleChange} placeholder="Any other specific notes..."></textarea>
                        </div>

                        <div className="flex justify-end gap-4 pb-12">
                            <button type="button" className="btn btn-outline-danger px-10 rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={() => setShowForm(false)}>Discard</button>
                            <button type="submit" className="btn btn-primary px-16 h-14 rounded-xl font-black uppercase tracking-[0.2em] text-sm shadow-[0_10px_20px_rgba(67,97,238,0.3)]">
                                <IconSave className="mr-2 w-5 h-5" /> {editId ? 'Update Database' : 'Finalize Entry'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="panel">
                    <div className="table-responsive min-h-[400px]">
                        <table className="table-hover">
                            <thead>
                                <tr className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                                    <th>Date</th>
                                    <th>Shift Details</th>
                                    <th>Machines Used</th>
                                    <th>Material Details</th>
                                    <th>Stock Status</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-20 font-semibold opacity-50">Synchronizing Logs...</td></tr>
                                ) : productions.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-20 font-semibold opacity-50">No production history found</td></tr>
                                ) : (
                                    productions.map((item: any) => (
                                        <tr key={item._id} className="group transition-all">
                                            <td className="font-semibold">{new Date(item.date).toLocaleDateString('en-IN')}</td>
                                            <td>
                                                <div className="flex flex-col gap-1">
                                                    <span className={`badge ${item.shift === 'Full Day' ? 'badge-outline-primary' : 'badge-outline-info'} w-fit text-[10px] px-2 py-0.5`}>
                                                        {item.shift}
                                                    </span>
                                                    {item.siteName && <span className="text-[10px] text-white-dark font-bold uppercase tracking-tight">{item.siteName}</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex flex-col gap-2">
                                                    {item.machines?.map((m: any, idx: number) => (
                                                        <div key={idx} className={`flex flex-col gap-0.5 ${idx !== 0 ? 'border-t border-gray-100 pt-1 mt-1' : ''}`}>
                                                            <span className="font-bold text-black dark:text-white-light text-xs">{m.machineId?.name || 'Manual'}</span>
                                                            <div className="flex gap-2">
                                                                <span className="bg-warning/10 text-warning px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">{m.workingHours} HRS</span>
                                                                <span className="bg-danger/10 text-danger px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">{m.dieselUsed}L FUEL</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <span className="text-[10px] text-white-dark uppercase tracking-wide border-t pt-1 border-gray-100 italic">
                                                        Op: {item.operatorDetails?.map((o: any) => o.name).filter(Boolean).join(', ') || 'N/A'}
                                                    </span>
                                                    {item.labourDetails && item.labourDetails.length > 0 && item.labourDetails.some((l: any) => l.name) && (
                                                        <span className="text-[10px] text-white-dark uppercase tracking-wide border-t pt-1 border-gray-100 italic block mt-1">
                                                            Helpers: {item.labourDetails.map((l: any) => l.name).filter(Boolean).join(', ')}
                                                        </span>
                                                    )}
                                                    {item.shiftWage > 0 && (
                                                        <span className="text-[10px] text-success font-black border-t pt-1 border-gray-100 block mt-1">
                                                            Wage: ₹{item.shiftWage.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex flex-col gap-2">
                                                    {item.productionDetails?.map((pd: any, idx: number) => (
                                                        <div key={idx} className={`flex flex-col gap-1 ${idx !== 0 ? 'border-t border-gray-100 pt-2 mt-1' : ''}`}>
                                                            <div className="flex items-center gap-2">
                                                                <span className="badge badge-outline-success font-black text-[10px] whitespace-nowrap">{pd.quantity} {pd.unit}</span>
                                                                <span className="text-black dark:text-white-light text-[11px] font-bold truncate">{pd.stoneType?.name || 'N/A'}</span>
                                                            </div>
                                                            {pd.noOfLoads > 0 && <span className="text-[9px] text-primary font-black uppercase tracking-tighter">{pd.noOfLoads} Loads</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex flex-col gap-3">
                                                    {item.productionDetails?.map((pd: any, idx: number) => (
                                                        <div key={idx} className={`flex flex-col gap-1 ${idx !== 0 ? 'border-t border-gray-100 pt-2' : ''}`}>
                                                            <div className="flex justify-between items-center w-36 text-[9px] font-bold text-white-dark">
                                                                <span>STOCK: {(parseFloat(pd.openingStock || 0) + parseFloat(pd.quantity || 0))}</span>
                                                                <span className="text-danger">-{pd.dispatchedQuantity || 0}</span>
                                                            </div>
                                                            <div className="bg-success/10 text-success p-1 rounded w-36 flex justify-between items-center px-2">
                                                                <span className="text-[8px] font-black uppercase">Balance</span>
                                                                <span className="font-black text-[10px]">{pd.closingStock}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="text-center px-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button type="button" className="btn btn-sm btn-outline-primary p-1.5 rounded-lg transition-all transform hover:scale-110" onClick={() => handleEdit(item)}>
                                                        <IconEdit className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-outline-danger p-1.5 rounded-lg transition-all transform hover:scale-110" onClick={() => handleDelete(item._id)}>
                                                        <IconTrashLines className="h-4 w-4" />
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
        </div>
    );
};

export default ProductionEntry;
