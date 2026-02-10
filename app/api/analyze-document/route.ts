import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "application/pdf";

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      {
        text: `You are a financial document analyst for a real estate lending platform. Analyze this ${documentType || "document"} and provide a concise summary.

Your response MUST follow this exact format:
1. Start with a one-line overview of what this document is
2. List 4-6 key points as bullet points, focusing on:
   - Financial figures (amounts, values, costs)
   - Important dates or timelines
   - Key terms or conditions
   - Risk factors or concerns (if any)
   - Verification status or authenticity indicators
3. End with a brief assessment (1 line) of the document's relevance for loan evaluation

Keep the total response to 5-10 lines. Be factual and specific. If you cannot read the document clearly, state that.`,
      },
    ]);

    const summary = result?.response?.text() || "Unable to generate summary";

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Error analyzing document:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to analyze document",
      },
      { status: 500 }
    );
  }
}
