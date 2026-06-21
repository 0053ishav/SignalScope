// import OpenAI from "openai";

// import {
//   FallbackSignalResponse,
// } from "./types";

// const openai = new OpenAI({
//   apiKey:
//     process.env.OPENAI_API_KEY,
// });

// export async function generateFallbackSignals(
//   lyrics: string,
//   translation?: string
// ): Promise<FallbackSignalResponse> {
//   const content =
//     translation || lyrics;

//   const response =
//     await openai.chat.completions.create(
//       {
//         model: "gpt-4o-mini",

//         response_format: {
//           type: "json_object",
//         },

//         messages: [
//           {
//             role: "system",

//             content: `
// You are a music analyst.

// Extract:

// - moods
// - themes
// - meaning

// Return JSON only.

// {
//   "moods": [],
//   "themes": [],
//   "meaning": ""
// }
// `,
//           },

//           {
//             role: "user",

//             content,
//           },
//         ],
//       }
//     );

//   const text =
//     response.choices[0]
//       .message.content ?? "{}";

//   return JSON.parse(text);
// }