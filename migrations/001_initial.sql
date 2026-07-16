PRAGMA foreign_keys = ON;

CREATE TABLE concepts (id INTEGER PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, description TEXT NOT NULL);
CREATE TABLE concept_edges (from_id INTEGER NOT NULL REFERENCES concepts(id), to_id INTEGER NOT NULL REFERENCES concepts(id), PRIMARY KEY (from_id, to_id));
CREATE TABLE misconceptions (id INTEGER PRIMARY KEY, concept_id INTEGER NOT NULL REFERENCES concepts(id), slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, description TEXT NOT NULL);
CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE student_concept (student_id INTEGER NOT NULL REFERENCES students(id), concept_id INTEGER NOT NULL REFERENCES concepts(id), mastery REAL NOT NULL CHECK (mastery BETWEEN 0 AND 1), PRIMARY KEY (student_id, concept_id));
CREATE TABLE student_misconception (student_id INTEGER NOT NULL REFERENCES students(id), misconception_id INTEGER NOT NULL REFERENCES misconceptions(id), strength REAL NOT NULL CHECK (strength BETWEEN 0 AND 1), evidence_count INTEGER NOT NULL, last_seen_at TEXT NOT NULL, PRIMARY KEY (student_id, misconception_id));
CREATE TABLE sessions (id INTEGER PRIMARY KEY, student_id INTEGER NOT NULL REFERENCES students(id), started_at TEXT NOT NULL, completed_at TEXT);
CREATE TABLE answers (id INTEGER PRIMARY KEY, session_id INTEGER NOT NULL REFERENCES sessions(id), concept_id INTEGER NOT NULL REFERENCES concepts(id), question TEXT NOT NULL, student_answer TEXT NOT NULL, is_correct INTEGER NOT NULL, extracted_misconception_id INTEGER REFERENCES misconceptions(id), rationale TEXT NOT NULL);
CREATE TABLE lessons (id INTEGER PRIMARY KEY, student_id INTEGER NOT NULL REFERENCES students(id), target TEXT NOT NULL, content_md TEXT NOT NULL, created_at TEXT NOT NULL, completed_at TEXT);

CREATE INDEX idx_answers_session ON answers(session_id);
CREATE INDEX idx_student_misconception_strength ON student_misconception(student_id, strength DESC);
