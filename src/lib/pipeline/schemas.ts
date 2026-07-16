import { z } from "zod";

const nullableSlugSchema = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? null : value,
  z.string().nullable(),
);

export const questionSchema = z.object({
  prompt: z.string().min(1),
  type: z.enum(["multiple_choice", "free_response"]),
  choices: z.array(z.object({ label: z.string(), text: z.string(), misconception_slug: nullableSlugSchema })),
  correct_answer: z.string().min(1),
  explanation: z.string().min(1),
});

const proposedMisconceptionSchema = z.object({ name: z.string().min(1), description: z.string().min(1) });
export const diagnosisSchema = z.object({
  is_correct: z.boolean(),
  rationale: z.string().min(1),
  followup_probe: z.string().nullable(),
});
export const taxonomyMatchSchema = z.object({
  matched_slug: nullableSlugSchema,
  proposed_new: proposedMisconceptionSchema.nullable(),
});
export const evaluationSchema = z.object({
  is_correct: z.boolean(),
  misconception: z.object({
    matched_slug: nullableSlugSchema,
    proposed_new: proposedMisconceptionSchema.nullable(),
  }).nullable(),
  rationale: z.string().min(1),
  followup_probe: z.string().nullable(),
});

export const lessonSchema = z.object({
  title: z.string().min(1),
  content_md: z.string().min(200),
});

export type GeneratedQuestion = z.infer<typeof questionSchema>;
export type Diagnosis = z.infer<typeof diagnosisSchema>;
export type TaxonomyMatch = z.infer<typeof taxonomyMatchSchema>;
export type AnswerEvaluation = z.infer<typeof evaluationSchema>;
export type MicroLesson = z.infer<typeof lessonSchema>;
