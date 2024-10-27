import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const rateLimitStore: Record<string, { count: number; lastRequestTime: number }> = {};

const RATE_LIMIT = 5; // Maximum number of requests
const WINDOW_TIME = 10000; // 10 seconds in milliseconds

export default async function middleware(
    request: NextRequest,
    event: NextFetchEvent,
): Promise<Response | undefined> {
    const ip = request.ip ?? "127.0.0.1";
    const currentTime = Date.now();

    // Initialize the IP entry if it doesn't exist
    if (!rateLimitStore[ip]) {
        rateLimitStore[ip] = { count: 0, lastRequestTime: currentTime };
    }

    const { count, lastRequestTime } = rateLimitStore[ip];

    // Reset the count if the time window has passed
    if (currentTime - lastRequestTime > WINDOW_TIME) {
        rateLimitStore[ip] = { count: 1, lastRequestTime: currentTime };
    } else {
        // Increment the count within the time window
        if (count < RATE_LIMIT) {
            rateLimitStore[ip].count += 1;
        } else {
            return NextResponse.redirect(new URL("/blocked", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/",
};
