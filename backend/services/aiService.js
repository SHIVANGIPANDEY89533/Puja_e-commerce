import { GoogleGenerativeAI } from '@google/generative-ai';
import AIChat from '../models/AIChat.js';
import Order from '../models/Order.js';
import Ticket from '../models/Ticket.js';

// Initialize Gemini API
const getGeminiInstance = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in .env file.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// Define standard business context
const STORE_CONTEXT = `
You are the official AI Support Assistant for the "Puja Samagri" E-commerce store.
Your goal is to help customers with their queries, provide product recommendations, check order statuses, and handle return/refund inquiries.
Always be polite, culturally respectful (use 'Namaste' occasionally), and concise.

Store Policies & Facts:
- Store Name: Puja Samagri
- Deliveries usually take 3-5 business days.
- Return Policy: 7 days from delivery.
- Refund Policy: Processed within 5-7 business days after receiving the returned item.
- Payments: We accept all major credit cards, UPI, and net banking.
- Cancellations: Only allowed before the order is shipped.

CRITICAL RULES:
1. Do NOT hallucinate order statuses or details. Only use the customer data provided in the context below.
2. If the user asks something you cannot answer based on the provided context, or if they are frustrated, gently offer to create a Support Ticket for them (e.g. "I can quickly escalate this by creating a support ticket for our human administrators.").
3. Never expose the raw JSON data formatting to the user. Read it and answer naturally.
`;

export const getAIResponse = async (sessionId, user, message) => {
  try {
    const genAI = getGeminiInstance();
    
    // If no API key is provided, gracefully fallback to a simple rule-based response temporarily
    // (This helps avoid crashes before the user sets up the key)
    if (!genAI) {
      return "I'm sorry, my AI processing engine (Gemini) is currently not configured by the administrator. Please create a support ticket for further assistance.";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 1. Retrieve or Create AIChat Session
    let chatSession = await AIChat.findOne({ sessionId, user: user._id });
    if (!chatSession) {
      chatSession = new AIChat({
        sessionId,
        user: user._id,
        messages: []
      });
    }

    // 2. Fetch User Context Data (Recent Orders & Tickets)
    // We only fetch recent ones to avoid token limits
    const recentOrders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(3).lean();
    const recentTickets = await Ticket.find({ user: user._id }).sort({ createdAt: -1 }).limit(3).lean();

    const customerContext = `
Customer Profile:
- Name: ${user.name}
- Email: ${user.email}

Recent Orders (JSON):
${JSON.stringify(recentOrders, null, 2)}

Recent Support Tickets (JSON):
${JSON.stringify(recentTickets, null, 2)}
`;

    // 3. Assemble Chat History for Gemini API
    // Gemini expects history in the format: { role: "user" | "model", parts: [{ text: "..." }] }
    const history = [
      // Inject System Prompt & Context as the first User message (since Gemini standard API doesn't support systemInstruction in older simple SDK calls, we inject it in history or use systemInstruction if available)
      {
        role: "user",
        parts: [{ text: STORE_CONTEXT + "\n\n" + customerContext + "\n\nHello, I am the customer. Please acknowledge these instructions." }]
      },
      {
        role: "model",
        parts: [{ text: "Namaste! I have received your profile and store instructions. How can I assist you today?" }]
      }
    ];

    // Append previous DB messages
    chatSession.messages.forEach(msg => {
      history.push({
        role: msg.sender === 'User' ? 'user' : 'model',
        parts: [{ text: msg.message }]
      });
    });

    // 4. Start Chat and Send Message
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    const aiReply = result.response.text();

    // 5. Save to MongoDB
    chatSession.messages.push({ sender: 'User', message });
    chatSession.messages.push({ sender: 'AI', message: aiReply });
    
    // Auto-generate title on first user message if it's new
    if (chatSession.messages.length === 2 && chatSession.title === 'Support Conversation') {
      chatSession.title = message.substring(0, 30) + "...";
    }

    await chatSession.save();

    return aiReply;

  } catch (error) {
    console.error("AI Service Error:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again or create a support ticket.";
  }
};
