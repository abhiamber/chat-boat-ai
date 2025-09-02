"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCohereClient = void 0;
const cohere_ai_1 = require("cohere-ai");
const env_1 = require("@langchain/core/utils/env");
function getCohereClient(fields) {
    if (fields?.client) {
        return fields.client;
    }
    const apiKey = fields?.apiKey ?? (0, env_1.getEnvironmentVariable)("COHERE_API_KEY");
    if (!apiKey) {
        throw new Error("COHERE_API_KEY must be set");
    }
    return new cohere_ai_1.CohereClient({ token: apiKey });
}
exports.getCohereClient = getCohereClient;
