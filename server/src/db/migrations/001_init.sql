PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE boards (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE columns (
  id          TEXT PRIMARY KEY,
  board_id    TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  position    TEXT NOT NULL,
  wip_limit   INTEGER,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
CREATE INDEX idx_columns_board ON columns(board_id, position);

CREATE TABLE cards (
  id           TEXT PRIMARY KEY,
  column_id    TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  position     TEXT NOT NULL,
  due_date     TEXT,
  archived_at  TEXT,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);
CREATE INDEX idx_cards_column ON cards(column_id, position);
CREATE INDEX idx_cards_archived ON cards(archived_at);

CREATE TABLE labels (
  id        TEXT PRIMARY KEY,
  board_id  TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  color     TEXT NOT NULL
);

CREATE TABLE card_labels (
  card_id   TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  label_id  TEXT NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, label_id)
);

CREATE TABLE checklist_items (
  id         TEXT PRIMARY KEY,
  card_id    TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  done       INTEGER NOT NULL DEFAULT 0,
  position   TEXT NOT NULL
);
