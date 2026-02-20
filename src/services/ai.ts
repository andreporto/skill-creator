'use server';

import { SkillOutput, AIConfig } from '@/lib/types';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const defaultConfigs: Record<string, AIConfig> = {
  gemini: {
    provider: 'gemini',
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    model: 'gemini-1.5-pro',
  },
  'lm-studio': {
    provider: 'lm-studio',
    baseUrl: 'http://localhost:1234/v1',
    model: 'model-identifier',
  },
};

export const generateSkill = async (
  demand: string, 
  config: AIConfig = defaultConfigs.gemini
): Promise<SkillOutput> => {
  console.log(`Generating skill with provider: ${config.provider}, model: ${config.model}`);

  const systemPromptPath = path.join(process.cwd(), 'prompts', 'synthesis-engine.md');
  const systemPrompt = await fs.readFile(systemPromptPath, 'utf-8');

  let model;

  if (config.provider === 'gemini') {
    const google = createGoogleGenerativeAI({
      apiKey: config.apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    model = google(config.model);
  } else if (config.provider === 'lm-studio' || config.provider === 'copilot') {
    const openai = createOpenAI({
      apiKey: config.apiKey || 'not-needed',
      baseURL: config.baseUrl || (config.provider === 'lm-studio' ? 'http://localhost:1234/v1' : undefined),
    });
    model = openai(config.model);
  } else {
    throw new Error(`Unsupported provider: ${config.provider}`);
  }

  try {
    const { object } = await generateObject({
      model,
      system: systemPrompt,
      prompt: `User Demand: ${demand}`,
      schema: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        version: z.string(),
        expert_persona: z.object({
          role: z.string(),
          mandates: z.array(z.string()),
          constraints: z.array(z.string()),
        }),
        workflow: z.object({
          research: z.array(z.string()),
          strategy: z.array(z.string()),
          execution: z.array(z.string()),
        }),
        required_tools: z.array(z.string()),
        artifacts: z.array(z.object({
          path: z.string(),
          content: z.string(),
        })),
      }),
    });

    return object as SkillOutput;
  } catch (error) {
    console.error('Error generating skill:', error);
    throw error;
  }
};
