import { CohereClient } from "cohere-ai";
export type CohereClientOptions = {
    /**
     * The API key to use. Ignored if `client` is provided
     * @default {process.env.COHERE_API_KEY}
     */
    apiKey?: string;
    /**
     * The CohereClient instance to use. Superseeds `apiKey`
     */
    client?: CohereClient;
};
export declare function getCohereClient(fields?: CohereClientOptions): CohereClient;
