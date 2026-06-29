/**
 * AI Service Module
 * Designed to be modular so the underlying engine can be swapped
 * from a Rule-Based system to an LLM (e.g., OpenAI, Gemini, Claude) later
 * without changing the frontend implementation.
 */

// Rule-based AI Engine
const generateRuleBasedResponse = (message) => {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('order') && (lowerMsg.includes('status') || lowerMsg.includes('where'))) {
    return "I can help you check your order status. Could you please provide your Order ID? If you're still having trouble, I can create a support ticket for our human support team.";
  }
  
  if (lowerMsg.includes('delivery') || lowerMsg.includes('arrive')) {
    return "I can help with delivery issues. Deliveries usually take 3-5 business days. Please provide your Order ID to check specifics. If your issue isn't resolved, I can create a support ticket for you.";
  }

  if (lowerMsg.includes('refund') || lowerMsg.includes('return')) {
    return "Our return policy allows returns within 7 days of delivery. Refunds are processed within 5-7 business days after we receive the returned item. If you need to initiate a return, I can help you create a support ticket.";
  }
  
  if (lowerMsg.includes('payment') || lowerMsg.includes('charge')) {
    return "I see you have a question about payments. We accept all major credit cards, UPI, and net banking. If a charge failed but money was deducted, it usually refunds within 48 hours. Should I escalate this to a human agent?";
  }
  
  if (lowerMsg.includes('cancel')) {
    return "Orders can only be cancelled before they are shipped. If you'd like to request a cancellation, please let me know or create a support ticket with your Order ID.";
  }

  // Default fallback response
  return "I'm your AI Assistant. I can help with queries about orders, delivery, payments, or returns. If I can't resolve your issue, I can quickly escalate this by creating a support ticket for our human administrators.";
};

/**
 * Public Interface for AI Support Chat
 * @param {string} message The customer's message
 * @returns {string} The AI's response
 */
export const getAIResponse = async (message) => {
  try {
    // In the future, this is where you would call:
    // const response = await openai.chat.completions.create({...})
    // return response.choices[0].message.content;

    // For Phase 1, we use the rule-based engine:
    const response = generateRuleBasedResponse(message);
    
    // Simulate slight network delay to feel like an AI processing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return response;
  } catch (error) {
    console.error("AI Service Error:", error);
    return "I'm having trouble processing your request right now. Please create a support ticket to get help from our team.";
  }
};
