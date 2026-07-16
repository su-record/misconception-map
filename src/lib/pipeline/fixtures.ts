import fixture from "../../../fixtures/pipeline.json";
import { diagnosisSchema, evaluationSchema, lessonSchema, questionSchema, taxonomyMatchSchema } from "./schemas";

export const fixtureQuestion = questionSchema.parse(fixture.question);
export const fixtureEvaluation = evaluationSchema.parse(fixture.evaluation);
export const fixtureDiagnosis = diagnosisSchema.parse(fixture.diagnosis);
export const fixtureTaxonomyMatch = taxonomyMatchSchema.parse(fixture.taxonomy_match);
export const fixtureLesson = lessonSchema.parse(fixture.lesson);
