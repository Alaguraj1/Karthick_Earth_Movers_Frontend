import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Income from '@/models/Income';

export async function GET() {
    await dbConnect();
    try {
        const income = await Income.find({}).sort({ date: -1 });
        return NextResponse.json({ success: true, data: income });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const income = await Income.create(body);
        return NextResponse.json({ success: true, data: income }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
