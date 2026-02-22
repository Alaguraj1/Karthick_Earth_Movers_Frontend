'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/components/stone-mine/toast-notification';
import IconEdit from '@/components/icon/icon-edit';
import IconSearch from '@/components/icon/icon-search';
import IconSave from '@/components/icon/icon-save';
import IconX from '@/components/icon/icon-x';

const API = process.env.NEXT_PUBLIC_API_URL;

const DieselTripManagement = () => {
    const { showToast } = useToast();
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTrip, setEditingTrip] = useState<any>(null);

    const [form, setForm] = useState({
        dieselQuantity: '',
        dieselRate: '',
        dieselTotal: 0
    });

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API}/trips`);
            if (data.success) setTrips(data.data);
        } catch (error) {
            console.error(error);
            showToast('Error fetching trips', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    const handleEdit = (trip: any) => {
        setEditingTrip(trip);
        setForm({
            dieselQuantity: trip.dieselQuantity?.toString() || '',
            dieselRate: trip.dieselRate?.toString() || '',
            dieselTotal: trip.dieselTotal || 0
        });
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        const newForm = { ...form, [name]: value };

        if (name === 'dieselQuantity' || name === 'dieselRate') {
            const qty = parseFloat(name === 'dieselQuantity' ? value : form.dieselQuantity) || 0;
            const rate = parseFloat(name === 'dieselRate' ? value : form.dieselRate) || 0;
            newForm.dieselTotal = qty * rate;
        }

        setForm(newForm);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const { data } = await axios.put(`${API}/trips/${editingTrip._id}`, form);
            if (data.success) {
                showToast('Diesel details updated!', 'success');
                setEditingTrip(null);
                fetchTrips();
            }
        } catch (error) {
            console.error(error);
            showToast('Error updating diesel', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold dark:text-white-light">ஒவ்வொரு trip-க்கு டீசல் செலவு (Diesel per Trip)</h2>
                <p className="text-white-dark text-sm mt-1">Track fuel consumption and costs for each individual journey</p>
            </div>

            {editingTrip && (
                <div className="panel animate__animated animate__fadeInDown border-warning border">
                    <div className="flex items-center justify-between mb-5 border-b pb-3">
                        <h5 className="font-bold text-lg">Update Diesel: {editingTrip.vehicleNumber || editingTrip.lorryNumber} ({new Date(editingTrip.date).toLocaleDateString()})</h5>
                        <button onClick={() => setEditingTrip(null)}><IconX /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
                        <div className="md:col-span-1">
                            <label className="text-xs font-bold uppercase mb-2 block">Diesel Quantity (Litres)</label>
                            <input type="number" name="dieselQuantity" className="form-input" value={form.dieselQuantity} onChange={handleChange} required step="0.01" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-xs font-bold uppercase mb-2 block">Rate per Litre (₹)</label>
                            <input type="number" name="dieselRate" className="form-input" value={form.dieselRate} onChange={handleChange} required step="0.01" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-xs font-bold uppercase mb-2 block">Total Diesel Cost (₹)</label>
                            <input type="number" className="form-input bg-gray-100 dark:bg-dark text-primary font-bold" value={form.dieselTotal} readOnly />
                        </div>
                        <div className="md:col-span-1">
                            <button type="submit" className="btn btn-warning w-full">
                                <IconSave className="ltr:mr-2 rtl:ml-2" /> Update Fuel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-bold text-lg">Trip-wise Diesel Log</h5>
                    <div className="relative">
                        <input type="text" placeholder="Search by Vehicle..." className="form-input ltr:pr-10 rtl:pl-10" />
                        <IconSearch className="w-5 h-5 absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-white-dark" />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Vehicle / Route</th>
                                <th>Quantity (L)</th>
                                <th>Rate (₹)</th>
                                <th className="!text-right">Total Fuel Cost</th>
                                <th className="!text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                            ) : trips.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8">No trips found.</td></tr>
                            ) : (
                                trips.map(trip => (
                                    <tr key={trip._id}>
                                        <td>{new Date(trip.date).toLocaleDateString('en-GB')}</td>
                                        <td>
                                            <div className="font-bold">{trip.vehicleNumber || trip.lorryNumber}</div>
                                            <div className="text-xs text-white-dark">{trip.fromLocation} → {trip.toLocation}</div>
                                        </td>
                                        <td>{trip.dieselQuantity || '0'} L</td>
                                        <td>₹{trip.dieselRate || '0'}</td>
                                        <td className="!text-right font-bold text-danger">₹{trip.dieselTotal?.toLocaleString() || '0'}</td>
                                        <td className="text-center">
                                            <button className="btn btn-sm btn-outline-warning" onClick={() => handleEdit(trip)}>
                                                <IconEdit className="w-4 h-4 ltr:mr-1 rtl:ml-1" /> Edit Diesel
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DieselTripManagement;
