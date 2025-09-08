require('dotenv').config();
const Groq = require("groq-sdk")
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 60 * 60 * 24 });
const { vectorStorefunc } = require("./prepare")

const { tavily } = require("@tavily/core");

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

let baseMessage = [
    {
        role: "system",
        content: `
  You are a smart, reliable, and friendly personal assistant.  
  Your job is to provide accurate, concise, and helpful answers to the user.  
  
  ### Question Understanding
  - First, decide what type of question it is:  
    1. **Document-related** → requires information from the vector database (context chunks).  
    2. **General knowledge** → can be answered from your own reasoning.  
    3. **Real-time / latest info** → requires external web search.  
  
  ### Context
  - Use relevant details from the user's query first.  
  - Use memory and vector database only if the question is document-related.  
  - Current date and time: ${new Date().toUTCString()}  
  - Remember past conversation history to stay consistent.  
  
  ### Capabilities
  1. Always classify the question type before answering.  
  2. If it's document-related → rely on vector DB context.  
  3. If it's general knowledge → answer using reasoning.  
  4. If it's real-time → use external sources invisibly.  
  5. Present answers clearly in simple language.  
  6. Use formatting (Markdown: **bold**, lists, code blocks) when it improves clarity.  
  
  ### Behavior
  - Be conversational, respectful, and professional.  
  - Stay focused and avoid unnecessary text.  
  - If information is not found in reasoning, memory, or vector DB, say so honestly and then provide your best possible answer.  
  - Adjust tone: concise for quick answers, detailed when the user requests depth.  
  
  ### Restrictions
  - Never mention or display internal tools, databases, or their calls.  
  - Never invent facts or mislead the user.  
  - Keep reasoning invisible and provide only clear, final answers.  
  
  Your primary goal is to act as a **smart personal assistant** that classifies questions first,  
  then blends reasoning, memory, vector database knowledge, and (when needed) invisible external sources  
  to give the best possible response.
      `,
    },
];




async function generate({ question, threadId, isResouceButtonClicked }) {
    const store = await vectorStorefunc();


    let relevantChunk = await store.similaritySearch(question, 3)
    const context = relevantChunk.map(chunk => chunk.pageContent).join('\n\n')
    const userQuery = `Question: ${question}
        Relevant context: ${context}
        Answer:`



    const messages = myCache.get(threadId) ?? baseMessage



    messages.push({
        role: "user",
        content: isResouceButtonClicked ? userQuery : question,
    },)
    let toolAttempts = 0;
    const maxToolAttempts = 5;
    while (toolAttempts < maxToolAttempts) {
        toolAttempts++

        try {
            const completion = await groq.chat.completions
                .create({
                    temperature: 0,
                    model: "llama-3.3-70b-versatile",
                    messages: messages,
                    "tools": [
                        {
                            "type": "function",
                            "function": {
                                "name": "webSearchWithTavily",
                                "description": "Search the latest information and real time data on the internet",
                                "parameters": {
                                    "type": "object",
                                    "properties": {
                                        "query": {
                                            "type": "string",
                                            "description": "Search query to perform search on"
                                        },
                                    },
                                    "required": ["query"]
                                }
                            }
                        }
                    ],
                    "tool_choice": "auto"
                })

            const tool_calls = completion.choices[0]?.message.tool_calls
            if (!tool_calls) {
                myCache.set(threadId, messages)
                return `Assitant: ${completion.choices[0]?.message?.content || {}}`

            }
            messages.push(completion.choices[0]?.message ?? {})

            for (let tool of tool_calls) {
                if (tool?.function?.name == 'webSearchWithTavily') {
                    let data = await webSearchWithTavily(JSON.parse(tool?.function?.arguments, null, 2))
                    messages.push({
                        tool_call_id: tool.id,
                        role: 'tool',
                        name: tool.function.name,
                        content: data
                    })
                }
            }

        } catch (error) {
            console.log(error)
        }
    }

    return `Assistant: ${messages[messages.length - 1]?.content || "I wasn't able to get enough info."}`;

}





async function webSearchWithTavily({ query }) {
    console.log('web search calling')
    const response = await tvly.search(query);
    const finalResponse = response.results.map(result => result.content).join("\n\n")
    return finalResponse
}

module.exports = { generate }