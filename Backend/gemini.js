import axios from "axios";

/*
  Gemini AI Response Handler
  Purpose:
  - Sends structured prompt to Gemini
  - Forces strict JSON output
  - Detects intent
  - Handles real-time date & time
  - Prevents malformed responses
*/

const geminiResponse = async (command, assistantName, userName) => {

  // 1️⃣ Validate API URL and configuration
  const fullApiUrl = process.env.GEMINI_API_URL;

  if (!fullApiUrl || !fullApiUrl.includes(":generateContent")) {
    return JSON.stringify({
      type: "general",
      userInput: command,
      response: "Configuration error: API endpoint is invalid."
    });
  }

  // 2️⃣ Generate Real-Time Date & Time for Context
  const now = new Date();
  const currentTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const currentDate = now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  // 3️⃣ Advanced Structured Prompt Engineering
  const optimizedPrompt = `
You are a smart AI voice assistant named "${assistantName}" created by "${userName}".

You MUST respond ONLY in valid JSON format.

JSON STRUCTURE:
{
  "type": "<INTENT_TYPE>",
  "userInput": "<CLEANED_USER_COMMAND>",
  "response": "<SHORT_VOICE_FRIENDLY_REPLY>"
}

Allowed INTENT_TYPE values:
"general",
"google-search",
"youtube-search",
"youtube-play",
"weather-show",
"get-time",
"get-date",
"open-application",
"close-application"

REAL-TIME CONTEXT:
Current Time: ${currentTime}
Current Date: ${currentDate}

INSTRUCTIONS:

1. Detect user intent carefully.
2. Remove assistant name from userInput.
3. Keep "response" short (max 1-2 lines).
4. Speak in natural Hinglish tone.
5. If asked current time → use provided real-time value.
6. If asked date → use provided real-time value.
7. If asked who created you → always say "${userName}" created you.
8. For open/close application → only return app name in userInput.
9. For searches → only return search query.
10. NEVER return explanation. ONLY JSON.

User Command:
"${command}"
`;

  // 4️⃣ Request Body with Optimized Configuration
  const requestBody = {
    contents: [
      {
        parts: [{ text: optimizedPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 300
    }
  };

  try {

    // 5️⃣ API Call to Gemini
    const result = await axios.post(fullApiUrl, requestBody);

    const candidate = result.data?.candidates?.[0];
    const textResponse = candidate?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error("Invalid Gemini response structure.");
    }

    // 6️⃣ Safe JSON Validation Before Returning
    try {
      const parsed = JSON.parse(textResponse);
      return JSON.stringify(parsed);
    } catch (parseError) {
      return JSON.stringify({
        type: "general",
        userInput: command,
        response: "Sorry, I received an invalid AI response. Please try again."
      });
    }

  } catch (error) {

    // 7️⃣ Production-Grade Error Handling
    const defaultErrorResponse = {
      type: "general",
      userInput: command,
      response: "Oops! Technical issue occurred. Please try again."
    };

    if (error.response) {
      if (error.response.status === 400) {
        defaultErrorResponse.response = "Bad request error. Please simplify your command.";
      }
      if (error.response.status === 401) {
        defaultErrorResponse.response = "Unauthorized access. API key may be invalid.";
      }
      if (error.response.status === 429) {
        defaultErrorResponse.response = "Too many requests. Please wait a moment.";
      }
    }

    return JSON.stringify(defaultErrorResponse);
  }
};

export default geminiResponse;
