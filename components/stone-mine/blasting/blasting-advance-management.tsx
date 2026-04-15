'use client';
import React, { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useToast } from '@/components/stone-mine/toast-notification';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import IconX from '@/components/icon/icon-x';

const BlastingAdvanceManagement = ({ blastingId, blastingLabel, recordDates }: { blastingId?: string; blastingLabel?: string; recordDates?: { fromDate: string; toDate: string } }) => {
    const { showToast } = useToast();
    const [advances, setAdvances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ amount: '', date: new Date().toISOString().split('T')[0], notes: '', blastingId: blastingId || '' });

    const fetchAdvances = async () => {
        try {
            setLoading(true);
            let params = blastingId ? `?blastingId=${blastingId}` : '';
            if (blastingId && recordDates) params += `&fromDate=${recordDates.fromDate}&toDate=${recordDates.toDate}`;
            const res = await api.get(`/blasting/advances${params}`);
            if (res.data.success) setAdvances(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchAdvances(); }, [blastingId]);

    const reset = () => { setFormData({ amount: '', date: new Date().toISOString().split('T')[0], notes: '', blastingId: blastingId || '' }); setEditId(null); setShowForm(false); };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/blasting/advances/${editId}`, formData);
                showToast('Advance updated!', 'success');
            } else {
                await api.post('/blasting/advances', { ...formData, blastingId: blastingId || formData.blastingId });
                showToast('Advance added!', 'success');
            }
            reset(); fetchAdvances();
        } catch (err: any) { showToast(err.response?.data?.message || 'Error', 'error'); }
    };

    const confirmDelete = async () => {
        try { await api.delete(`/blasting/advances/${deleteId}`); showToast('Deleted', 'success'); fetchAdvances(); }
        catch (e) { showToast('Error deleting', 'error'); } finally { setDeleteId(null); }
    };

    const total = advances.reduce((s, a) => s + a.amount, 0);

    return (
        <div className="space-y-4">
            {showForm && (
                <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h6 className="font-bold text-warning text-sm">{editId ? 'Edit Advance' : 'New Advance Entry'}</h6>
                        <button onClick={reset}><IconX className="w-4 h-4 text-white-dark" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs font-bold uppercase mb-1 block">Amount (₹) *</label>
                            <input type="number" className="form-input" required min="0" step="0.01" value={formData.amount} onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase mb-1 block">Date *</label>
                            <input type="date" className="form-input" required value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase mb-1 block">Notes</label>
                            <input type="text" className="form-input" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="Optional" />
                        </div>
                        <div className="md:col-span-3 flex justify-end gap-2">
                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={reset}>Cancel</button>
                            <button type="submit" className="btn btn-warning btn-sm">{editId ? 'Update' : 'Save Advance'}</button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <>
                    <div className="flex items-center justify-between">
                        <div>
                            <h6 className="font-bold text-sm uppercase text-warning">💰 Advance Payments</h6>
                            {blastingLabel && <p className="text-xs text-white-dark mt-0.5">For: {blastingLabel}</p>}
                        </div>
                        <button className="btn btn-warning btn-sm" onClick={() => setShowForm(true)}>
                            <IconPlus className="ltr:mr-1" /> Add Advance
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th className="text-right">Amount (₹)</th>
                                    <th>Notes</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
                                ) : advances.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-4 text-white-dark">No advances recorded.</td></tr>
                                ) : advances.map(a => (
                                    <tr key={a._id}>
                                        <td>{new Date(a.date).toLocaleDateString()}</td>
                                        <td className="text-right font-bold text-warning text-lg">₹{a.amount.toLocaleString()}</td>
                                        <td className="text-white-dark text-sm">{a.notes || '—'}</td>
                                        <td className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="text-danger" onClick={() => setDeleteId(a._id)}><IconTrash className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {advances.length > 0 && (
                                    <tr className="bg-warning/10 font-bold">
                                        <td>TOTAL ADVANCE</td>
                                        <td className="text-right text-warning text-xl">₹{total.toLocaleString()}</td>
                                        <td colSpan={2}></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}



            <DeleteConfirmModal show={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} title="Delete Advance" message="Are you sure you want to delete this advance entry?" />
        </div>
    );
};

export default BlastingAdvanceManagement;
