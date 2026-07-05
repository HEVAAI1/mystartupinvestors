import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

        if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
            console.error("Admin credentials not configured");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error("Admin login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
