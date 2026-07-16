import fixture from "../../../fixtures/pipeline.json";
import { evaluationSchema, lessonSchema, questionSchema } from "./schemas";

export const fixtureQuestion = questionSchema.parse(fixture.question);
export const fixtureEvaluation = evaluationSchema.parse(fixture.evaluation);
export const fixtureLesson = lessonSchema.parse(fixture.lesson);
