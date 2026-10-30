CREATE TABLE games (id TEXT PRIMARY KEY, title TEXT NOT NULL, genre TEXT NOT NULL, platform TEXT NOT NULL, year INTEGER NOT NULL, rating REAL NOT NULL, description TEXT NOT NULL, steam TEXT NOT NULL DEFAULT '', color TEXT NOT NULL DEFAULT '#e88a44');
--> statement-breakpoint
CREATE TABLE sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE app_state (key TEXT PRIMARY KEY, value TEXT NOT NULL);
