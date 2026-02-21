import mongoose, { Schema, model, models } from 'mongoose';

const ProductionSchema = new Schema(
    {
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        stoneType: {
            type: String, // e.g., 20mm, 40mm, M-Sand
            required: true,
        },
        quantity: {
            type: Number, // in units or tons
            required: true,
        },
        unit: {
            type: String,
            default: 'Tons',
        },
        machineUsed: {
            type: String,
        },
        supervisorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

const Production = models.Production || model('Production', ProductionSchema);

export default Production;
