#!/usr/bin/env node

import { Command } from "commander";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const program = new Command();
// talk to anything CLI
program.version("0.0.1").description("Mendable.ai CLI Tool");

program
  .command("ask <question>")
  .description("Ask a question to Mendable AI")
  .action(async (question: string) => {
    try {
      const newConversationResponse = await axios.post(
        "https://api.mendable.ai/v0/newConversation",
        {
          api_key: process.env.MENDABLE_API_KEY,
        }
      );

      const data = {
        api_key: process.env.MENDABLE_API_KEY,
        question,
        history: [],
        conversation_id: newConversationResponse.data?.conversation_id,
        shouldStream: true,
      };
      const url = "https://api.mendable.ai/v0/mendableChat";
      // Make a POST request and stream the response
      const response = await axios.post(url, data, {
        responseType: "stream",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
      });

      let answer = "";
      let dataBuffer = "";

      response.data.on("data", (chunk: string) => {
        dataBuffer += chunk.toString();

        let lineEndIndex;
        while ((lineEndIndex = dataBuffer.indexOf("\n")) !== -1) {
          const line = dataBuffer.slice(0, lineEndIndex + 1);
          dataBuffer = dataBuffer.slice(lineEndIndex + 1);

          if (line.startsWith("data:")) {
            const jsonStr = line.slice(5).trim();
            if (jsonStr) {
              const parsedData = JSON.parse(jsonStr);
              if (
                parsedData?.chunk !== "<|source|>" &&
                parsedData?.chunk !== "<|message_id|>"
              ) {
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
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  });

program
  .command("ingest <url> <type>")
  .description(
    "Ingest data from a specific URL with a specified type into Mendable AI"
  )
  .action(async (url: string, type: string) => {
    try {
      const response = await axios.post(
        "https://api.mendable.ai/v0/ingestData",
        {
          api_key: process.env.MENDABLE_API_KEY,
          url,
          type,
        }
      );

      if (response.data?.task_id) {
        const task_id = response.data.task_id;
        const interval = setInterval(async () => {
          try {
            const statusResponse = await axios.post(
              "https://api.mendable.ai/v0/ingestionStatus",
              {
                task_id,
              }
            );

            if (statusResponse.data?.status === "completed") {
              clearInterval(interval);
              console.log(`Ingestion completed.`);
            } else {
              console.log(`Ingestion status: ${statusResponse.data?.status}`);
            }
          } catch (error) {
            console.error(`Error: ${error}`);
          }
        }, 2500);
      } else {
        console.log(
          `Ingestion started: ${
            response.data?.message || "No response received"
          }`
        );
      }
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  });

program.parse(process.argv);
