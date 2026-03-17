'use client';
import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useToast } from '@/components/stone-mine/toast-notification';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconSave from '@/components/icon/icon-save';
import IconX from '@/components/icon/icon-x';
import IconSearch from '@/components/icon/icon-search';
import IconPrinter from '@/components/icon/icon-printer';
import IconFile from '@/components/icon/icon-file';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';
import RoleGuard from '@/components/stone-mine/role-guard';

const MachineProductionPage = () => {
    const [productions, setProductions] = useState<any[]>([]);
    const [machines, setMachines] = useState<any[]>([]);
    const [operators, setOperators] = useState<any[]>([]);
    const [allWorkers, setAllWorkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const { showToast } = useToast();

    // Filter states
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        machineId: '',
        search: ''
    });

    const [formData, setFormData] = useState({
        machine: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '18:00',
        breakTime: 0,
        operator: '',
        dieselLiters: 0,
        workType: '',
        startHmr: 0,
        endHmr: 0,
        remarks: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.machineId) params.append('machineId', filters.machineId);

            const [prodRes, machRes, operRes] = await Promise.all([
                api.get(`/machine-production?${params.toString()}`),
                api.get('/master/vehicles'),
                api.get('/labour')
            ]);

            setProductions(prodRes.data.data);
            setMachines(machRes.data.data.filter((v: any) => v.type === 'Machine'));

            const rawWorkers = operRes.data.data || [];
            setAllWorkers(rawWorkers);
            // Dropdown still primarily shows operators for ease of use
            setOperators(rawWorkers.filter((l: any) => l.workType?.toLowerCase().includes('operator')));
        } catch (error) {
            console.error(error);
            showToast('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters.startDate, filters.endDate, filters.machineId]);

    // When machine is selected, pre-fill current HMR and suggest operator if assigned
    const handleMachineChange = (machineId: string) => {
        const selectedMachine = machines.find(m => m._id === machineId);
        if (selectedMachine) {
            // Try to auto-match operator name from machine master to ANY labour record
            let matchedOperatorId = '';
            if (selectedMachine.operatorName) {
                const matched = allWorkers.find(o =>
                    o.name.toLowerCase().trim() === selectedMachine.operatorName.toLowerCase().trim()
                );
                if (matched) {
                    matchedOperatorId = matched._id;
                }
            }

            setFormData({
                ...formData,
                machine: machineId,
                startHmr: selectedMachine.currentHmr || 0,
                operator: matchedOperatorId || '' // Auto-set if match found, else clear for fresh selection
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/machine-production/${editId}`, formData);
                showToast('Log updated successfully', 'success');
            } else {
                await api.post('/machine-production', formData);
                showToast('Log added successfully', 'success');
            }
            setShowModal(false);
            setEditId(null);
            resetForm();
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error saving logs', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            machine: '',
            date: new Date().toISOString().split('T')[0],
            startTime: '08:00',
            endTime: '18:00',
            breakTime: 0,
            operator: '',
            dieselLiters: 0,
            workType: '',
            startHmr: 0,
            endHmr: 0,
            remarks: ''
        });
    };

    const handleEdit = (prod: any) => {
        setEditId(prod._id);
        setFormData({
            machine: prod.machine?._id || '',
            date: new Date(prod.date).toISOString().split('T')[0],
            startTime: prod.startTime,
            endTime: prod.endTime,
            breakTime: prod.breakTime || 0,
            operator: prod.operator?._id || '',
            dieselLiters: prod.dieselLiters || 0,
            workType: prod.workType || '',
            startHmr: prod.startHmr || 0,
            endHmr: prod.endHmr || 0,
            remarks: prod.remarks || ''
        });
        setShowModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/machine-production/${deleteId}`);
            showToast('Deleted successfully', 'success');
            setDeleteId(null);
            fetchData();
        } catch (error) {
            showToast('Error deleting log', 'error');
        }
    };

    const exportToExcel = async () => {
        try {
            const XLSX = await import('xlsx');
            const sheetData = productions.map(p => ({
                'Date': new Date(p.date).toLocaleDateString(),
                'Machine': p.machine?.name || 'N/A',
                'Operator': p.operator?.name || 'N/A',
                'Work Type': p.workType || 'N/A',
                'Start Time': p.startTime,
                'End Time': p.endTime,
                'Break (Mins)': p.breakTime || 0,
                'Start HMR': p.startHmr,
                'End HMR': p.endHmr,
                'Total Hours': p.totalHours || 0,
                'Diesel (Lts)': p.dieselLiters || 0,
                'Remarks': p.remarks || ''
            }));

            const ws = XLSX.utils.json_to_sheet(sheetData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Production_Logs');
            XLSX.writeFile(wb, `Machine_Production_${new Date().toISOString().split('T')[0]}.xlsx`);
            showToast('Excel exported successfully', 'success');
        } catch (error) {
            showToast('Failed to export Excel', 'error');
        }
    };

    const exportToPDF = async () => {
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');

            const doc = new jsPDF('l', 'mm', 'a4');
            doc.text('Machine Production Report', 14, 15);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

            const tableData = productions.map(p => [
                new Date(p.date).toLocaleDateString(),
                p.machine?.name || 'N/A',
                p.operator?.name || 'N/A',
                `${p.startTime} - ${p.endTime}`,
                `${p.startHmr} - ${p.endHmr}`,
                p.totalHours || 0,
                p.dieselLiters || 0
            ]);

            autoTable(doc, {
                head: [['Date', 'Machine', 'Operator', 'Timings', 'HMR Range', 'Hours', 'Fuel(L)']],
                body: tableData,
                startY: 30,
                theme: 'grid',
                headStyles: { fillColor: [67, 97, 238] }
            });

            doc.save(`Machine_Production_${new Date().toISOString().split('T')[0]}.pdf`);
            showToast('PDF exported successfully', 'success');
        } catch (error) {
            showToast('Failed to export PDF', 'error');
        }
    };

    // Filtered productions for search bar
    const displayedProductions = productions.filter(p => {
        const search = filters.search.toLowerCase();
        return (
            p.machine?.name?.toLowerCase().includes(search) ||
            p.operator?.name?.toLowerCase().includes(search) ||
            p.workType?.toLowerCase().includes(search)
        );
    });

    return (
        <RoleGuard allowedRoles={['Owner', 'Accountant', 'Supervisor', 'Manager']}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-white-dark">Machine Production</h1>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Daily Work & Fuel Logs</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            className="btn btn-outline-success flex items-center gap-2 px-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest"
                            onClick={exportToExcel}
                        >
                            <IconFile className="w-4 h-4" /> Excel
                        </button>
                        <button
                            className="btn btn-outline-danger flex items-center gap-2 px-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest"
                            onClick={exportToPDF}
                        >
                            <IconPrinter className="w-4 h-4" /> PDF
                        </button>
                        <button
                            className="btn btn-primary shadow-lg shadow-primary/30 flex items-center gap-2 px-6 rounded-2xl"
                            onClick={() => { resetForm(); setShowModal(true); }}
                        >
                            <IconPlus className="w-5 h-5" />
                            Add Log
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="panel flex flex-wrap items-center gap-4 mb-6 rounded-3xl border-none shadow-md py-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white-dark w-4 h-4" />
                        <input
                            type="text"
                            className="form-input pl-10 rounded-xl"
                            placeholder="Search by machine, operator or work type..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black uppercase text-white-dark whitespace-nowrap">Machine:</label>
                        <select
                            className="form-select rounded-xl w-40"
                            value={filters.machineId}
                            onChange={(e) => setFilters({ ...filters, machineId: e.target.value })}
                        >
                            <option value="">All Machines</option>
                            {machines.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black uppercase text-white-dark whitespace-nowrap">Date From:</label>
                        <input
                            type="date"
                            className="form-input rounded-xl w-40"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black uppercase text-white-dark whitespace-nowrap">To:</label>
                        <input
                            type="date"
                            className="form-input rounded-xl w-40"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>
                    <button
                        className="btn btn-outline-primary rounded-xl px-4 py-2 text-[10px] font-bold"
                        onClick={() => setFilters({ startDate: '', endDate: '', machineId: '', search: '' })}
                    >
                        Reset
                    </button>
                </div>

                <div className="panel border-t-4 border-primary shadow-xl rounded-3xl overflow-hidden">
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr className="bg-primary/5">
                                    <th className="font-black uppercase tracking-widest text-[11px] py-4">Date</th>
                                    <th className="font-black uppercase tracking-widest text-[11px]">Machine</th>
                                    <th className="font-black uppercase tracking-widest text-[11px]">Operator</th>
                                    <th className="font-black uppercase tracking-widest text-[11px]">Work Timings</th>
                                    <th className="font-black uppercase tracking-widest text-[11px]">Production (HMR)</th>
                                    <th className="font-black uppercase tracking-widest text-[11px]">Fuel (Lts)</th>
                                    <th className="font-black uppercase tracking-widest text-[11px] text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={7} className="text-center py-10 font-bold uppercase tracking-widest text-white-dark opacity-50">Loading Production Data...</td></tr>
                                ) : displayedProductions.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-10 font-bold uppercase tracking-widest text-white-dark opacity-50">No production logs found</td></tr>
                                ) : displayedProductions.map((prod) => (
                                    <tr key={prod._id} className="group hover:bg-primary/5 transition-all">
                                        <td className="py-4 font-black">{new Date(prod.date).toLocaleDateString()}</td>
                                        <td className="font-semibold text-primary">{prod.machine?.name}</td>
                                        <td className="italic">{prod.operator?.name || 'N/A'}</td>
                                        <td>
                                            <div className="text-[11px] font-black uppercase tracking-tighter">
                                                {prod.startTime} - {prod.endTime}
                                            </div>
                                            {prod.breakTime > 0 && (
                                                <div className="text-[9px] text-danger font-bold uppercase tracking-widest mt-0.5">
                                                    Break: {prod.breakTime} mins
                                                </div>
                                            )}
                                            <div className="text-[10px] text-white-dark font-bold">{prod.workType}</div>
                                        </td>
                                        <td>
                                            <div className="font-black text-info">{prod.totalHours ? `${prod.totalHours} hrs` : 'N/A'}</div>
                                            <div className="text-[9px] text-white-dark uppercase font-bold tracking-widest">
                                                HMR: {prod.startHmr} ➔ {prod.endHmr}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="badge bg-warning/10 text-warning font-black rounded-lg py-1.5 px-3">
                                                {prod.dieselLiters} L
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleEdit(prod)} className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"><IconEdit className="w-4 h-4" /></button>
                                                <button onClick={() => setDeleteId(prod._id)} className="p-2 text-danger hover:bg-danger/10 rounded-xl transition-all"><IconTrashLines className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-[#0e1726] rounded-3xl w-full max-w-2xl shadow-2xl animate__animated animate__zoomIn animate__faster border border-white/10 overflow-hidden">
                            <div className="flex items-center justify-between px-8 py-6 bg-primary/5 border-b border-white/10">
                                <h5 className="text-xl font-black uppercase tracking-tight text-white-dark">{editId ? 'Edit Log' : 'Add Production Log'}</h5>
                                <button onClick={() => setShowModal(false)} className="text-white-dark hover:text-danger px-2"><IconX className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                                {/* Row 1: Date (Full Width) */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-white-dark ml-1">Date *</label>
                                    <input type="date" className="form-input rounded-xl border-white-dark/20 font-bold text-primary" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                                </div>

                                {/* Row 2: Machine & Operator */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-white-dark ml-1">Machine *</label>
                                        <select
                                            className="form-select rounded-xl border-white-dark/20 font-bold"
                                            required
                                            value={formData.machine}
                                            onChange={(e) => handleMachineChange(e.target.value)}
                                        >
                                            <option value="">Select Machine</option>
                                            {machines.map(m => <option key={m._id} value={m._id}>{m.name} ({m.registrationNumber || 'No No.'})</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-white-dark ml-1">Operator *</label>
                                        <select className="form-select rounded-xl border-white-dark/20 font-bold" required value={formData.operator} onChange={(e) => setFormData({ ...formData, operator: e.target.value })}>
                                            <option value="">Select Operator</option>
                                            {allWorkers.filter(w => w.status === 'active' && w.workType?.toLowerCase().includes('operator')).map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Row 3: Start Time & End Time */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-white-dark ml-1">Start Time *</label>
                                        <input type="time" className="form-input rounded-xl border-white-dark/20" required value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-white-dark ml-1">End Time *</label>
                                        <input type="time" className="form-input rounded-xl border-white-dark/20" required value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                                    </div>
                                </div>

                                {/* Row 4: Break Time & Work Type */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-white-dark ml-1">Break Time (Minutes)</label>
                                        <input type="number" className="form-input rounded-xl border-white-dark/20 font-bold" value={formData.breakTime} onChange={(e) => setFormData({ ...formData, breakTime: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-white-dark ml-1">Work Type *</label>
                                        <input type="text" className="form-input rounded-xl border-white-dark/20 font-bold" placeholder="e.g. Drilling, Loading" required value={formData.workType} onChange={(e) => setFormData({ ...formData, workType: e.target.value })} />
                                    </div>
                                </div>

                                {/* Row 5: Start HMR & End HMR */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-white-dark ml-1">Start HMR *</label>
                                        <input type="number" step="0.01" className="form-input rounded-xl border-white-dark/20 font-black text-info" required value={formData.startHmr} onChange={(e) => setFormData({ ...formData, startHmr: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-white-dark ml-1">End HMR *</label>
                                        <input type="number" step="0.01" className="form-input rounded-xl border-white-dark/20 font-black text-info" required value={formData.endHmr} onChange={(e) => setFormData({ ...formData, endHmr: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                </div>

                                {/* Row 6: Diesel Used */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-white-dark ml-1">Diesel Used (Liters)</label>
                                    <input type="number" step="0.1" className="form-input rounded-xl border-white-dark/20 font-black text-warning" value={formData.dieselLiters} onChange={(e) => setFormData({ ...formData, dieselLiters: parseFloat(e.target.value) || 0 })} />
                                </div>

                                {/* Remarks & Footer */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-white-dark ml-1">Remarks</label>
                                    <textarea className="form-textarea rounded-xl border-white-dark/20" rows={2} value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" className="btn btn-outline-danger px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/30 flex items-center gap-2">
                                        <IconSave className="w-4 h-4" />
                                        {editId ? 'Update Log' : 'Save Log'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <DeleteConfirmModal
                    show={!!deleteId}
                    onCancel={() => setDeleteId(null)}
                    onConfirm={confirmDelete}
                    title="Delete Production Log"
                    message="Are you sure you want to delete this production log entry? This cannot be undone."
                />
            </div>
        </RoleGuard>
    );
};

export default MachineProductionPage;
