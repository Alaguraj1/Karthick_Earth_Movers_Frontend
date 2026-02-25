'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/components/stone-mine/toast-notification';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconSearch from '@/components/icon/icon-search';
import IconX from '@/components/icon/icon-x';
import IconSave from '@/components/icon/icon-save';

const API = process.env.NEXT_PUBLIC_API_URL;

const TripManagement = () => {
    const { showToast } = useToast();
    const [trips, setTrips] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const initialForm = {
        date: new Date().toISOString().split('T')[0],
        vehicleId: '',
        vehicleType: 'Lorry',
        driverId: '',
        fromLocation: 'Quarry',
        toLocation: '',
        stoneTypeId: '',
        customerId: '',
        loadQuantity: '',
        loadUnit: 'Tons',
        tripRate: '',
        notes: ''
    };

    const [formData, setFormData] = useState(initialForm);

    const [labours, setLabours] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [stoneTypes, setStoneTypes] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tripRes, vehicleRes, labourRes, customerRes, stoneRes] = await Promise.all([
                axios.get(`${API}/trips`),
                axios.get(`${API}/master/vehicles`),
                axios.get(`${API}/master/labours`),
                axios.get(`${API}/master/customers`),
                axios.get(`${API}/master/stone-types`),
            ]);

            if (tripRes.data.success) setTrips(tripRes.data.data);
            if (vehicleRes.data.success) {
                setVehicles(vehicleRes.data.data);
                filterVehiclesBy(vehicleRes.data.data, 'Lorry');
            }
            if (labourRes.data.success) setLabours(labourRes.data.data);
            if (customerRes.data.success) setCustomers(customerRes.data.data);
            if (stoneRes.data.success) setStoneTypes(stoneRes.data.data);
        } catch (error) {
            console.error(error);
            showToast('Error fetching data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterVehiclesBy = (allVehicles: any[], type: string) => {
        const filtered = allVehicles.filter((v: any) =>
            v.category?.toLowerCase() === type.toLowerCase() ||
            (type === 'Lorry' && !v.category) // Fallback for old data
        );
        setFilteredVehicles(filtered);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'vehicleType') {
            filterVehiclesBy(vehicles, value);
            setFormData(prev => ({ ...prev, vehicleNumber: '' })); // Reset vehicle number when type changes
        }

        if (name === 'vehicleId') {
            const selectedVehicle = vehicles.find(v => v._id === value);
            if (selectedVehicle?.driverName) {
                // If the vehicle has a driver name in master, try to find the matching labour ID
                const worker = labours.find(l => l.name === selectedVehicle.driverName);
                if (worker) {
                    setFormData(prev => ({ ...prev, driverId: worker._id }));
                }
            }
        }
    };

    const handleConvertToSale = async (tripId: string) => {
        try {
            const { data } = await axios.post(`${API}/trips/${tripId}/convert-to-sale`);
            if (data.success) {
                showToast('Trip converted to Sale successfully!', 'success');
                fetchData();
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error converting trip', 'error');
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`${API}/trips/${editId}`, formData);
                showToast('Record updated successfully!', 'success');
            } else {
                await axios.post(`${API}/trips`, formData);
                showToast('Record recorded successfully!', 'success');
            }
            resetForm();
            fetchData();
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Error saving record', 'error');
        }
    };

    const handleEdit = (trip: any) => {
        const vType = trip.vehicleType || 'Lorry';
        filterVehiclesBy(vehicles, vType);

        setFormData({
            date: trip.date.split('T')[0],
            vehicleId: trip.vehicleId?._id || trip.vehicleId,
            vehicleType: vType,
            driverId: trip.driverId?._id || trip.driverId,
            fromLocation: trip.fromLocation,
            toLocation: trip.toLocation,
            stoneTypeId: trip.stoneTypeId?._id || trip.stoneTypeId,
            customerId: trip.customerId?._id || trip.customerId,
            loadQuantity: trip.loadQuantity,
            loadUnit: trip.loadUnit,
            tripRate: trip.tripRate,
            notes: trip.notes || ''
        });
        setEditId(trip._id);
        setShowForm(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`${API}/trips/${deleteId}`);
            showToast('Record deleted successfully!', 'success');
            fetchData();
        } catch (error) {
            console.error(error);
            showToast('Error deleting record', 'error');
        } finally {
            setDeleteId(null);
        }
    };

    const resetForm = () => {
        setFormData(initialForm);
        setEditId(null);
        setShowForm(false);
        filterVehiclesBy(vehicles, 'Lorry');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white-light">வாகன பயண மேலாண்மை (Vehicle Trip Management)</h2>
                    <p className="text-white-dark text-sm mt-1">Record and manage vehicle trips, loads and income</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> Add New Trip
                </button>
            </div>

            {showForm && (
                <div className="panel animate__animated animate__fadeIn">
                    <div className="flex items-center justify-between mb-5 border-b pb-3 border-[#ebedf2] dark:border-[#1b2e4b]">
                        <h5 className="font-bold text-lg">{editId ? 'Edit Record' : 'New Trip Registration'}</h5>
                        <button onClick={resetForm} className="text-white-dark hover:text-danger">
                            <IconX />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Trip Date</label>
                                <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Vehicle Type</label>
                                <select name="vehicleType" className="form-select" value={formData.vehicleType} onChange={handleChange} required>
                                    <option value="Lorry">Lorry</option>
                                    <option value="Tipper">Tipper</option>
                                    <option value="Tractor">Tractor</option>
                                    <option value="JCB">JCB</option>
                                    <option value="Poclain">Poclain</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Vehicle Number</label>
                                <select name="vehicleId" className="form-select border-primary" value={formData.vehicleId} onChange={handleChange} required>
                                    <option value="">Select Vehicle</option>
                                    {filteredVehicles.map((v: any) => (
                                        <option key={v._id} value={v._id}>
                                            {v.vehicleNumber || v.registrationNumber} ({v.name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Driver (Master)</label>
                                <select name="driverId" className="form-select" value={formData.driverId} onChange={handleChange}>
                                    <option value="">Select Driver</option>
                                    {labours.filter(l => l.workType?.toLowerCase() === 'driver').map((l: any) => (
                                        <option key={l._id} value={l._id}>{l.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block text-primary">Customer (Link to Sale)</label>
                                <select name="customerId" className="form-select border-primary/50" value={formData.customerId} onChange={handleChange}>
                                    <option value="">None (Internal Trip)</option>
                                    {customers.map((c: any) => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-bold text-white-dark uppercase mb-2 block">From Location</label>
                                    <input type="text" name="fromLocation" className="form-input font-bold text-primary" value={formData.fromLocation} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-white-dark uppercase mb-2 block">To Location</label>
                                    <input type="text" name="toLocation" className="form-input" value={formData.toLocation} onChange={handleChange} required placeholder="Destination address" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Material Type</label>
                                <select name="stoneTypeId" className="form-select" value={formData.stoneTypeId} onChange={handleChange} required>
                                    <option value="">Select Material</option>
                                    {stoneTypes.map((s: any) => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.unit})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Quantity</label>
                                <input type="number" name="loadQuantity" className="form-input" value={formData.loadQuantity} onChange={handleChange} required step="0.01" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Unit</label>
                                <select name="loadUnit" className="form-select" value={formData.loadUnit} onChange={handleChange} required>
                                    <option value="Tons">Tons</option>
                                    <option value="Units">Units</option>
                                    <option value="Loads">Loads</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block text-success">Trip Rate / Freight (₹)</label>
                                <input type="number" name="tripRate" className="form-input border-success text-success font-bold" value={formData.tripRate} onChange={handleChange} required placeholder="Income from trip" />
                            </div>
                        </div>

                        <div className="bg-info/5 p-4 rounded-lg">
                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Remarks / Notes</label>
                            <textarea name="notes" className="form-textarea min-h-[80px]" value={formData.notes || ''} onChange={handleChange}></textarea>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button type="button" className="btn btn-outline-danger" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-8">
                                <IconSave className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                {editId ? 'Update Record' : 'Save Record'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <div className="panel">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-bold text-lg dark:text-white-light">Journey Logs</h5>
                        <div className="relative w-full max-w-xs">
                            <input type="text" placeholder="Search by number or driver..." className="form-input ltr:pr-11 rtl:pl-11" />
                            <IconSearch className="w-5 h-5 absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-white-dark" />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Vehicle / Driver</th>
                                    <th>Route</th>
                                    <th>Material</th>
                                    <th className="!text-right">Income (A)</th>
                                    <th className="!text-right text-danger">Exp. (B)</th>
                                    <th className="!text-right text-success bg-success/5 font-black">Profit (A-B)</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
                                ) : trips.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-8">No records recorded yet.</td></tr>
                                ) : (
                                    trips.map((trip) => (
                                        <tr key={trip._id}>
                                            <td>{new Date(trip.date).toLocaleDateString('en-GB')}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <span className={`badge badge-outline-primary text-[10px] py-0.5 px-1.5`}>{trip.vehicleId?.category || trip.vehicleType || 'Vehicle'}</span>
                                                    <div className="font-bold text-primary">{trip.vehicleId?.vehicleNumber || trip.vehicleId?.registrationNumber || 'Unknown'}</div>
                                                </div>
                                                <div className="text-xs text-secondary font-medium italic mt-1">{trip.driverId?.name || 'No Driver'}</div>
                                            </td>
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-white-dark uppercase tracking-tighter">CUSTOMER: {trip.customerId?.name || 'INTERNAL'}</span>
                                                    <div className="mt-1">
                                                        <span className="text-[10px] font-bold uppercase">{trip.fromLocation}</span>
                                                        <span className="mx-1 text-white-dark">→</span>
                                                        <span className="text-[10px] font-bold uppercase">{trip.toLocation}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-outline-dark">{trip.stoneTypeId?.name || 'Material'}</span>
                                                <div className="text-[10px] mt-1 font-bold">{trip.loadQuantity} {trip.loadUnit}</div>
                                            </td>
                                            <td className="!text-right font-black text-primary font-mono whitespace-nowrap">₹{trip.tripRate?.toLocaleString()}</td>
                                            <td className="!text-center">
                                                {trip.isConvertedToSale ? (
                                                    <span className="badge badge-outline-success bg-success/5 border-dashed">Invoiced</span>
                                                ) : trip.customerId ? (
                                                    <button
                                                        onClick={() => handleConvertToSale(trip._id)}
                                                        className="btn btn-xs btn-primary shadow-none text-[10px] py-1 px-2"
                                                    >
                                                        Convert to Sale
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-white-dark italic">Internal Trip</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {!trip.isConvertedToSale && (
                                                        <>
                                                            <button onClick={() => handleEdit(trip)} className="btn btn-sm btn-outline-primary p-1">
                                                                <IconEdit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => setDeleteId(trip._id)} className="btn btn-sm btn-outline-danger p-1">
                                                                <IconTrashLines className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
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
                title="Delete Trip Record"
                message="Are you sure you want to delete this trip record? This will also remove associated profit data."
            />
        </div>
    );
};

export default TripManagement;
