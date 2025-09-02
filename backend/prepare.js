require('dotenv').config();

const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');

const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

const { CohereEmbeddings } = require("@langchain/cohere");

const { Pinecone: PineconeClient } = require('@pinecone-database/pinecone');

const embeddings = new CohereEmbeddings({
    model: "embed-english-v3.0",
    apiKey: process.env.COHERE_EMBADING_MODEL_KEY
});

const { PineconeStore } = require("@langchain/pinecone");
const pinecone = new PineconeClient({ apiKey: process.env.PINCONE_KEY });

const pineconeIndex = pinecone.index(process.env.PINCONE_INEX_NAME)

async function vectorStorefunc() {
    const store = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        maxConcurrency: 5,
    });

    return store
}

async function indexTheDocument(filePath) {

    const loader = new PDFLoader(filePath, { splitPages: false });
    const document = await loader.load()
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    });

    let texts = await textSplitter.splitText(document?.[0].pageContent);
    const documents = texts.map((chunk) => {
        return { pageContent: chunk, metadata: document?.[0].metadata }
    })
    const store = await vectorStorefunc();

    await store.addDocuments(documents);

}

module.exports = { vectorStorefunc }

indexTheDocument("./signed_agreement_letter_10733.pdf")