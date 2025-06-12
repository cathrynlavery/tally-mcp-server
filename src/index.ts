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
          {
            name: 'create_conditional_logic_block',
            description: 'Create properly structured conditional logic blocks with validation for form flow control',
            inputSchema: {
              type: 'object',
              properties: {
                triggerField: {
                  type: 'string',
                  description: 'UUID of the field that triggers the condition',
                },
                conditions: {
                  type: 'array',
                  description: 'Array of conditional rules',
                  items: {
                    type: 'object',
                    properties: {
                      operator: {
                        type: 'string',
                        enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'is_empty', 'is_not_empty', 'starts_with', 'ends_with'],
                        description: 'Comparison operator for the condition'
                      },
                      value: {
                        type: 'string',
                        description: 'Value to compare against (not needed for is_empty/is_not_empty)'
                      },
                      targetBlock: {
                        type: 'string',
                        description: 'UUID of block to jump to if condition is met'
                      }
                    },
                    required: ['operator', 'targetBlock']
                  }
                },
                defaultTarget: {
                  type: 'string',
                  description: 'UUID of block to jump to if no conditions are met'
                },
                logicType: {
                  type: 'string',
                  enum: ['simple_branch', 'multi_branch', 'progressive_disclosure', 'skip_logic'],
                  description: 'Type of conditional logic pattern'
                }
              },
              required: ['triggerField', 'conditions']
            },
          },
          {
            name: 'validate_form_logic_flow',
            description: 'Analyze and validate the logical flow of a form to identify potential issues or dead ends',
            inputSchema: {
              type: 'object',
              properties: {
                blocks: {
                  type: 'array',
                  description: 'Array of form blocks to analyze for logic flow',
                  items: {
                    type: 'object',
                    properties: {
                      uuid: { type: 'string' },
                      type: { type: 'string' },
                      payload: { type: 'object' }
                    },
                    required: ['uuid', 'type']
                  }
                }
              },
              required: ['blocks']
            },
          },
          {
            name: 'get_conditional_logic_templates',
            description: 'Get pre-built conditional logic templates for common scenarios like progressive disclosure, skip logic, and branching surveys',
            inputSchema: {
              type: 'object',
              properties: {
                templateType: {
                  type: 'string',
                  enum: ['simple_skip', 'progressive_disclosure', 'branching_survey', 'qualification_flow', 'feedback_routing', 'product_recommendation'],
                  description: 'Type of conditional logic template'
                }
              },
              required: []
            },
          },
          {
            name: 'validate_multiple_choice_logic',
            description: 'Validate conditional logic for multiple choice questions to prevent common errors like using "equals" instead of "contains"',
            inputSchema: {
              type: 'object',
              properties: {
                triggerQuestion: {
                  type: 'object',
                  properties: {
                    uuid: { type: 'string' },
                    type: { type: 'string' },
                    payload: { type: 'object' }
                  },
                  description: 'The multiple choice question that triggers conditional logic',
                  required: ['uuid', 'type', 'payload']
                },
                conditionalLogic: {
                  type: 'array',
                  description: 'Array of conditional logic blocks that reference the trigger question',
                  items: {
                    type: 'object',
                    properties: {
                      conditions: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            operator: { type: 'string' },
                            value: { type: 'string' },
                            targetBlock: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              },
              required: ['triggerQuestion', 'conditionalLogic']
            },
          },
          {
            name: 'create_dynamic_question_sets',
            description: 'Create questions with conditional option sets that change based on previous answers (like Q5/Q6 in complex surveys)',
            inputSchema: {
              type: 'object',
              properties: {
                questionLabel: {
                  type: 'string',
                  description: 'Base label for the question'
                },
                questionType: {
                  type: 'string',
                  enum: ['INPUT_MULTIPLE_CHOICE', 'INPUT_DROPDOWN', 'INPUT_CHECKBOXES'],
                  description: 'Type of input question'
                },
                triggerField: {
                  type: 'string',
                  description: 'UUID of the field that determines which option set to show'
                },
                conditionalOptionSets: {
                  type: 'array',
                  description: 'Different option sets to show based on trigger field values',
                  items: {
                    type: 'object',
                    properties: {
                      triggerValue: {
                        type: 'string',
                        description: 'Value from trigger field that activates this option set'
                      },
                      questionSuffix: {
                        type: 'string',
                        description: 'Additional text to append to question label for this condition'
                      },
                      options: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            text: { type: 'string' },
                            value: { type: 'string' }
                          },
                          required: ['text', 'value']
                        }
                      }
                    },
                    required: ['triggerValue', 'options']
                  }
                }
              },
              required: ['questionLabel', 'questionType', 'triggerField', 'conditionalOptionSets']
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
          case 'create_conditional_logic_block':
            return await this.createConditionalLogicBlock(args as { triggerField: string; conditions: any[]; defaultTarget: string; logicType: string });
          case 'validate_form_logic_flow':
            return await this.validateFormLogicFlow(args as { blocks: any[] });
          case 'get_conditional_logic_templates':
            return await this.getConditionalLogicTemplates(args as { templateType?: string });
          case 'validate_multiple_choice_logic':
            return await this.validateMultipleChoiceLogic(args as { triggerQuestion: any; conditionalLogic: any[] });
          case 'create_dynamic_question_sets':
            return await this.createDynamicQuestionSets(args as { questionLabel: string; questionType: string; triggerField: string; conditionalOptionSets: any[] });
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

  private async createConditionalLogicBlock(args: { triggerField: string; conditions: any[]; defaultTarget?: string; logicType?: string }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      // Generate a unique UUID for the logic block
      const logicBlockUuid = `logic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Validate conditions
      for (const condition of args.conditions) {
        if (!condition.operator || !condition.targetBlock) {
          throw new Error('Each condition must have an operator and targetBlock');
        }
        
        // Check if value is required for the operator
        const noValueOperators = ['is_empty', 'is_not_empty'];
        if (!noValueOperators.includes(condition.operator) && !condition.value) {
          throw new Error(`Value is required for operator '${condition.operator}'`);
        }
      }

      const logicBlock = {
        uuid: logicBlockUuid,
        type: 'LOGIC_JUMP',
        payload: {
          triggerField: args.triggerField,
          conditions: args.conditions.map(condition => ({
            field: args.triggerField,
            operator: condition.operator,
            value: condition.value,
            jumpTo: condition.targetBlock
          })),
          defaultJumpTo: args.defaultTarget || null,
          logicType: args.logicType || 'simple_branch'
        }
      };

      return {
        content: [
          {
            type: 'text',
            text: `Conditional Logic Block Created Successfully:

${JSON.stringify(logicBlock, null, 2)}

## How to Use:
1. Add this block to your form's blocks array
2. Place it after the trigger field (${args.triggerField})
3. Ensure all target blocks exist in your form
4. Test the logic flow using validate_form_logic_flow tool

## Logic Flow:
- Trigger Field: ${args.triggerField}
- Logic Type: ${args.logicType || 'simple_branch'}
- Conditions: ${args.conditions.length}
- Default Target: ${args.defaultTarget || 'Next sequential block'}

This block will evaluate conditions when the trigger field changes and redirect users to appropriate sections of your form.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating conditional logic block: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async validateFormLogicFlow(args: { blocks: any[] }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const issues: string[] = [];
      const warnings: string[] = [];
      const blockMap = new Map();
      const logicBlocks: any[] = [];
      const inputBlocks: any[] = [];

      // Build block map and categorize blocks
      for (const block of args.blocks) {
        blockMap.set(block.uuid, block);
        if (block.type === 'LOGIC_JUMP') {
          logicBlocks.push(block);
        } else if (block.type.startsWith('INPUT_')) {
          inputBlocks.push(block);
        }
      }

      // Validate logic blocks
      for (const logicBlock of logicBlocks) {
        const payload = logicBlock.payload;
        
        // Check if trigger field exists
        if (payload.triggerField && !blockMap.has(payload.triggerField)) {
          issues.push(`Logic block ${logicBlock.uuid} references non-existent trigger field: ${payload.triggerField}`);
        }

        // Check conditions
        if (payload.conditions) {
          for (const condition of payload.conditions) {
            if (condition.jumpTo && !blockMap.has(condition.jumpTo)) {
              issues.push(`Logic block ${logicBlock.uuid} has condition jumping to non-existent block: ${condition.jumpTo}`);
            }
          }
        }

        // Check default jump target
        if (payload.defaultJumpTo && !blockMap.has(payload.defaultJumpTo)) {
          issues.push(`Logic block ${logicBlock.uuid} has default jump to non-existent block: ${payload.defaultJumpTo}`);
        }
      }

      // Check for unreachable blocks
      const reachableBlocks = new Set();
      const startBlock = args.blocks[0];
      if (startBlock) {
        const traverseBlocks = (blockUuid: string, visited: Set<string> = new Set()) => {
          if (visited.has(blockUuid) || !blockMap.has(blockUuid)) return;
          
          visited.add(blockUuid);
          reachableBlocks.add(blockUuid);
          
          const block = blockMap.get(blockUuid);
          if (block.type === 'LOGIC_JUMP' && block.payload.conditions) {
            for (const condition of block.payload.conditions) {
              if (condition.jumpTo) {
                traverseBlocks(condition.jumpTo, visited);
              }
            }
            if (block.payload.defaultJumpTo) {
              traverseBlocks(block.payload.defaultJumpTo, visited);
            }
          }
        };

        traverseBlocks(startBlock.uuid);
      }

      // Find unreachable blocks
      for (const block of args.blocks) {
        if (!reachableBlocks.has(block.uuid) && block !== startBlock) {
          warnings.push(`Block ${block.uuid} (${block.type}) may be unreachable`);
        }
      }

      // Check for circular logic
      const detectCircularLogic = () => {
        for (const logicBlock of logicBlocks) {
          const visited = new Set();
          const checkCircular = (blockUuid: string): boolean => {
            if (visited.has(blockUuid)) return true;
            visited.add(blockUuid);
            
            const block = blockMap.get(blockUuid);
            if (block && block.type === 'LOGIC_JUMP' && block.payload.conditions) {
              for (const condition of block.payload.conditions) {
                if (condition.jumpTo && checkCircular(condition.jumpTo)) {
                  return true;
                }
              }
            }
            return false;
          };
          
          if (checkCircular(logicBlock.uuid)) {
            warnings.push(`Potential circular logic detected starting from block ${logicBlock.uuid}`);
          }
        }
      };

      detectCircularLogic();

      const validationResult = {
        status: issues.length === 0 ? 'VALID' : 'INVALID',
        totalBlocks: args.blocks.length,
        inputBlocks: inputBlocks.length,
        logicBlocks: logicBlocks.length,
        reachableBlocks: reachableBlocks.size,
        issues: issues,
        warnings: warnings,
        recommendations: [
          'Test all conditional paths with different input combinations',
          'Ensure all logic blocks have appropriate default targets',
          'Consider adding confirmation steps before critical logic branches',
          'Use descriptive block UUIDs for easier debugging'
        ]
      };

      return {
        content: [
          {
            type: 'text',
            text: `Form Logic Flow Validation Results:

${JSON.stringify(validationResult, null, 2)}

## Summary:
- Form Status: ${validationResult.status}
- Total Blocks: ${validationResult.totalBlocks}
- Logic Blocks: ${validationResult.logicBlocks}
- Issues Found: ${issues.length}
- Warnings: ${warnings.length}

${issues.length > 0 ? '⚠️ Critical Issues:\n' + issues.map(issue => `- ${issue}`).join('\n') + '\n' : '✅ No critical issues found\n'}

${warnings.length > 0 ? '⚠️ Warnings:\n' + warnings.map(warning => `- ${warning}`).join('\n') + '\n' : ''}

## Recommendations:
${validationResult.recommendations.map(rec => `- ${rec}`).join('\n')}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error validating form logic flow: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async getConditionalLogicTemplates(args: { templateType?: string }): Promise<{ content: Array<{ type: string; text: string }> }> {
    const templates = {
      simple_skip: {
        name: "Simple Skip Logic",
        description: "Skip sections based on yes/no answers",
        example: {
          triggerField: "has-experience-uuid",
          conditions: [
            {
              operator: "equals",
              value: "no",
              targetBlock: "beginner-section-uuid"
            },
            {
              operator: "equals", 
              value: "yes",
              targetBlock: "advanced-section-uuid"
            }
          ],
          defaultTarget: "general-section-uuid",
          logicType: "simple_branch",
          useCase: "Skip beginner questions for experienced users"
        }
      },
      progressive_disclosure: {
        name: "Progressive Disclosure",
        description: "Show additional questions based on previous answers",
        example: {
          triggerField: "interest-level-uuid",
          conditions: [
            {
              operator: "equals",
              value: "very-interested",
              targetBlock: "detailed-questions-uuid"
            },
            {
              operator: "equals",
              value: "somewhat-interested", 
              targetBlock: "basic-questions-uuid"
            }
          ],
          defaultTarget: "thank-you-uuid",
          logicType: "progressive_disclosure",
          useCase: "Show more detailed questions only to highly interested users"
        }
      },
      branching_survey: {
        name: "Branching Survey",
        description: "Different question paths based on user type",
        example: {
          triggerField: "user-type-uuid",
          conditions: [
            {
              operator: "equals",
              value: "customer",
              targetBlock: "customer-feedback-uuid"
            },
            {
              operator: "equals",
              value: "prospect",
              targetBlock: "lead-qualification-uuid"
            },
            {
              operator: "equals",
              value: "partner",
              targetBlock: "partnership-questions-uuid"
            }
          ],
          defaultTarget: "general-feedback-uuid",
          logicType: "multi_branch",
          useCase: "Route users to different question sets based on their relationship type"
        }
      },
      qualification_flow: {
        name: "Qualification Flow",
        description: "Determine user eligibility and route accordingly",
        example: {
          triggerField: "budget-range-uuid",
          conditions: [
            {
              operator: "greater_equal",
              value: "10000",
              targetBlock: "enterprise-questions-uuid"
            },
            {
              operator: "greater_equal",
              value: "1000",
              targetBlock: "professional-questions-uuid"
            }
          ],
          defaultTarget: "basic-plan-questions-uuid",
          logicType: "qualification_flow",
          useCase: "Route users to appropriate pricing tiers based on budget"
        }
      },
      feedback_routing: {
        name: "Feedback Routing",
        description: "Route feedback to appropriate departments",
        example: {
          triggerField: "feedback-category-uuid",
          conditions: [
            {
              operator: "equals",
              value: "technical-issue",
              targetBlock: "technical-details-uuid"
            },
            {
              operator: "equals",
              value: "billing-question",
              targetBlock: "billing-details-uuid"
            },
            {
              operator: "equals",
              value: "feature-request",
              targetBlock: "feature-details-uuid"
            }
          ],
          defaultTarget: "general-feedback-uuid",
          logicType: "feedback_routing",
          useCase: "Collect specific information based on feedback type"
        }
      },
      product_recommendation: {
        name: "Product Recommendation",
        description: "Recommend products based on user needs",
        example: {
          triggerField: "company-size-uuid",
          conditions: [
            {
              operator: "equals",
              value: "1-10",
              targetBlock: "startup-products-uuid"
            },
            {
              operator: "equals",
              value: "11-100",
              targetBlock: "smb-products-uuid"
            },
            {
              operator: "contains",
              value: "100+",
              targetBlock: "enterprise-products-uuid"
            }
          ],
          defaultTarget: "general-products-uuid",
          logicType: "product_recommendation",
          useCase: "Show relevant products based on company size"
        }
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

## Implementation Steps:
1. Use create_conditional_logic_block with these parameters:
   - triggerField: "${template.example.triggerField}"
   - conditions: ${JSON.stringify(template.example.conditions, null, 2)}
   - defaultTarget: "${template.example.defaultTarget}"
   - logicType: "${template.example.logicType}"

2. Ensure all referenced blocks exist in your form
3. Place the logic block after the trigger field
4. Test the flow with validate_form_logic_flow

## Use Case:
${template.example.useCase}

This template provides a proven pattern for ${template.description.toLowerCase()}.`,
          },
        ],
      };
    } else {
      const templateList = Object.entries(templates).map(([key, template]) => ({
        type: key,
        name: template.name,
        description: template.description,
        useCase: template.example.useCase
      }));

      return {
        content: [
          {
            type: 'text',
            text: `Available Conditional Logic Templates:

${JSON.stringify(templateList, null, 2)}

## Template Categories:

### Basic Logic:
- **simple_skip**: Basic yes/no branching
- **progressive_disclosure**: Show more questions based on interest

### Advanced Logic:
- **branching_survey**: Multiple paths based on user type
- **qualification_flow**: Route based on eligibility criteria
- **feedback_routing**: Department-specific question flows
- **product_recommendation**: Personalized product suggestions

To get a specific template, call this tool with templateType parameter set to one of: ${Object.keys(templates).join(', ')}

Each template includes:
- Complete conditional logic structure
- Real-world use case examples
- Implementation instructions
- Best practice recommendations

Use these templates as starting points for building sophisticated form logic that adapts to user responses.`,
          },
        ],
      };
    }
  }

  private async validateMultipleChoiceLogic(args: { triggerQuestion: any; conditionalLogic: any[] }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const issues: string[] = [];
      const warnings: string[] = [];
      const recommendations: string[] = [];
      
      // Check if trigger question is actually multiple choice
      const isMultipleChoice = ['INPUT_MULTIPLE_CHOICE', 'INPUT_CHECKBOXES'].includes(args.triggerQuestion.type);
      const allowsMultipleSelections = args.triggerQuestion.type === 'INPUT_CHECKBOXES' || 
        (args.triggerQuestion.type === 'INPUT_MULTIPLE_CHOICE' && args.triggerQuestion.payload?.maxSelections > 1);

      if (!isMultipleChoice) {
        warnings.push(`Question type ${args.triggerQuestion.type} is not a multiple choice question. This validation is intended for multiple choice questions.`);
      }

      // Analyze each conditional logic block
      for (let i = 0; i < args.conditionalLogic.length; i++) {
        const logicBlock = args.conditionalLogic[i];
        
        if (!logicBlock.conditions || !Array.isArray(logicBlock.conditions)) {
          issues.push(`Logic block ${i + 1} is missing conditions array`);
          continue;
        }

        for (let j = 0; j < logicBlock.conditions.length; j++) {
          const condition = logicBlock.conditions[j];
          
          // CRITICAL CHECK: equals vs contains for multiple choice
          if (condition.operator === 'equals' && isMultipleChoice) {
            if (allowsMultipleSelections) {
              issues.push(`🚨 CRITICAL ERROR - Logic block ${i + 1}, condition ${j + 1}: Using "equals" operator with multiple choice question that allows multiple selections. This will fail when users select multiple options. Use "contains" instead.`);
            } else {
              warnings.push(`Logic block ${i + 1}, condition ${j + 1}: Using "equals" with single-select multiple choice. Consider "contains" for consistency and future-proofing.`);
            }
          }

          // Check for proper multiple choice operators
          const multipleChoiceOperators = ['contains', 'not_contains'];
          const singleValueOperators = ['equals', 'not_equals'];
          
          if (isMultipleChoice && singleValueOperators.includes(condition.operator)) {
            if (allowsMultipleSelections) {
              issues.push(`Logic block ${i + 1}, condition ${j + 1}: Operator "${condition.operator}" is incompatible with multiple selection questions. Use "contains" or "not_contains".`);
            }
          }

          // Validate condition structure
          if (!condition.value && !['is_empty', 'is_not_empty'].includes(condition.operator)) {
            issues.push(`Logic block ${i + 1}, condition ${j + 1}: Missing value for operator "${condition.operator}"`);
          }

          if (!condition.targetBlock) {
            issues.push(`Logic block ${i + 1}, condition ${j + 1}: Missing targetBlock`);
          }

          // Check if value matches available options
          if (condition.value && args.triggerQuestion.payload?.options) {
            const optionValues = args.triggerQuestion.payload.options.map((opt: any) => opt.value || opt.text);
            if (!optionValues.includes(condition.value)) {
              warnings.push(`Logic block ${i + 1}, condition ${j + 1}: Value "${condition.value}" does not match any available options: [${optionValues.join(', ')}]`);
            }
          }
        }
      }

      // Generate recommendations based on findings
      if (isMultipleChoice && allowsMultipleSelections) {
        recommendations.push('✅ For multiple selection questions, always use "contains" operator');
        recommendations.push('✅ Test with users selecting 1, 2, and maximum number of options');
        recommendations.push('✅ Consider using "not_contains" for exclusion logic');
      }

      if (args.triggerQuestion.payload?.options?.length > 5) {
        recommendations.push('⚠️ Question has many options - consider grouping similar conditions');
      }

      recommendations.push('🧪 Test all conditional paths thoroughly');
      recommendations.push('📱 Verify logic works correctly on mobile devices');

      const validationResult = {
        status: issues.length === 0 ? 'VALID' : 'INVALID',
        triggerQuestion: {
          uuid: args.triggerQuestion.uuid,
          type: args.triggerQuestion.type,
          allowsMultipleSelections: allowsMultipleSelections,
          optionCount: args.triggerQuestion.payload?.options?.length || 0
        },
        logicBlocks: args.conditionalLogic.length,
        totalConditions: args.conditionalLogic.reduce((sum, block) => sum + (block.conditions?.length || 0), 0),
        issues: issues,
        warnings: warnings,
        recommendations: recommendations
      };

      return {
        content: [
          {
            type: 'text',
            text: `Multiple Choice Logic Validation Results:

${JSON.stringify(validationResult, null, 2)}

## Summary:
- Validation Status: ${validationResult.status}
- Question Type: ${args.triggerQuestion.type}
- Allows Multiple Selections: ${allowsMultipleSelections}
- Logic Blocks: ${validationResult.logicBlocks}
- Total Conditions: ${validationResult.totalConditions}
- Critical Issues: ${issues.length}
- Warnings: ${warnings.length}

${issues.length > 0 ? '🚨 CRITICAL ISSUES (Will Break Survey):\n' + issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n') + '\n' : ''}

${warnings.length > 0 ? '⚠️ WARNINGS:\n' + warnings.map((warning, i) => `${i + 1}. ${warning}`).join('\n') + '\n' : ''}

## Recommendations:
${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

${issues.length === 0 ? '✅ Logic validation passed! Your conditional logic should work correctly with multiple choice questions.' : '❌ Fix critical issues before deploying to prevent survey failures.'}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error validating multiple choice logic: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async createDynamicQuestionSets(args: { questionLabel: string; questionType: string; triggerField: string; conditionalOptionSets: any[] }): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const questionBlocks: any[] = [];
      const logicBlocks: any[] = [];
      
      // Validate input
      if (!args.conditionalOptionSets || args.conditionalOptionSets.length === 0) {
        throw new Error('At least one conditional option set is required');
      }

      // Generate base question UUID
      const baseQuestionUuid = `dynamic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a question block for each conditional option set
      for (let i = 0; i < args.conditionalOptionSets.length; i++) {
        const optionSet = args.conditionalOptionSets[i];
        const questionUuid = i === 0 ? baseQuestionUuid : `${baseQuestionUuid}-variant-${i + 1}`;
        
        // Validate option set structure
        if (!optionSet.triggerValue) {
          throw new Error(`Option set ${i + 1} is missing triggerValue`);
        }
        
        if (!optionSet.options || !Array.isArray(optionSet.options) || optionSet.options.length === 0) {
          throw new Error(`Option set ${i + 1} is missing options array`);
        }

        // Generate options with UUIDs
        const processedOptions = optionSet.options.map((option: any, optIndex: number) => ({
          uuid: `${questionUuid}-opt-${optIndex + 1}`,
          text: option.text,
          value: option.value || option.text.toLowerCase().replace(/\s+/g, '-')
        }));

        // Create the question block
        const questionBlock = {
          uuid: questionUuid,
          type: args.questionType,
          payload: {
            label: optionSet.questionSuffix ? 
              `${args.questionLabel}${optionSet.questionSuffix}` : 
              args.questionLabel,
            required: true,
            options: processedOptions,
            // Add metadata for dynamic question management
            dynamicContext: {
              baseQuestion: baseQuestionUuid,
              triggerField: args.triggerField,
              triggerValue: optionSet.triggerValue,
              variantIndex: i
            }
          }
        };

        questionBlocks.push(questionBlock);

        // Create logic block to show this question variant
        if (i > 0) { // First variant is default, others need logic
          const logicBlockUuid = `logic-${questionUuid}`;
          const logicBlock = {
            uuid: logicBlockUuid,
            type: 'LOGIC_JUMP',
            payload: {
              triggerField: args.triggerField,
              conditions: [
                {
                  field: args.triggerField,
                  operator: 'contains', // Use contains for multiple choice compatibility
                  value: optionSet.triggerValue,
                  jumpTo: questionUuid
                }
              ],
              logicType: 'dynamic_question_routing',
              questionContext: {
                baseQuestion: baseQuestionUuid,
                variant: i + 1
              }
            }
          };
          
          logicBlocks.push(logicBlock);
        }
      }

      // Generate implementation instructions
      const implementationSteps = [
        '1. Add all question blocks to your form in sequence',
        '2. Place logic blocks immediately after the trigger field',
        '3. Set the first question variant as visible by default',
        '4. Hide other variants initially (they\'ll be shown by logic)',
        '5. Test with different trigger field selections',
        '6. Validate using validate_multiple_choice_logic tool'
      ];

      // Generate BestSelf survey specific example
      const bestSelfExample = {
        description: 'Example implementation for BestSelf Q5 Priority Challenge question',
        triggerField: 'q4-priorities-uuid',
        questionLabel: 'What\'s your main challenge in this area?',
        implementation: {
          'Personal productivity': {
            options: [
              'Difficulty executing on ideas',
              'Feeling overwhelmed by tasks',
              'Struggling to complete projects',
              'Poor time management',
              'Can\'t prioritize effectively'
            ]
          },
          'Relationships': {
            options: [
              'Finding quality time with loved ones',
              'Staying present during conversations',
              'Communication difficulties',
              'Feeling disconnected from partner/friends'
            ]
          }
        }
      };

      const result = {
        success: true,
        totalQuestionBlocks: questionBlocks.length,
        totalLogicBlocks: logicBlocks.length,
        baseQuestionUuid: baseQuestionUuid,
        questionBlocks: questionBlocks,
        logicBlocks: logicBlocks,
        implementationSteps: implementationSteps,
        bestSelfExample: bestSelfExample,
        criticalNotes: [
          '⚠️ Use "contains" operator in logic blocks for multiple choice compatibility',
          '⚠️ Test with users selecting different combinations from trigger field',
          '⚠️ Ensure all question variants have consistent structure for data analysis',
          '⚠️ Consider question length - multiple variants can make surveys long'
        ]
      };

      return {
        content: [
          {
            type: 'text',
            text: `Dynamic Question Set Created Successfully:

${JSON.stringify(result, null, 2)}

## Implementation Guide:

### Question Blocks (${questionBlocks.length} total):
${questionBlocks.map((block, i) => `
**Variant ${i + 1}**: ${block.uuid}
- Trigger Value: "${args.conditionalOptionSets[i].triggerValue}"
- Options: ${block.payload.options.length}
- Label: "${block.payload.label}"`).join('')}

### Logic Blocks (${logicBlocks.length} total):
${logicBlocks.map((block, i) => `
**Logic ${i + 1}**: ${block.uuid}
- Condition: IF ${args.triggerField} contains "${block.payload.conditions[0].value}"
- Action: Show question ${block.payload.conditions[0].jumpTo}`).join('')}

## BestSelf Survey Example:
This pattern solves the Q5/Q6 challenge where you need "single questions with multiple conditional option sets."

Instead of creating separate Q5A, Q5B questions, you create multiple variants of Q5 that show different options based on Q4 priority selections.

## Critical Implementation Steps:
${implementationSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Data Analysis Notes:
- All variants collect responses under the same question concept
- Cross-reference with trigger field (${args.triggerField}) to understand context
- Each response includes triggerValue metadata for analysis

✅ This structure prevents the common mistake of creating separate questions for each condition, maintaining data consistency while providing dynamic user experience.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating dynamic question set: ${error instanceof Error ? error.message : 'Unknown error'}`,
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