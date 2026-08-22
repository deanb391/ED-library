import { GoogleGenAI, Type } from "@google/genai";
if (typeof global !== "undefined") {
  if (!global.DOMMatrix) {
    (global as any).DOMMatrix = class DOMMatrix { };
  }
  if (!global.ImageData) {
    (global as any).ImageData = class ImageData { };
  }
  if (!global.Path2D) {
    (global as any).Path2D = class Path2D { };
  }
}

const pdfParse = require("pdf-parse/lib/pdf-parse.js");

import mammoth from "mammoth";
import fetch from "node-fetch";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" });

export async function extractTextFromUrl(fileUrl: string, fileType: string): Promise<string> {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch file from ${fileUrl}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (fileType === "pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (fileType === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}

export async function reviewDocumentWithAI(text: string): Promise<{ status: "approved" | "rejected", reason?: string }> {
  const prompt = `You are a copyright reviewer for an educational platform where students and lecturers share study materials. 
Your job is to determine if the uploaded document is a strictly copyrighted commercial textbook or stolen published material.

You must APPROVE:
- Student-made personal notes, study guides, or original assignments.
- Structured, organized lecture notes or slides provided by a lecturer for sharing.
- Educational materials that focus straight on the content and do not explicitly contain strict commercial copyright notices, publisher information (like ISBN, publication house, "all rights reserved" for commercial sale).

You must REJECT:
- Direct rips of commercially published textbooks (e.g., Pearson, McGraw-Hill, etc.).
- Official published research papers or materials that clearly state they cannot be distributed without permission.

Here is an excerpt of the text (up to 15000 characters):
---
${text.substring(0, 15000)}
---

Evaluate the content. Return a JSON object with 'status' ("approved" or "rejected") and 'reason' (a short explanation if rejected, else empty).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: "Whether the document is approved or rejected",
              enum: ["approved", "rejected"]
            },
            reason: {
              type: Type.STRING,
              description: "The explanation for rejection if applicable"
            }
          },
          required: ["status", "reason"]
        },
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text);
      console.log("Result: ", result.status, result.reason);
      return {
        status: result.status,
        reason: result.reason
      };
    } else {
      return { status: "rejected", reason: "AI Review failed to parse the document." };
    }
  } catch (error) {
    console.error("AI Review error:", error);
    return { status: "rejected", reason: "AI service error." };
  }
}
