import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000"

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required and must be a string" }, { status: 400 })
    }

    const backendResponse = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        history,
      }),
    })

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.json().catch(() => ({}))
      console.error("Backend error:", errorBody)
      return NextResponse.json({ error: errorBody?.detail ?? "Chat backend error" }, { status: backendResponse.status })
    }

    const data = await backendResponse.json()

    return NextResponse.json({
      response: data?.response ?? "",
    })
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
