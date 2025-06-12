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
            description: 'Update an existing Tally form with comprehensive options including name, status, blocks, and settings',
            inputSchema: {
              type: 'object',
              properties: {
                formId: {
                  type: 'string',
                  description: 'The ID of the form to update',
                },
                name: {
                  type: 'string',
                  description: 'The name/title of the form',
                },
                status: {
                  type: 'string',
                  enum: ['BLANK', 'PUBLISHED', 'DRAFT'],
                  description: 'The status of the form',
                },
                blocks: {
                  type: 'array',
                  description: 'Array of form blocks/questions. Each block represents a form element like text input, multiple choice, etc. Use get_tally_block_types tool to see all available block types and their structures.',
                  items: {
                    type: 'object',
                    properties: {
                      uuid: { 
                        type: 'string',
                        description: 'Unique identifier for the block'
                      },
                      type: { 
                        type: 'string',
                        description: 'Type of block (e.g., "INPUT_TEXT", "INPUT_EMAIL", "INPUT_MULTIPLE_CHOICE", "INPUT_CHECKBOXES", "INPUT_DROPDOWN", "INPUT_PHONE", "INPUT_DATE", "INPUT_FILE_UPLOAD", "INPUT_RATING", "INPUT_RANKING", "INPUT_SIGNATURE", "INPUT_PAYMENT", "LAYOUT_QUESTION_GROUP", "LAYOUT_STATEMENT", "LAYOUT_DIVIDER", "LAYOUT_IMAGE", "LAYOUT_VIDEO", "LAYOUT_EMBED", "LOGIC_JUMP", "LOGIC_CALCULATOR", "HIDDEN_FIELD")'
                      },
                      groupUuid: { 
                        type: 'string',
                        description: 'UUID of the group this block belongs to (for grouped blocks)'
                      },
                      groupType: { 
                        type: 'string',
                        description: 'Type of group this block belongs to'
                      },
                      payload: { 
                        type: 'object',
                        description: 'Block-specific configuration and properties. Structure varies by block type - use get_tally_block_types for detailed schemas.'
                      }
                    },
                    required: ['uuid', 'type']
                  }
                },
                settings: {
                  type: 'object',
                  description: 'Form settings object',
                  properties: {
                    language: {
                      type: 'string',
                      description: 'Form language'
                    },
                    isClosed: {
                      type: 'boolean',
                      description: 'Whether the form is closed'
                    },
                    closeMessageTitle: {
                      type: 'string',
                      description: 'Title shown when form is closed'
                    },
                    closeMessageDescription: {
                      type: 'string',
                      description: 'Description shown when form is closed'
                    },
                    closeTimezone: {
                      type: 'string',
                      description: 'Timezone for form closing'
                    },
                    closeDate: {
                      type: 'string',
                      description: 'Date when form closes'
                    },
                    closeTime: {
                      type: 'string',
                      description: 'Time when form closes'
                    },
                    submissionsLimit: {
                      type: 'number',
                      description: 'Maximum number of submissions allowed'
                    },
                    uniqueSubmissionKey: {
                      type: 'string',
                      description: 'Unique key for submissions'
                    },
                    redirectOnCompletion: {
                      type: 'string',
                      description: 'URL to redirect to after form completion'
                    },
                    hasSelfEmailNotifications: {
                      type: 'boolean',
                      description: 'Enable email notifications to form owner'
                    },
                    selfEmailTo: {
                      type: 'string',
                      description: 'Email address for form owner notifications'
                    },
                    selfEmailReplyTo: {
                      type: 'string',
                      description: 'Reply-to email for owner notifications'
                    },
                    selfEmailSubject: {
                      type: 'string',
                      description: 'Subject line for owner notifications'
                    },
                    selfEmailFromName: {
                      type: 'string',
                      description: 'From name for owner notifications'
                    },
                    selfEmailBody: {
                      type: 'string',
                      description: 'Email body template for owner notifications'
                    },
                    hasRespondentEmailNotifications: {
                      type: 'boolean',
                      description: 'Enable email notifications to respondents'
                    },
                    respondentEmailTo: {
                      type: 'string',
                      description: 'Email field to send respondent notifications to'
                    },
                    respondentEmailReplyTo: {
                      type: 'string',
                      description: 'Reply-to email for respondent notifications'
                    },
                    respondentEmailSubject: {
                      type: 'string',
                      description: 'Subject line for respondent notifications'
                    },
                    respondentEmailFromName: {
                      type: 'string',
                      description: 'From name for respondent notifications'
                    },
                    respondentEmailBody: {
                      type: 'string',
                      description: 'Email body template for respondent notifications'
                    },
                    hasProgressBar: {
                      type: 'boolean',
                      description: 'Show progress bar in form'
                    },
                    hasPartialSubmissions: {
                      type: 'boolean',
                      description: 'Allow partial submissions'
                    },
                    pageAutoJump: {
                      type: 'boolean',
                      description: 'Auto-advance form pages'
                    },
                    saveForLater: {
                      type: 'boolean',
                      description: 'Allow saving form for later'
                    },
                    styles: {
                      type: 'string',
                      description: 'Custom CSS styles for the form'
                    },
                    password: {
                      type: 'string',
                      description: 'Password protection for the form'
                    },
                    submissionsDataRetentionDuration: {
                      type: 'number',
                      description: 'Data retention duration for submissions'
                    },
                    submissionsDataRetentionUnit: {
                      type: 'string',
                      description: 'Data retention unit (days, months, years)'
                    }
                  }
                }
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
          {
            name: 'update_form_status',
            description: 'Update the status of a form (BLANK, PUBLISHED, DRAFT)',
            inputSchema: {
              type: 'object',
              properties: {
                formId: {
                  type: 'string',
                  description: 'The ID of the form',
                },
                status: {
                  type: 'string',
                  enum: ['BLANK', 'PUBLISHED', 'DRAFT'],
                  description: 'The new status for the form',
                },
              },
              required: ['formId', 'status'],
            },
          },
          {
            name: 'update_form_settings',
            description: 'Update specific form settings like notifications, closing options, etc.',
            inputSchema: {
              type: 'object',
              properties: {
                formId: {
                  type: 'string',
                  description: 'The ID of the form',
                },
                isClosed: {
                  type: 'boolean',
                  description: 'Whether the form should be closed',
                },
                submissionsLimit: {
                  type: 'number',
                  description: 'Maximum number of submissions allowed',
                },
                redirectOnCompletion: {
                  type: 'string',
                  description: 'URL to redirect to after form completion',
                },
                hasProgressBar: {
                  type: 'boolean',
                  description: 'Show progress bar in form',
                },
                hasPartialSubmissions: {
                  type: 'boolean',
                  description: 'Allow partial submissions',
                },
                password: {
                  type: 'string',
                  description: 'Password protection for the form',
                },
              },
              required: ['formId'],
            },
          },
          {
            name: 'configure_form_notifications',
            description: 'Configure email notifications for form owner and respondents',
            inputSchema: {
              type: 'object',
              properties: {
                formId: {
                  type: 'string',
                  description: 'The ID of the form',
                },
                ownerNotifications: {
                  type: 'object',
                  properties: {
                    enabled: { type: 'boolean' },
                    emailTo: { type: 'string' },
                    replyTo: { type: 'string' },
                    subject: { type: 'string' },
                    fromName: { type: 'string' },
                    body: { type: 'string' }
                  },
                  description: 'Owner notification settings'
                },
                respondentNotifications: {
                  type: 'object',
                  properties: {
                    enabled: { type: 'boolean' },
                    emailTo: { type: 'string' },
                    replyTo: { type: 'string' },
                    subject: { type: 'string' },
                    fromName: { type: 'string' },
                    body: { type: 'string' }
                  },
                  description: 'Respondent notification settings'
                }
              },
              required: ['formId'],
            },
          },
          {
            name: 'get_tally_block_types',
            description: 'Get comprehensive information about all available Tally form block types and their structures for building forms',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'get_tally_form_templates',
            description: 'Get pre-built form templates for common use cases (contact forms, surveys, registration, feedback, etc.)',
            inputSchema: {
              type: 'object',
              properties: {
                templateType: {
                  type: 'string',
                  enum: ['contact', 'survey', 'registration', 'feedback', 'lead_generation', 'event_registration', 'job_application', 'newsletter_signup'],
                  description: 'Type of form template to retrieve',
                },
              },
              required: [],
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
            return await this.updateTallyForm(args as { formId: string; name?: string; status?: string; blocks?: any[]; settings?: any });
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
          case 'update_form_status':
            return await this.updateFormStatus(args as { formId: string; status: string });
          case 'update_form_settings':
            return await this.updateFormSettings(args as { formId: string; isClosed?: boolean; submissionsLimit?: number; redirectOnCompletion?: string; hasProgressBar?: boolean; hasPartialSubmissions?: boolean; password?: string });
          case 'configure_form_notifications':
            return await this.configureFormNotifications(args as { formId: string; ownerNotifications?: any; respondentNotifications?: any });
          case 'get_tally_block_types':
            return await this.getTallyBlockTypes();
          case 'get_tally_form_templates':
            return await this.getTallyFormTemplates(args as { templateType?: string });
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

  private async updateTallyForm(args: { formId: string; name?: string; status?: string; blocks?: any[]; settings?: any }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const updateData: any = {};
      if (args.name) updateData.name = args.name;
      if (args.status) updateData.status = args.status;
      if (args.blocks) updateData.blocks = args.blocks;
      if (args.settings) updateData.settings = args.settings;

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

  private async updateFormStatus(args: { formId: string; status: string }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const data = await this.makeRequest(`/forms/${args.formId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: args.status,
        }),
      });
      return {
        content: [
          {
            type: 'text',
            text: `Form status updated to ${args.status} successfully:\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating form status: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async updateFormSettings(args: { formId: string; isClosed?: boolean; submissionsLimit?: number; redirectOnCompletion?: string; hasProgressBar?: boolean; hasPartialSubmissions?: boolean; password?: string }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const settings: any = {};
      if (args.isClosed !== undefined) settings.isClosed = args.isClosed;
      if (args.submissionsLimit !== undefined) settings.submissionsLimit = args.submissionsLimit;
      if (args.redirectOnCompletion !== undefined) settings.redirectOnCompletion = args.redirectOnCompletion;
      if (args.hasProgressBar !== undefined) settings.hasProgressBar = args.hasProgressBar;
      if (args.hasPartialSubmissions !== undefined) settings.hasPartialSubmissions = args.hasPartialSubmissions;
      if (args.password !== undefined) settings.password = args.password;

      const data = await this.makeRequest(`/forms/${args.formId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          settings: settings,
        }),
      });
      return {
        content: [
          {
            type: 'text',
            text: `Form settings updated successfully:\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating form settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async configureFormNotifications(args: { formId: string; ownerNotifications?: any; respondentNotifications?: any }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const settings: any = {};
      
      if (args.ownerNotifications) {
        if (args.ownerNotifications.enabled !== undefined) settings.hasSelfEmailNotifications = args.ownerNotifications.enabled;
        if (args.ownerNotifications.emailTo) settings.selfEmailTo = args.ownerNotifications.emailTo;
        if (args.ownerNotifications.replyTo) settings.selfEmailReplyTo = args.ownerNotifications.replyTo;
        if (args.ownerNotifications.subject) settings.selfEmailSubject = args.ownerNotifications.subject;
        if (args.ownerNotifications.fromName) settings.selfEmailFromName = args.ownerNotifications.fromName;
        if (args.ownerNotifications.body) settings.selfEmailBody = args.ownerNotifications.body;
      }
      
      if (args.respondentNotifications) {
        if (args.respondentNotifications.enabled !== undefined) settings.hasRespondentEmailNotifications = args.respondentNotifications.enabled;
        if (args.respondentNotifications.emailTo) settings.respondentEmailTo = args.respondentNotifications.emailTo;
        if (args.respondentNotifications.replyTo) settings.respondentEmailReplyTo = args.respondentNotifications.replyTo;
        if (args.respondentNotifications.subject) settings.respondentEmailSubject = args.respondentNotifications.subject;
        if (args.respondentNotifications.fromName) settings.respondentEmailFromName = args.respondentNotifications.fromName;
        if (args.respondentNotifications.body) settings.respondentEmailBody = args.respondentNotifications.body;
      }

      const data = await this.makeRequest(`/forms/${args.formId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          settings: settings,
        }),
      });
      return {
        content: [
          {
            type: 'text',
            text: `Form notifications configured successfully:\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error configuring form notifications: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async getTallyBlockTypes(): Promise<{ content: Array<{ type: string; text: string }> }> {
    const blockTypes = {
      "INPUT_BLOCKS": {
        "INPUT_TEXT": {
          "description": "Single-line text input field",
          "payload": {
            "label": "string - Question text/label",
            "placeholder": "string - Placeholder text",
            "required": "boolean - Whether field is required",
            "description": "string - Help text under the field",
            "maxLength": "number - Maximum character limit",
            "format": "string - Text format validation (e.g., 'email', 'url')"
          }
        },
        "INPUT_TEXTAREA": {
          "description": "Multi-line text input field",
          "payload": {
            "label": "string - Question text/label",
            "placeholder": "string - Placeholder text",
            "required": "boolean - Whether field is required",
            "description": "string - Help text under the field",
            "maxLength": "number - Maximum character limit",
            "rows": "number - Number of text rows to display"
          }
        },
        "INPUT_EMAIL": {
          "description": "Email input field with validation",
          "payload": {
            "label": "string - Question text/label",
            "placeholder": "string - Placeholder text",
            "required": "boolean - Whether field is required",
            "description": "string - Help text under the field"
          }
        },
        "INPUT_PHONE": {
          "description": "Phone number input with country selection",
          "payload": {
            "label": "string - Question text/label",
            "placeholder": "string - Placeholder text",
            "required": "boolean - Whether field is required",
            "description": "string - Help text under the field",
            "defaultCountry": "string - Default country code (e.g., 'US', 'GB')"
          }
        },
        "INPUT_NUMBER": {
          "description": "Numeric input field",
          "payload": {
            "label": "string - Question text/label",
            "placeholder": "string - Placeholder text",
            "required": "boolean - Whether field is required",
            "description": "string - Help text under the field",
            "min": "number - Minimum value",
            "max": "number - Maximum value",
            "step": "number - Step increment"
          }
        },
        "INPUT_DATE": {
          "description": "Date picker input",
          "payload": {
            "label": "string - Question text/label",
            "required": "boolean - Whether field is required",
            "description": "string - Help text under the field",
            "dateFormat": "string - Date format (e.g., 'MM/DD/YYYY')",
            "minDate": "string - Minimum selectable date",
            "maxDate": "string - Maximum selectable date"
          }
        },
        "INPUT_TIME": {
          "description": "Time picker input",
          "payload": {
            "label": "string - Question text/label",
            "required": "boolean - Whether field is required",
            "description": "string - Help text under the field",
            "timeFormat": "string - Time format (12h or 24h)"
          }
        },
        "INPUT_MULTIPLE_CHOICE": {
          "description": "Single-select multiple choice question",
          "payload": {
            "label": "string - Question text/label",
            "required": "boolean - Whether field is required",
            "description": "string - Help text under the field",
            "randomize": "boolean - Randomize option order",
            "allowOther": "boolean - Allow 'Other' option with text input",
            "options": [
              {
                "uuid": "string - Unique option ID",
                "text": "string - Option display text",
                "value": "string - Option value when selected"
              }
            ]
          }
        },
        "INPUT_CHECKBOXES": {
          "description": "Multi-select checkboxes question",
          "payload": {
            "label": "string - Question text/label",
            "required": "boolean - Whether field is required",
            "description": "string - Help text under the field",
            "randomize": "boolean - Randomize option order",
            "allowOther": "boolean - Allow 'Other' option with text input",
            "minSelections": "number - Minimum required selections",
            "maxSelections": "number - Maximum allowed selections",
            "options": [
              {
                "uuid": "string - Unique option ID",
                "text": "string - Option display text",
                "value": "string - Option value when selected"
              }
            ]
          }
        },
        "INPUT_DROPDOWN": {
          "description": "Dropdown/select menu",
          "payload": {
            "label": "string - Question text/label",
            "required": "boolean - Whether field is required",
            "description": "string - Help text under the field",
            "placeholder": "string - Placeholder text for dropdown",
            "searchable": "boolean - Allow searching options",
            "options": [
              {
                "uuid": "string - Unique option ID",
                "text": "string - Option display text",
                "value": "string - Option value when selected"
              }
            ]
          }
        },
        "INPUT_RATING": {
          "description": "Star or numeric rating input",
          "payload": {
            "label": "string - Question text/label",
            "required": "boolean - Whether field is required",
            "description": "string - Help text under the field",
            "ratingType": "string - 'stars' or 'numbers'",
            "min": "number - Minimum rating value",
            "max": "number - Maximum rating value",
            "leftLabel": "string - Label for low end",
            "rightLabel": "string - Label for high end"
          }
        },
        "INPUT_RANKING": {
          "description": "Drag-and-drop ranking question",
          "payload": {
            "label": "string - Question text/label",
            "required": "boolean - Whether field is required",
            "description": "string - Help text under the field",
            "randomize": "boolean - Randomize initial order",
            "options": [
              {
                "uuid": "string - Unique option ID",
                "text": "string - Option display text",
                "value": "string - Option value"
              }
            ]
          }
        },
        "INPUT_FILE_UPLOAD": {
          "description": "File upload field",
          "payload": {
            "label": "string - Question text/label",
            "required": "boolean - Whether field is required",
            "description": "string - Help text under the field",
            "maxFiles": "number - Maximum number of files",
            "maxFileSize": "number - Maximum file size in MB",
            "allowedTypes": "array - Allowed file types (e.g., ['.pdf', '.jpg', '.png'])"
          }
        },
        "INPUT_SIGNATURE": {
          "description": "Digital signature input",
          "payload": {
            "label": "string - Question text/label",
            "required": "boolean - Whether field is required",
            "description": "string - Help text under the field"
          }
        },
        "INPUT_PAYMENT": {
          "description": "Payment processing field",
          "payload": {
            "label": "string - Question text/label",
            "required": "boolean - Whether field is required",
            "description": "string - Help text under the field",
            "currency": "string - Currency code (e.g., 'USD', 'EUR')",
            "amount": "number - Fixed amount or minimum amount",
            "allowCustomAmount": "boolean - Allow user to enter custom amount"
          }
        }
      },
      "LAYOUT_BLOCKS": {
        "LAYOUT_STATEMENT": {
          "description": "Text-only block for instructions or information",
          "payload": {
            "content": "string - Rich text content (supports HTML)",
            "fontSize": "string - Text size ('small', 'medium', 'large')",
            "textAlign": "string - Text alignment ('left', 'center', 'right')"
          }
        },
        "LAYOUT_QUESTION_GROUP": {
          "description": "Groups multiple questions together",
          "payload": {
            "title": "string - Group title",
            "description": "string - Group description",
            "layout": "string - Layout type ('vertical', 'horizontal')"
          }
        },
        "LAYOUT_DIVIDER": {
          "description": "Visual separator between sections",
          "payload": {
            "style": "string - Divider style ('line', 'space', 'pattern')",
            "thickness": "number - Divider thickness in pixels",
            "color": "string - Divider color (hex code)"
          }
        },
        "LAYOUT_IMAGE": {
          "description": "Image display block",
          "payload": {
            "src": "string - Image URL or file ID",
            "alt": "string - Alt text for accessibility",
            "width": "number - Image width",
            "height": "number - Image height",
            "alignment": "string - Image alignment ('left', 'center', 'right')"
          }
        },
        "LAYOUT_VIDEO": {
          "description": "Video embed block",
          "payload": {
            "src": "string - Video URL (YouTube, Vimeo, etc.)",
            "width": "number - Video width",
            "height": "number - Video height",
            "autoplay": "boolean - Auto-play video",
            "controls": "boolean - Show video controls"
          }
        },
        "LAYOUT_EMBED": {
          "description": "HTML/iframe embed block",
          "payload": {
            "content": "string - HTML content or iframe code",
            "height": "number - Embed height in pixels"
          }
        }
      },
      "LOGIC_BLOCKS": {
        "LOGIC_JUMP": {
          "description": "Conditional logic for form flow",
          "payload": {
            "conditions": [
              {
                "field": "string - Field UUID to check",
                "operator": "string - Comparison operator ('equals', 'contains', 'greater_than', etc.)",
                "value": "any - Value to compare against",
                "jumpTo": "string - Block UUID to jump to if condition is met"
              }
            ],
            "defaultJumpTo": "string - Default block UUID if no conditions are met"
          }
        },
        "LOGIC_CALCULATOR": {
          "description": "Calculation field based on other inputs",
          "payload": {
            "label": "string - Calculator label",
            "formula": "string - Calculation formula using field references",
            "displayFormat": "string - How to display the result",
            "precision": "number - Decimal places for result"
          }
        },
        "HIDDEN_FIELD": {
          "description": "Hidden field for storing data",
          "payload": {
            "name": "string - Field name",
            "value": "string - Hidden field value",
            "source": "string - Data source ('url_param', 'cookie', 'fixed')"
          }
        }
      }
    };

    return {
      content: [
        {
          type: 'text',
          text: `Comprehensive Tally Form Block Types Reference:

${JSON.stringify(blockTypes, null, 2)}

## Usage Instructions:

When creating or updating form blocks, use the structure:
{
  "uuid": "unique-block-id",
  "type": "BLOCK_TYPE_FROM_ABOVE",
  "groupUuid": "group-id-if-applicable", 
  "groupType": "group-type-if-applicable",
  "payload": {
    // Block-specific properties from the reference above
  }
}

## Examples:

### Text Input Block:
{
  "uuid": "text-block-1",
  "type": "INPUT_TEXT",
  "payload": {
    "label": "What is your name?",
    "placeholder": "Enter your full name",
    "required": true,
    "maxLength": 100
  }
}

### Multiple Choice Block:
{
  "uuid": "choice-block-1", 
  "type": "INPUT_MULTIPLE_CHOICE",
  "payload": {
    "label": "What is your favorite color?",
    "required": true,
    "options": [
      {"uuid": "opt-1", "text": "Red", "value": "red"},
      {"uuid": "opt-2", "text": "Blue", "value": "blue"},
      {"uuid": "opt-3", "text": "Green", "value": "green"}
    ]
  }
}

### Statement Block:
{
  "uuid": "statement-block-1",
  "type": "LAYOUT_STATEMENT", 
  "payload": {
    "content": "<h2>Welcome to our survey!</h2><p>Please fill out all required fields.</p>",
    "fontSize": "medium",
    "textAlign": "center"
  }
}

Use these block types when building or updating Tally forms to create rich, interactive form experiences.`,
        },
      ],
    };
  }

  private async getTallyFormTemplates(args: { templateType?: string }): Promise<{ content: Array<{ type: string; text: string }> }> {
    const templates = {
      contact: {
        name: "Contact Form",
        description: "Basic contact form with name, email, message",
        blocks: [
          {
            uuid: "welcome-statement",
            type: "LAYOUT_STATEMENT",
            payload: {
              content: "<h2>Contact Us</h2><p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>",
              fontSize: "medium",
              textAlign: "center"
            }
          },
          {
            uuid: "name-field",
            type: "INPUT_TEXT",
            payload: {
              label: "Full Name",
              placeholder: "Enter your full name",
              required: true,
              maxLength: 100
            }
          },
          {
            uuid: "email-field",
            type: "INPUT_EMAIL",
            payload: {
              label: "Email Address",
              placeholder: "your@email.com",
              required: true
            }
          },
          {
            uuid: "subject-field",
            type: "INPUT_TEXT",
            payload: {
              label: "Subject",
              placeholder: "What is this regarding?",
              required: true,
              maxLength: 200
            }
          },
          {
            uuid: "message-field",
            type: "INPUT_TEXTAREA",
            payload: {
              label: "Message",
              placeholder: "Tell us how we can help you...",
              required: true,
              maxLength: 1000,
              rows: 5
            }
          }
        ]
      },
      survey: {
        name: "Customer Satisfaction Survey",
        description: "Comprehensive customer feedback survey",
        blocks: [
          {
            uuid: "survey-intro",
            type: "LAYOUT_STATEMENT",
            payload: {
              content: "<h2>Customer Satisfaction Survey</h2><p>Your feedback helps us improve our products and services.</p>",
              fontSize: "medium",
              textAlign: "center"
            }
          },
          {
            uuid: "overall-rating",
            type: "INPUT_RATING",
            payload: {
              label: "How would you rate your overall experience?",
              required: true,
              ratingType: "stars",
              min: 1,
              max: 5,
              leftLabel: "Poor",
              rightLabel: "Excellent"
            }
          },
          {
            uuid: "service-quality",
            type: "INPUT_MULTIPLE_CHOICE",
            payload: {
              label: "How would you describe our service quality?",
              required: true,
              options: [
                { uuid: "excellent", text: "Excellent", value: "excellent" },
                { uuid: "good", text: "Good", value: "good" },
                { uuid: "average", text: "Average", value: "average" },
                { uuid: "poor", text: "Poor", value: "poor" }
              ]
            }
          },
          {
            uuid: "improvement-areas",
            type: "INPUT_CHECKBOXES",
            payload: {
              label: "Which areas could we improve? (Select all that apply)",
              required: false,
              allowOther: true,
              options: [
                { uuid: "speed", text: "Response time", value: "speed" },
                { uuid: "communication", text: "Communication", value: "communication" },
                { uuid: "pricing", text: "Pricing", value: "pricing" },
                { uuid: "features", text: "Product features", value: "features" }
              ]
            }
          },
          {
            uuid: "additional-comments",
            type: "INPUT_TEXTAREA",
            payload: {
              label: "Additional comments or suggestions",
              placeholder: "Tell us more about your experience...",
              required: false,
              maxLength: 500,
              rows: 4
            }
          }
        ]
      },
      newsletter_signup: {
        name: "Newsletter Signup",
        description: "Simple email newsletter subscription form",
        blocks: [
          {
            uuid: "newsletter-header",
            type: "LAYOUT_STATEMENT",
            payload: {
              content: "<h2>Stay Updated</h2><p>Subscribe to our newsletter for the latest updates, tips, and exclusive content.</p>",
              fontSize: "medium",
              textAlign: "center"
            }
          },
          {
            uuid: "subscriber-name",
            type: "INPUT_TEXT",
            payload: {
              label: "First Name",
              placeholder: "Enter your first name",
              required: true,
              maxLength: 50
            }
          },
          {
            uuid: "subscriber-email",
            type: "INPUT_EMAIL",
            payload: {
              label: "Email Address",
              placeholder: "your@email.com",
              required: true
            }
          },
          {
            uuid: "interests",
            type: "INPUT_CHECKBOXES",
            payload: {
              label: "What topics interest you? (Select all that apply)",
              required: false,
              options: [
                { uuid: "product-updates", text: "Product updates", value: "product-updates" },
                { uuid: "industry-news", text: "Industry news", value: "industry-news" },
                { uuid: "tips-tutorials", text: "Tips & tutorials", value: "tips-tutorials" },
                { uuid: "special-offers", text: "Special offers", value: "special-offers" }
              ]
            }
          }
        ]
      }
    };

    if (args.templateType && templates[args.templateType as keyof typeof templates]) {
      const template = templates[args.templateType as keyof typeof templates];
      return {
        content: [
          {
            type: 'text',
            text: `${template.name} Template:

${JSON.stringify(template, null, 2)}

## Usage:
Copy the blocks array from this template and use it in the update_tally_form tool's blocks parameter to create a form with this structure.

Example:
{
  "formId": "your-form-id",
  "name": "${template.name}",
  "status": "DRAFT", 
  "blocks": ${JSON.stringify(template.blocks, null, 2)}
}`,
          },
        ],
      };
    } else {
      // Return all available templates
      const templateList = Object.entries(templates).map(([key, template]) => ({
        type: key,
        name: template.name,
        description: template.description,
        blockCount: template.blocks.length
      }));

      return {
        content: [
          {
            type: 'text',
            text: `Available Tally Form Templates:

${JSON.stringify(templateList, null, 2)}

To get a specific template, call this tool again with the templateType parameter set to one of: ${Object.keys(templates).join(', ')}

Each template includes:
- Pre-configured form blocks with appropriate field types
- Proper validation and requirements
- Professional styling and layout
- Common use case patterns

These templates provide a starting point that you can customize by modifying the blocks, adding new fields, or adjusting settings to match specific requirements.`,
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