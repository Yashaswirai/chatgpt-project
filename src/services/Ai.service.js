const { GoogleGenAI } =  require("@google/genai");

const ai = new GoogleGenAI({});

const generateAIContent = async (prompt) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      thinkingConfig: {
        thinkingBudget: 0,
      }
    },
  });
  return response.text;
};

module.exports = {
  generateAIContent,
};
