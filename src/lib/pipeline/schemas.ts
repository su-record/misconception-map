import { z } from "zod";

export const questionSchema = z.object({
  prompt: z.string().min(1),
  type: z.enum(["multiple_choice", "free_response"]),
  choices: z.array(z.object({ label: z.string(), text: z.string(), misconception_slug: z.string().nullable() })),
  correct_answer: z.string().min(1),
  explanation: z.string().min(1),
});

const proposedMisconceptionSchema = z.object({ name: z.string().min(1), description: z.string().min(1) });
export const evaluationSchema = z.object({
  is_correct: z.boolean(),
  misconception: z.object({
    matched_slug: z.string().nullable(),
    proposed_new: proposedMisconceptionSchema.nullable(),
  }).nullable(),
  rationale: z.string().min(1),
  followup_probe: z.string().nullable(),
});

export type GeneratedQuestion = z.infer<typeof questionSchema>;
export type AnswerEvaluation = z.infer<typeof evaluationSchema>;
