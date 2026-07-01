import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "fs/promises";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

// ------------------------------------------------------------------
// Helper: filename → prompt name
// ------------------------------------------------------------------
function filenameToPromptName(filename: string): string {
  const stem = path.basename(filename, path.extname(filename));
  return stem.replace(/[-_]/g, " ");
}

// ------------------------------------------------------------------
// Main server
// ------------------------------------------------------------------
async function main() {

  const mcpServer = new McpServer(
    {
      name: "DynamicPromptsServer",
      version: "1.0.0",
    },
    {
      capabilities: {
        prompts: {},
        resources: {},
      },
    }
  );

  // Scan and register prompts
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const promptsDir = path.resolve(__dirname, "prompts");
  const allowedExtensions = new Set([".txt", ".md", ".yaml", ".yml", ".json"]);

  try {
    const files = await fs.readdir(promptsDir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!allowedExtensions.has(ext)) continue;

      const filePath = path.join(promptsDir, file);
      try {
        const content = await fs.readFile(filePath, "utf-8");
        const promptName = filenameToPromptName(file);

        mcpServer.registerPrompt(
          promptName,
          { description: `Loaded from ./prompts/${file}` },
          async () => ({
            messages: [
              {
                role: "assistant",
                content: { type: "text", text: content },
              },
            ],
          })
        );

        // ✅ MUST use console.error in stdio! console.log breaks the JSON-RPC stream.
        console.error(`✅ Registered prompt: "${promptName}"`);
      } catch (err) {
        console.error(`Failed to read ${filePath}:`, err);
      }
    }
  } catch {
    console.error(`⚠️ Prompts directory not found: ${promptsDir}. Continuing without prompts...`);
  }

  // Connect via standard input/output
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);

  console.error("🚀 MCP Prompts Server (stdio) is running and listening...");
}

main().catch((err) => {
  console.error("Fatal error in main:", err);
  process.exit(1);
});
