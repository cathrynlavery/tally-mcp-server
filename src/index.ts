#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

class TallyMcpServer {
  private server: Server;
  private apiKey: string;
  private baseUrl = 'https://api.tally.so';

  constructor() {
    const apiKey = process.env.TALLY_API_KEY;
    if (!apiKey) {
      console.error('TALLY_API_KEY environment variable is required');
      process.exit(1);
    }
    this.apiKey = apiKey;

    this.server = new Server(
      {
        name: 'tally-mcp-server',
        version: '1.0.0',
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_tally_forms',
            description: 'Get list of Tally forms',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'create_tally_form',
            description: 'Create a new Tally form',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'The title of the form',
                },
                description: {
                  type: 'string',
                  description: 'The description of the form',
                },
              },
              required: ['title'],
            },
          },
          {
            name: 'get_tally_form',
            description: 'Get details of a specific Tally form',
            inputSchema: {
              type: 'object',
              properties: {
                formId: {
                  type: 'string',
                  description: 'The ID of the form to retrieve',
                },
              },
              required: ['formId'],
            },
          },
          {
            name: 'update_tally_form',
            description: 'Update an existing Tally form',
            inputSchema: {
              type: 'object',
              properties: {
                formId: {
                  type: 'string',
                  description: 'The ID of the form to update',
                },
                title: {
                  type: 'string',
                  description: 'The new title of the form',
                },
                description: {
                  type: 'string',
                  description: 'The new description of the form',
                },
              },
              required: ['formId'],
            },
          },
          {
            name: 'delete_tally_form',
            description: 'Delete a Tally form',
            inputSchema: {
              type: 'object',
              properties: {
                formId: {
                  type: 'string',
                  description: 'The ID of the form to delete',
                },
              },
              required: ['formId'],
            },
          },
          {
            name: 'get_form_submissions',
            description: 'Get list of submissions for a specific form',
            inputSchema: {
              type: 'object',
              properties: {
                formId: {
                  type: 'string',
                  description: 'The ID of the form',
                },
                limit: {
                  type: 'number',
                  description: 'Number of submissions to retrieve (default: 50)',
                },
                offset: {
                  type: 'number',
                  description: 'Offset for pagination (default: 0)',
                },
              },
              required: ['formId'],
            },
          },
          {
            name: 'get_form_submission',
            description: 'Get details of a specific form submission',
            inputSchema: {
              type: 'object',
              properties: {
                formId: {
                  type: 'string',
                  description: 'The ID of the form',
                },
                submissionId: {
                  type: 'string',
                  description: 'The ID of the submission',
                },
              },
              required: ['formId', 'submissionId'],
            },
          },
          {
            name: 'delete_form_submission',
            description: 'Delete a specific form submission',
            inputSchema: {
              type: 'object',
              properties: {
                formId: {
                  type: 'string',
                  description: 'The ID of the form',
                },
                submissionId: {
                  type: 'string',
                  description: 'The ID of the submission to delete',
                },
              },
              required: ['formId', 'submissionId'],
            },
          },
          {
            name: 'get_form_questions',
            description: 'Get list of questions for a specific form',
            inputSchema: {
              type: 'object',
              properties: {
                formId: {
                  type: 'string',
                  description: 'The ID of the form',
                },
              },
              required: ['formId'],
            },
          },
          {
            name: 'get_tally_webhooks',
            description: 'Get list of webhooks for a specific form',
            inputSchema: {
              type: 'object',
              properties: {
                formId: {
                  type: 'string',
                  description: 'The ID of the form',
                },
              },
              required: ['formId'],
            },
          },
          {
            name: 'create_tally_webhook',
            description: 'Create a new webhook for a form',
            inputSchema: {
              type: 'object',
              properties: {
                formId: {
                  type: 'string',
                  description: 'The ID of the form',
                },
                url: {
                  type: 'string',
                  description: 'The webhook URL endpoint',
                },
                events: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Array of events to subscribe to (e.g., ["form.response"])',
                },
              },
              required: ['formId', 'url', 'events'],
            },
          },
          {
            name: 'update_tally_webhook',
            description: 'Update an existing webhook',
            inputSchema: {
              type: 'object',
              properties: {
                formId: {
                  type: 'string',
                  description: 'The ID of the form',
                },
                webhookId: {
                  type: 'string',
                  description: 'The ID of the webhook to update',
                },
                url: {
                  type: 'string',
                  description: 'The new webhook URL endpoint',
                },
                events: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Array of events to subscribe to',
                },
              },
              required: ['formId', 'webhookId'],
            },
          },
          {
            name: 'delete_tally_webhook',
            description: 'Delete a webhook',
            inputSchema: {
              type: 'object',
              properties: {
                formId: {
                  type: 'string',
                  description: 'The ID of the form',
                },
                webhookId: {
                  type: 'string',
                  description: 'The ID of the webhook to delete',
                },
              },
              required: ['formId', 'webhookId'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_tally_forms':
            return await this.getTallyForms();
          case 'create_tally_form':
            return await this.createTallyForm(args as { title: string; description?: string });
          case 'get_tally_form':
            return await this.getTallyForm(args as { formId: string });
          case 'update_tally_form':
            return await this.updateTallyForm(args as { formId: string; title?: string; description?: string });
          case 'delete_tally_form':
            return await this.deleteTallyForm(args as { formId: string });
          case 'get_form_submissions':
            return await this.getFormSubmissions(args as { formId: string; limit?: number; offset?: number });
          case 'get_form_submission':
            return await this.getFormSubmission(args as { formId: string; submissionId: string });
          case 'delete_form_submission':
            return await this.deleteFormSubmission(args as { formId: string; submissionId: string });
          case 'get_form_questions':
            return await this.getFormQuestions(args as { formId: string });
          case 'get_tally_webhooks':
            return await this.getTallyWebhooks(args as { formId: string });
          case 'create_tally_webhook':
            return await this.createTallyWebhook(args as { formId: string; url: string; events: string[] });
          case 'update_tally_webhook':
            return await this.updateTallyWebhook(args as { formId: string; webhookId: string; url?: string; events?: string[] });
          case 'delete_tally_webhook':
            return await this.deleteTallyWebhook(args as { formId: string; webhookId: string });
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${errorMessage}`
        );
      }
    });
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private async getTallyForms(): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const data = await this.makeRequest('/forms');
      return {
        content: [
          {
            type: 'text',
            text: `Retrieved ${data.length || 0} forms:\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching forms: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async createTallyForm(args: { title: string; description?: string }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const data = await this.makeRequest('/forms', {
        method: 'POST',
        body: JSON.stringify({
          title: args.title,
          description: args.description || '',
        }),
      });
      return {
        content: [
          {
            type: 'text',
            text: `Form created successfully:\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating form: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async getTallyForm(args: { formId: string }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const data = await this.makeRequest(`/forms/${args.formId}`);
      return {
        content: [
          {
            type: 'text',
            text: `Form details:\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching form: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async updateTallyForm(args: { formId: string; title?: string; description?: string }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const updateData: any = {};
      if (args.title) updateData.title = args.title;
      if (args.description) updateData.description = args.description;

      const data = await this.makeRequest(`/forms/${args.formId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
      return {
        content: [
          {
            type: 'text',
            text: `Form updated successfully:\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating form: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async deleteTallyForm(args: { formId: string }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      await this.makeRequest(`/forms/${args.formId}`, {
        method: 'DELETE',
      });
      return {
        content: [
          {
            type: 'text',
            text: `Form ${args.formId} deleted successfully`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error deleting form: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async getFormSubmissions(args: { formId: string; limit?: number; offset?: number }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const params = new URLSearchParams();
      if (args.limit) params.append('limit', args.limit.toString());
      if (args.offset) params.append('offset', args.offset.toString());
      
      const queryString = params.toString();
      const endpoint = `/forms/${args.formId}/submissions${queryString ? `?${queryString}` : ''}`;
      
      const data = await this.makeRequest(endpoint);
      return {
        content: [
          {
            type: 'text',
            text: `Form submissions:\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching submissions: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async getFormSubmission(args: { formId: string; submissionId: string }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const data = await this.makeRequest(`/forms/${args.formId}/submissions/${args.submissionId}`);
      return {
        content: [
          {
            type: 'text',
            text: `Submission details:\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching submission: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async deleteFormSubmission(args: { formId: string; submissionId: string }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      await this.makeRequest(`/forms/${args.formId}/submissions/${args.submissionId}`, {
        method: 'DELETE',
      });
      return {
        content: [
          {
            type: 'text',
            text: `Submission ${args.submissionId} deleted successfully`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error deleting submission: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async getFormQuestions(args: { formId: string }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const data = await this.makeRequest(`/forms/${args.formId}/questions`);
      return {
        content: [
          {
            type: 'text',
            text: `Form questions:\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching questions: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async getTallyWebhooks(args: { formId: string }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const data = await this.makeRequest(`/forms/${args.formId}/webhooks`);
      return {
        content: [
          {
            type: 'text',
            text: `Webhooks:\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching webhooks: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async createTallyWebhook(args: { formId: string; url: string; events: string[] }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const data = await this.makeRequest(`/forms/${args.formId}/webhooks`, {
        method: 'POST',
        body: JSON.stringify({
          url: args.url,
          events: args.events,
        }),
      });
      return {
        content: [
          {
            type: 'text',
            text: `Webhook created successfully:\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async updateTallyWebhook(args: { formId: string; webhookId: string; url?: string; events?: string[] }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const updateData: any = {};
      if (args.url) updateData.url = args.url;
      if (args.events) updateData.events = args.events;

      const data = await this.makeRequest(`/forms/${args.formId}/webhooks/${args.webhookId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
      return {
        content: [
          {
            type: 'text',
            text: `Webhook updated successfully:\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async deleteTallyWebhook(args: { formId: string; webhookId: string }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      await this.makeRequest(`/forms/${args.formId}/webhooks/${args.webhookId}`, {
        method: 'DELETE',
      });
      return {
        content: [
          {
            type: 'text',
            text: `Webhook ${args.webhookId} deleted successfully`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error deleting webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Tally MCP server running on stdio');
  }
}

const server = new TallyMcpServer();
server.run().catch((error) => {
  console.error('Failed to run server:', error);
  process.exit(1);
}); 