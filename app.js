require('dotenv').config();
const Groq = require("groq-sdk")
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const readLine = require("node:readline/promises")

const { tavily } = require("@tavily/core");

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const rl = readLine.createInterface({ input: process.stdin, output: process.stdout })

let timeout ;

function closeTerminal (){
    timeout = setTimeout(() => {
        console.log("\n⏰ No response for 8 second. Closing...");
    
        rl.close();
        process.exit(0);
    }, 8000);
}
// process.stdin.on("data", (data) => {
//     console.log(data)
//     // closeTerminal();
//   });
async function main() {
    // closeTerminal()
    let messages = [
        {
            role: "system",
            content: `You are the smart personal assistant who answer the asked questions.
            You have access to follwing tools
            1. webSearchWithTavily({query}),
            current date and time: ${new Date().toUTCString()}
            only do web search when llm not able to generate data`,
        },

    ]




    while (true) {

        const question = await rl.question('You:  ')
        // clearTimeout(timeout)

        if (question == 'bye') {
            break
        }
        messages.push({
            role: "user",
            content: question,
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
                    // closeTerminal()
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