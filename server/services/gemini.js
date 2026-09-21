const { GoogleGenAI } = require("@google/genai");
const { subDays, previousMonday, previousSunday, startOfWeek, format } = require("date-fns");

const CATEGORIES = [
  "Food", "Groceries", "Transport", "Shopping", "Entertainment",
  "Bills", "Health", "Education", "Travel", "Other",
];

// initialize gemini client
let ai = null;
function getAI() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

// retry wrapper for transient 503 errors
async function withRetry(fn, retries = 3, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const status = err?.status || err?.response?.status || err?.error?.code;
      const isRetryable = status === 503 || status === 429;
      if (isRetryable && i < retries - 1) {
        console.log(`Gemini API returned ${status}, retrying in ${delayMs}ms... (attempt ${i + 2}/${retries})`);
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs *= 2; // exponential backoff
      } else {
        throw err;
      }
    }
  }
}

// resolve relative dates like "yesterday", "last monday" etc.
function resolveRelativeDate(dateStr) {
  if (!dateStr) return new Date().toISOString();

  const lower = dateStr.toLowerCase().trim();
  const today = new Date();

  if (lower === "today") return today.toISOString();
  if (lower === "yesterday") return subDays(today, 1).toISOString();
  if (lower === "day before yesterday") return subDays(today, 2).toISOString();
  if (lower === "last monday") return previousMonday(today).toISOString();
  if (lower === "last sunday") return previousSunday(today).toISOString();

  // try to parse as a date
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed.toISOString();

  // fallback to today
  return today.toISOString();
}

// parse expense from natural language text using gemini
async function parseExpense(text) {
  const genai = getAI();

  const prompt = `Extract expense details from this text: "${text}"

Today's date is ${format(new Date(), "yyyy-MM-dd")} (${format(new Date(), "EEEE")}).

Return a JSON object with these fields:
- amount: number (the amount spent)
- category: one of [${CATEGORIES.join(", ")}]
- merchant: string (the store/place name, or empty string if not mentioned)
- date: string (the date in ISO format, resolve relative dates like "yesterday" relative to today)

If the category doesn't clearly match any option, use "Other".
If no date is mentioned, use today's date.
Only return the JSON object, nothing else.`;

  try {
    // set a timeout of 10 seconds
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await withRetry(() => genai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            amount: { type: "number" },
            category: { type: "string", enum: CATEGORIES },
            merchant: { type: "string" },
            date: { type: "string" },
          },
          required: ["amount", "category", "date"],
        },
      },
    }));

    clearTimeout(timeout);

    const parsed = JSON.parse(response.text);

    // resolve any relative dates that gemini might have returned
    if (parsed.date && isNaN(Date.parse(parsed.date))) {
      parsed.date = resolveRelativeDate(parsed.date);
    }

    return parsed;
  } catch (err) {
    console.error("Gemini parse error:", err.message);
    return null;
  }
}

// translate a user question into a mongodb aggregation pipeline
async function questionToQuery(question, userId) {
  const genai = getAI();

  const prompt = `You are a MongoDB query generator. Convert this user question about their expenses into a MongoDB aggregation pipeline.

Question: "${question}"
Today's date: ${format(new Date(), "yyyy-MM-dd")}
User ID (as string): "${userId}"

The expenses collection has these fields:
- userId (ObjectId)
- amount (Number)
- category (String, one of: ${CATEGORIES.join(", ")})
- merchant (String)
- date (Date)
- isAnomaly (Boolean)

RULES:
1. Always include a $match stage with userId filter (use the string, I will convert it to ObjectId)
2. Only use these stages: $match, $group, $sort, $project, $limit
3. For date filtering, use ISO date strings (I will convert them to Date objects)
4. Return ONLY the JSON array of pipeline stages, nothing else

Example output:
[{"$match": {"userId": "${userId}", "date": {"$gte": "2024-01-01"}}}, {"$group": {"_id": null, "total": {"$sum": "$amount"}}}]`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await withRetry(() => genai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    }));

    clearTimeout(timeout);

    const pipeline = JSON.parse(response.text);
    return pipeline;
  } catch (err) {
    console.error("Gemini query error:", err.message);
    return null;
  }
}

// generate a natural language answer from query results
async function generateAnswer(question, queryResult) {
  const genai = getAI();

  const prompt = `The user asked: "${question}"

Here is the data from their expense database:
${JSON.stringify(queryResult)}

Please give a short, friendly, natural language answer. Use ₹ for currency.
If the data is empty, say you couldn't find any matching expenses.
Keep it brief - 1-2 sentences max.`;

  try {
    const response = await withRetry(() => genai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    }));

    return response.text;
  } catch (err) {
    console.error("Gemini answer error:", err.message);
    return "Sorry, I couldn't generate an answer right now. Please try again.";
  }
}

// generate a natural language answer from query results as a stream
async function generateAnswerStream(question, queryResult) {
  const genai = getAI();

  const prompt = `The user asked: "${question}"

Here is the data from their expense database:
${JSON.stringify(queryResult)}

Please give a short, friendly, natural language answer. Use ₹ for currency.
If the data is empty, say you couldn't find any matching expenses.
Keep it brief - 1-2 sentences max.`;

  try {
    const responseStream = await withRetry(() => genai.models.generateContentStream({
      model: "gemini-3.6-flash",
      contents: prompt,
    }));
    return responseStream;
  } catch (err) {
    console.error("Gemini answer stream error:", err.message);
    return null;
  }
}

module.exports = { parseExpense, questionToQuery, generateAnswer, generateAnswerStream };
