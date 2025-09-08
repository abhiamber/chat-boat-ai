
const input = document.getElementById("input")
input.addEventListener('keyup', handleListner)
const resource_btn = document.getElementById("resource_btn")
let isResouceButtonClicked = false;
resource_btn.addEventListener('click', ()=>{
    isResouceButtonClicked = !isResouceButtonClicked
    resource_btn.className = isResouceButtonClicked ? "bg-green-500 text-white ml-auto rounded-md p-2 m-4" : "bg-white text-black ml-auto rounded-md p-2 m-4"

})

const chatContainer = document.getElementById("chat-container")
const akhButton = document.getElementById("ask")
akhButton.addEventListener('click', handleAskBUttonClick)

const loading = document.createElement("div")
loading.className = "bg-white text-black px-4 rounded-lg rounded-br-none max-w-[70%] w-fit mr-auto animate-pulse"
loading.textContent = 'Thinking....'

const threadId = Date.now().toString(36) + Math.random().toString(36).substring(2,8)

function handleAskBUttonClick(e) {


    if (input?.value?.trim() == '') {
        return
    }
    generate(input.value)

}


function handleListner(e) {

    if (e.key == 'Enter') {

        if (input?.value?.trim() == '') {
            return
        }
        generate(input.value)
    }
}


async function generate(chat) {
    const questionMeessg = document.createElement("div")
    questionMeessg.className = "bg-green-500 text-white px-4 py-2 rounded-2xl rounded-br-none max-w-[70%] w-fit ml-auto"
    questionMeessg.textContent = chat

    chatContainer.appendChild(questionMeessg)
    input.value = ''
    try {
        chatContainer.appendChild(loading)
        await callServer(chat)

    } catch (error) {
    }
    loading.remove()
} 


async function callServer(inputText) {

    try {
        let response = await fetch('https://chat-boat-ai.onrender.com/chat', {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ message: inputText, threadId, isResouceButtonClicked })
        })

        let data = await response.json()
        const answerMeessg = document.createElement("div")
        answerMeessg.className = "flex justify-start bg-gray-200 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-none max-w-[70%] w-fit mr-auto"
        answerMeessg.textContent = data.result

        chatContainer.appendChild(answerMeessg)

    } catch (error) {
        console.log(error)
    }

}
