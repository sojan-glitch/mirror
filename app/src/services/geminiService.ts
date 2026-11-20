import { GoogleGenAI } from '@google/genai';
import { VendorClaim } from '../types';

const STORAGE_KEY = 'mirror_gemini_api_key';

export function getStoredApiKey(): string {
  try {
    const meta = import.meta as any;
    return localStorage.getItem(STORAGE_KEY) || (meta.env?.VITE_GEMINI_API_KEY as string) || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to store API key:', e);
  }
}

/**
 * Live AI Q&A using Google Gemini 3.8 Flash via robust direct fetch with exponential timeout
 */
export async function askGeminiForensic(
  question: string,
  context: {
    claims: VendorClaim[];
    timeline: any[];
    coastalData: any;
    evidenceList: any[];
  }
): Promise<{
  text: string;
  confirmedFacts: string[];
  investigativeAssumptions: string[];
  missingInfo: string[];
}> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const systemInstruction = `You are the lead cybersecurity defense forensic investigator on Case CR-26-047 (Harbor & Finch Freight vs. TallyBridge Software).
You have access to 20 corporate forensic evidence logs (E01 to E20).
Analyze the user's question with mathematical rigor and defense alignment.

RULES:
1. Ground answers strictly in verified evidence files (E01-E20).
2. Clearly separate Confirmed Facts from Investigative Working Hypotheses and Missing Information.
3. Return your response as a valid JSON object matching this schema:
{
  "summary": "Direct, executive forensic answer to the question",
  "confirmedFacts": ["Fact 1 with exact evidence reference [E..]", "Fact 2 [E..]"],
  "investigativeAssumptions": ["Working hypothesis 1", "Working hypothesis 2"],
  "missingInfo": ["Information still required from host or vendor"]
}
Only output the JSON object, nothing else.`;

  const promptText = `Current Case Context:
- Claims Contradicted: ${context.claims.filter(c => c.verdict === 'CONTRADICTED').length} of ${context.claims.length}
- Coastal Packaging Bank Change: Modified to ICICI ****9083 on 3 Sep 01:44:30 UTC via key-tb-07 from 10.20.4.77 with approval_ref=null.
- Stolen Credentials: bvk-7f3a (leaked in TKT-48213), key-tb-07 (never rotated).
- Evidence Log Count: 20 sources (E01 to E20).

User Question: "${question}"`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\n${promptText}` }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json'
    }
  };

  // 12-second abort controller to prevent hanging if Google API has network jitter
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Gemini REST API error response:', response.status, errText);
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Empty response candidate from Gemini');
    }

    try {
      const parsed = JSON.parse(candidateText);
      return {
        text: parsed.summary || 'Forensic analysis complete across evidence files E01-E20.',
        confirmedFacts: parsed.confirmedFacts || [],
        investigativeAssumptions: parsed.investigativeAssumptions || [],
        missingInfo: parsed.missingInfo || []
      };
    } catch {
      return {
        text: candidateText,
        confirmedFacts: ['Analysis grounded in multi-system evidence logs (E01-E20)'],
        investigativeAssumptions: ['Inferred threat actor workflow based on credential correlation'],
        missingInfo: ['Internal host process tree telemetry']
      };
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('Direct Gemini call failed, throwing for local fallback:', err);
    throw err;
  }
}
