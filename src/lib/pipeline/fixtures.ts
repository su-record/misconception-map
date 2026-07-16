import fixture from "../../../fixtures/pipeline.json";
import { evaluationSchema, questionSchema } from "./schemas";

export const fixtureQuestion = questionSchema.parse(fixture.question);
export const fixtureEvaluation = evaluationSchema.parse(fixture.evaluation);
