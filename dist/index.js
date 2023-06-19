#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const program = new commander_1.Command();
// talk to anything CLI
program.version("1.0.0").description("Mendable.ai CLI Tool");
program
    .command("ask <question>")
    .description("Ask a question to Mendable AI")
    .action((question) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const newConversationResponse = yield axios_1.default.post("https://api.mendable.ai/v0/newConversation", {
            api_key: process.env.MENDABLE_API_KEY,
        });
        const data = {
            api_key: process.env.MENDABLE_API_KEY,
            question,
            history: [],
            conversation_id: (_a = newConversationResponse.data) === null || _a === void 0 ? void 0 : _a.conversation_id,
            shouldStream: true,
        };
        const url = "https://api.mendable.ai/v0/mendableChat";
        // Make a POST request and stream the response
        const response = yield axios_1.default.post(url, data, {
            responseType: "stream",
            headers: {
                "Content-Type": "application/json",
                Accept: "text/event-stream",
            },
        });
        let answer = "";
        let dataBuffer = "";
        response.data.on("data", (chunk) => {
            dataBuffer += chunk.toString();
            let lineEndIndex;
            while ((lineEndIndex = dataBuffer.indexOf("\n")) !== -1) {
                const line = dataBuffer.slice(0, lineEndIndex + 1);
                dataBuffer = dataBuffer.slice(lineEndIndex + 1);
                if (line.startsWith("data:")) {
                    const jsonStr = line.slice(5).trim();
                    if (jsonStr) {
                        const parsedData = JSON.parse(jsonStr);
                        if ((parsedData === null || parsedData === void 0 ? void 0 : parsedData.chunk) !== "<|source|>" &&
                            (parsedData === null || parsedData === void 0 ? void 0 : parsedData.chunk) !== "<|message_id|>") {
                            answer += parsedData.chunk;
                            process.stdout.write(parsedData.chunk);
                        }
                    }
                }
            }
        });
        response.data.on("end", () => {
            console.log("Stream ended");
        });
    }
    catch (error) {
        console.error(`Error: ${error}`);
    }
}));
program
    .command("ingest <url> <type>")
    .description("Ingest data from a specific URL with a specified type into Mendable AI")
    .action((url, type) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        const response = yield axios_1.default.post("https://api.mendable.ai/v0/ingestData", {
            api_key: process.env.MENDABLE_API_KEY,
            url,
            type,
        });
        if ((_b = response.data) === null || _b === void 0 ? void 0 : _b.task_id) {
            const task_id = response.data.task_id;
            const interval = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
                var _d, _e;
                try {
                    const statusResponse = yield axios_1.default.post("https://api.mendable.ai/v0/ingestionStatus", {
                        task_id,
                    });
                    if (((_d = statusResponse.data) === null || _d === void 0 ? void 0 : _d.status) === "completed") {
                        clearInterval(interval);
                        console.log(`Ingestion completed.`);
                    }
                    else {
                        console.log(`Ingestion status: ${(_e = statusResponse.data) === null || _e === void 0 ? void 0 : _e.status}`);
                    }
                }
                catch (error) {
                    console.error(`Error: ${error}`);
                }
            }), 1000);
        }
        else {
            console.log(`Ingestion started: ${((_c = response.data) === null || _c === void 0 ? void 0 : _c.message) || "No response received"}`);
        }
    }
    catch (error) {
        console.error(`Error: ${error}`);
    }
}));
program.parse(process.argv);
