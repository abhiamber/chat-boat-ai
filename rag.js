require('dotenv').config();
const Groq = require("groq-sdk")
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const readLine = require("node:readline/promises")

const { tavily } = require("@tavily/core");

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const rl = readLine.createInterface({ input: process.stdin, output: process.stdout })
const { vectorStorefunc } = require("./prepare")

let messages = [
    {
        role: "system",
        content: `You are a smart personal assistant. 
You must answer user questions as accurately as possible.  

You have access to the following tools:
1. Relevant context provided from the user's query (use this first).  
2. webSearchWithTavily({query}) — use this only when the context does not contain enough information.  

Current date and time: ${new Date().toUTCString()}  

Important rules:  
- Prefer using the provided context.  
- Only call web search when the answer cannot be generated from context.  
- Keep responses clear, concise, and helpful.`
    }
];


async function main() {



    while (true) {

        const question = await rl.question('You:  ')

        if (question == 'bye') {
            break
        }

        const store = await vectorStorefunc();

        let relevantChunk = await store.similaritySearch(question, 3)
        const context = relevantChunk.map(chunk => chunk.pageContent).join('\n\n')
        const userQuery = `Question: ${question}
        Relevant context: ${context}
        Answer:`

        messages.push({
            role: "user",
            content: userQuery,
        },)
        while (true) {

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
                                    "description": "Search the latest information and real time data on the",
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
                    console.log(`Assitant: ${completion.choices[0]?.message?.content || {}}`);
                    break
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
    }

    rl.close()
}

main();


async function webSearchWithTavily({ query }) {
    console.log('web search calling')
    const response = await tvly.search(query);
    const finalResponse = response.results.map(result => result.content).join("\n\n")
    return finalResponse
}