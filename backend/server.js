require('dotenv').config();
const express = require('express')
const app = express()
const port = process.env.PORT
const cors = require("cors")
const { generate } = require("./chat-boat.js")
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {

    res.send('Welcome to ChatDPT!')
})

app.post('/chat', async (req, res) => {
    try {
        const { message, threadId , isResouceButtonClicked} = req.body;
        if (!message || !threadId) {
            return res.status(400).json({ error: "Business validation error!" });
        }

        const result = await generate({question: message, threadId, isResouceButtonClicked});

        res.status(200).json({ success: true, result });
    } catch (err) {
        console.error("Error in /chat:", err);

        res.status(500).json({
            success: false,
            error: err.message || "Something went wrong",
        });
    }
});


app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})
