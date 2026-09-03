import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();
app.use(express.json());

const server = new McpServer({
  name: "video-mcp-server",
  version: "1.0.0",
});

server.tool(
  "hello",
  "Returns a simple message",
  {},
  async () => ({
    content: [
      {
        type: "text",
        text: "Hello! Your MCP server is working.",
      },
    ],
  })
);

app.all("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  res.on("close", () => {
    transport.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "MCP server error",
      });
    }
  }
});

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "MCP server is running",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
