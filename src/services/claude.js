import Anthropic from '@anthropic-ai/sdk';

let anthropicClient = null;

export const initClaudeClient = (apiKey) => {
  anthropicClient = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true 
  });
};

export const checkHasKey = () => !!anthropicClient;

const SYSTEM_PROMPT = `You are a calm, highly efficient emergency response assistant named RoadSoS.
The user might be panicked. Speak clearly, shortly, and concisely.
Your goal is to quickly understand the situation (e.g. accident, breakdown, medical emergency) 
and recommend the immediate next steps.

CRITICAL INSTRUCTION: If the situation requires a specific type of emergency service, you MUST include one of the following exact tags at the VERY END of your message:
[FILTER:hospital] - for medical emergencies, injuries
[FILTER:pharmacy] - for minor medical issues needing medication
[FILTER:police] - for crimes, severe accidents, security
[FILTER:ambulance] - for severe medical emergencies requiring transport
[FILTER:mechanic] - for vehicle breakdowns, flat tires, minor accidents, towing

Use the user's language if they type in Hindi, English, Tamil, or Telugu.
Always output extremely concise, bulleted advice. Never overwhelm them with text.`;

export const getClaudeResponse = async (messages) => {
  if (!anthropicClient) {
    throw new Error('Claude API client not initialized. Please provide an API key.');
  }

  try {
    const response = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: messages
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
};
