const fs = require('fs');

const path = 'd:/Effidooo/Stone Mine/Karthick Earth movers/frontend/components/stone-mine/transport/trip-management.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add sales states
content = content.replace(
    `const [trips, setTrips] = useState<any[]>([]);`,
    `const [trips, setTrips] = useState<any[]>([]);\n    const [sales, setSales] = useState<any[]>([]);`
);

// Fetch sales
content = content.replace(
    `axios.get(\`\${API}/master/vehicle-categories\`),`,
    `axios.get(\`\${API}/master/vehicle-categories\`),\n                axios.get(\`\${API}/sales\`),`
);
content = content.replace(
    `const [tripRes, vehicleRes, labourRes, customerRes, stoneRes, categoryRes] = await Promise.all([`,
    `const [tripRes, vehicleRes, labourRes, customerRes, stoneRes, categoryRes, salesRes] = await Promise.all([`
);
content = content.replace(
    `if (categoryRes.data.success) setVehicleCategories(categoryRes.data.data);`,
    `if (categoryRes.data.success) setVehicleCategories(categoryRes.data.data);\n            if (salesRes && salesRes.data.success) setSales(salesRes.data.data);`
);

// Update initial form
content = content.replace(
    `loadUnit: 'Tons',\n        tripRate: '',`,
    `loadUnit: 'Tons',\n        saleId: '',`
);

// Update handleEdit
content = content.replace(
    `loadUnit: trip.loadUnit || 'Tons',\n            tripRate: trip.tripRate || '',`,
    `loadUnit: trip.loadUnit || 'Tons',\n            saleId: trip.saleId?._id || trip.saleId || '',`
);

// Form Fields: Customer => Sale Selection
content = content.replace(
    `<label className="text-sm font-bold text-white-dark uppercase mb-2 block text-primary">Customer (Link to Sale)</label>
                                <select name="customerId" className="form-select border-primary/50" value={formData.customerId} onChange={handleChange}>
                                    <option value="">None (Internal Trip)</option>
                                    {customers.map((c: any) => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>`,
    `<label className="text-sm font-bold text-white-dark uppercase mb-2 block text-primary">Select Sale (Invoice)</label>
                                <select name="saleId" className="form-select border-primary" value={formData.saleId} onChange={handleChange}>
                                    <option value="">-- No Sale Linked (Internal) --</option>
                                    {sales.map((s: any) => (
                                        <option key={s._id} value={s._id}>{s.invoiceNumber} ({s.customer?.name})</option>
                                    ))}
                                </select>`
);

// Remove tripRate Input Grid Column (or change it into empty div if we want grid to stay same)
content = content.replace(
    `<div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block text-success">Trip Rate / Freight (₹)</label>
                                <input type="number" name="tripRate" className="form-input border-success text-success font-bold" value={formData.tripRate} onChange={handleChange} required placeholder="Income from trip" />
                            </div>`,
    `<div></div>`
);

// Table Headers
content = content.replace(
    `<th className="!text-right">Income (A)</th>
                                    <th className="!text-right text-danger">Exp. (B)</th>
                                    <th className="!text-right text-success bg-success/5 font-black">Profit (A-B)</th>
                                    <th className="!text-center">Actions</th>`,
    `<th className="!text-right text-danger">Expenses</th>
                                    <th className="!text-center">Linked Sale</th>
                                    <th className="!text-center">Actions</th>`
);

// Table Body Data Replacement
content = content.replace(
    `<td className="!text-right font-black text-primary font-mono whitespace-nowrap">₹{trip.tripRate?.toLocaleString()}</td>
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
                                                        <>`,
    `<td className="!text-right text-danger font-bold">₹{((trip.driverAmount || 0) + (trip.driverBata || 0) + (trip.otherExpenses || 0)).toLocaleString()}</td>
                                            <td className="!text-center">
                                                {trip.saleId ? (
                                                    <span className="badge badge-outline-success bg-success/5 border-dashed">{trip.saleId.invoiceNumber}</span>
                                                ) : (
                                                    <span className="text-[10px] text-white-dark italic">Internal Trip</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                        <>`
);


// Replace `handleConvertToSale` function content with empty void, since we're no longer using it.
content = content.replace(
    `const handleConvertToSale = async (tripId: string) => {
        try {
            const { data } = await axios.post(\`\${API}/trips/\${tripId}/convert-to-sale\`);
            if (data.success) {
                showToast('Trip converted to Sale successfully!', 'success');
                fetchData();
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error converting trip', 'error');
        }
    };`,
    `const handleConvertToSale = async (tripId: string) => {};`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Successfully patched trip-management.tsx");
