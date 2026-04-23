-- AI Study Companion — initial schema (PostgreSQL).
-- SQLAlchemy models create these automatically on first run,
-- but this script is provided for manual bootstrap / reference.

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    username        VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    content     TEXT NOT NULL DEFAULT '',
    subject     VARCHAR(120),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

CREATE TABLE IF NOT EXISTS progress (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic       VARCHAR(255) NOT NULL,
    completion  REAL DEFAULT 0.0,
    score       REAL DEFAULT 0.0,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, topic)
);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);

CREATE TABLE IF NOT EXISTS decks (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    source_note_id  INTEGER REFERENCES notes(id) ON DELETE SET NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);

CREATE TABLE IF NOT EXISTS flashcards (
    id                 SERIAL PRIMARY KEY,
    deck_id            INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    question           TEXT NOT NULL,
    answer             TEXT NOT NULL,
    ease               INTEGER DEFAULT 0,
    last_reviewed_at   TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON flashcards(deck_id);

CREATE TABLE IF NOT EXISTS activity (
    id               SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day              DATE NOT NULL DEFAULT CURRENT_DATE,
    minutes          INTEGER DEFAULT 0,
    cards_reviewed   INTEGER DEFAULT 0,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_activity_user_day UNIQUE (user_id, day)
);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity(user_id);
