import { NextResponse } from "next/server";
import { processWithGemini } from "@/lib/gemini";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { message, history } = await req.json();

        const userInfo = session?.user?.id ? await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { prescriptions: { orderBy: { createdAt: 'desc' }, take: 3 } }
        }) : null;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const personalizationContext = userInfo ? `
      PATIENT PROFILE:
      - Name: ${userInfo.username}
      - Age: ${userInfo.age || "Not specified"}
      - Medical Conditions: ${userInfo.medicalHistory || "None documented"}
      - Recent Prescriptions: ${userInfo.prescriptions.map((p: any) => p.data).join(", ")}
    ` : "";

        const systemPrompt = `
      You are CareScan AI, a specialized medical assistant. 
      Your goal is to help users understand their medications, dosages, and safety restrictions.
      ${personalizationContext}
      
      Guidelines:
      1. Provide clear, medically-grounded information.
      2. If asked about side effects or restrictions, be thorough but easy to understand.
      3. ALWAYS include a disclaimer that you are an AI and the user should consult a doctor.
      4. Avoid providing specific medical diagnoses; focus on medication information.
      5. Use a helpful, professional, and empathetic tone.
      
      User Message: ${message}
      
      Previous Chat History: ${history ? history.slice(-5).map((m: any) => `${m.role}: ${m.content}`).join("\n") : "None"}
    `;

        const response = await processWithGemini(systemPrompt);
        const text = response.text();

        return NextResponse.json({ reply: text });
    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Failed to process chat", details: error.message }, { status: 500 });
    }
}
