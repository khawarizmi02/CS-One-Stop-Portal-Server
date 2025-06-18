import { Configuration, OpenAIApi } from "openai-edge";
import { Message } from "ai";

import { NextResponse } from "next/server";
import { OramaManager } from "@/lib/orama";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { env } from "@/env";

const FREE_CREDITS_PER_DAY = 10;

const config = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// Helper function to stream OpenAI responses
async function streamOpenAIResponse(
  response: Response,
  onCompletion?: () => Promise<void>,
) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No reader available");

  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode and process the chunk
          buffer += decoder.decode(value, { stream: true });

          // Process complete lines that start with "data: "
          let lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const json = JSON.parse(data);
                const text = json.choices[0]?.delta?.content || "";
                if (text) {
                  fullContent += text;
                  controller.enqueue(new TextEncoder().encode(text));
                }
              } catch (e) {
                // Just log the error and continue - don't let parsing errors stop the stream
                console.log(
                  "Error parsing JSON (can be ignored if stream is working): ",
                  (e as Error).message,
                );
              }
            }
          }
        }

        if (onCompletion) await onCompletion();
        controller.close();
      } catch (error) {
        console.error("Stream processing error:", error);
        controller.error(error);
      }
    },
  });
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatbotInteraction = await db.chatbotInteraction.findUnique({
      where: {
        userId,
      },
    });

    if (!chatbotInteraction) {
      await db.chatbotInteraction.create({
        data: {
          day: new Date().toDateString(),
          count: 1,
          userId,
        },
      });
    } else if (chatbotInteraction.count >= FREE_CREDITS_PER_DAY) {
      return NextResponse.json({ error: "Limit reached" }, { status: 429 });
    }

    const { messages, accountId } = await req.json();
    const oramaManager = new OramaManager(accountId);
    await oramaManager.initialize();

    const lastMessage = messages[messages.length - 1];

    const context = await oramaManager.vectorSearch({
      prompt: lastMessage.content,
    });
    console.log(context.hits.length + " hits found");

    console.log(
      "context",
      context.hits.map((hit) => hit.document),
    );

    const prompt = {
      role: "system",
      content: `You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.
            THE TIME NOW IS ${new Date().toLocaleString()}
      
      START CONTEXT BLOCK
      ${context.hits.map((hit) => JSON.stringify(hit.document)).join("\n")}
      END OF CONTEXT BLOCK
      
      When responding, please keep in mind:
      - Be helpful, clever, and articulate.
      - Rely on the provided email context to inform your responses.
      - If the context does not contain enough information to answer a question, politely say you don't have enough information.
      - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
      - Do not invent or speculate about anything that is not directly supported by the email context.
      - Keep your responses concise and relevant to the user's questions or the email being composed.
			- ***Do NOT use any Markdown or special formatting like asterisks (*), underscores (_), or backticks (\`). Output plain text only.***`,
    };

    const response = await openai.createChatCompletion({
      model: "o4-mini",
      messages: [
        prompt,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
      stream: true,
    });

    // Use our custom streaming function
    const stream = await streamOpenAIResponse(response, async () => {
      const today = new Date().toDateString();
      await db.chatbotInteraction.update({
        where: {
          userId,
        },
        data: {
          count: {
            increment: 1,
          },
        },
      });
    });

    // Set the appropriate headers for streaming
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
