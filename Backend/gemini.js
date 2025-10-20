import axios from 'axios';


const geminiResponse = async (command, assitantName, userName) => {
    // 1. Endpoint Fix and API Key Handling
    const fullApiUrl = process.env.GEMINI_API_URL;

    // Check if the URL is correct (important for 400 error)
    if (!fullApiUrl || !fullApiUrl.includes(':generateContent')) {
        console.error("API URL is incorrect. Please ensure it uses ':generateContent'.");
        // Fallback for an immediate failure to prevent API call
        return JSON.stringify({
            type: "general",
            userInput: command,
            response: "Configuration error: My API endpoint is incorrect. Please check the backend settings."
        });
    }

    // 2. Optimized and Simplified Prompt
    const optimizedPrompt = `You are a virtual assistant named "${assitantName}" created by "${userName}".
You are a voice-enabled assistant and MUST ONLY respond with a single JSON object.

The JSON structure MUST be:
{
  "type": "<INTENT-TYPE>",
  "userInput": "<CLEANED-USER-INPUT>",
  "response": "<SPOKEN-RESPONSE-TO-USER>"
}

INTENT-TYPE is one of:
"general", "google-search", "youtube-search", "youtube-play", "weather-show", 
"get-time", "get-date", "open-application", "close-application"

### Instructions:
1. Detect the user's intent and set "type" accordingly.
2. For "google-search" or "youtube-search", "userInput" should contain only the search query (remove your name if mentioned).
3. For "youtube-play", if the user says a song name, extract it and directly play it on YouTube.
4. For "open-application" or "close-application", "userInput" should contain only the app name (e.g., "Calculator", "Spotify", "Facebook"). Do NOT list all apps in JSON.
5. For "general", respond in **short, natural Hinglish** (like a human voice). Keep answers 1–2 lines.
6. "response" MUST be short and voice-friendly. Examples: "Theek hai, YouTube pe play kar raha hoon.", "Opening the app.", "It's 5:30 PM.", "Main Google pe search kar raha hoon."

### Important:
- If asked who created you, always mention "${userName}".
- Respond ONLY with the JSON object, nothing else.

User input: "${command}"`
    const requestBody = {
        contents: [{
            parts: [{
                text: optimizedPrompt
            }]
        }],
        generationConfig: {
            temperature: 0.1,
        },
    };

    try {
        const result = await axios.post(fullApiUrl, requestBody);

        // API response ko check karein
        const candidate = result.data?.candidates?.[0];
        const textResponse = candidate?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error("Gemini returned an empty or invalid response structure.");
        }

        return textResponse;

    } catch (error) {
        // 3. Robust Error Handling (for Status 400 and network issues)
        console.error("Axios/Gemini API Error:", error.message);

        // Agar error 400/500 hai, toh ek default JSON string return karein
        // taki calling function (controller) mein TypeError na aaye.
        const defaultErrorResponse = {
            type: "general",
            userInput: command,
            response: "Oops! I hit a technical snag. Please try asking me again."
        };

        // Agar Axios response mein data hai toh detailed error log karein
        if (error.response) {
            console.error("API Status:", error.response.status);
            console.error("API Error Data:", error.response.data);

            // Agar 400 error ho toh ek specific response de sakte hain
            if (error.response.status === 400) {
                defaultErrorResponse.response = "Sorry, my internal instructions might be too long. Can you ask a simpler question?";
            }
        }

        return JSON.stringify(defaultErrorResponse);
    }
}

export default geminiResponse;