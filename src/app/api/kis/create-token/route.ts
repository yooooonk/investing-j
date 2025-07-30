import axios from "axios";
import https from "https";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = await axios.post(
      "https://createkistoken-lqutao4a4q-du.a.run.app",
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error creating KIS token:", error);

    if (error.response) {
      console.error("Cloud Function error response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    }

    return NextResponse.json(
      {
        error: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
