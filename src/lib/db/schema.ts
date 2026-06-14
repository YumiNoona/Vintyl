const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  supabaseId TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  firstName TEXT DEFAULT '',
  lastName TEXT DEFAULT '',
  image TEXT DEFAULT '',
  password TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Subscription (
  id TEXT PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'FREE',
  customerId TEXT,
  userId TEXT NOT NULL UNIQUE,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS Workspace (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'PERSONAL',
  userId TEXT NOT NULL,
  videoCount INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS Member (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  workspaceId TEXT NOT NULL,
  supabaseId TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (workspaceId) REFERENCES Workspace(id),
  UNIQUE(workspaceId, supabaseId)
);

CREATE TABLE IF NOT EXISTS Folder (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  workspaceId TEXT NOT NULL,
  userId TEXT NOT NULL,
  videoCount INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (workspaceId) REFERENCES Workspace(id),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS Video (
  id TEXT PRIMARY KEY,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  source TEXT,
  processing INTEGER DEFAULT 1,
  views INTEGER DEFAULT 0,
  isPublic INTEGER DEFAULT 0,
  transcript TEXT,
  summary TEXT,
  workspaceId TEXT NOT NULL,
  folderId TEXT,
  userId TEXT,
  planAtCreation TEXT DEFAULT 'FREE',
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (workspaceId) REFERENCES Workspace(id),
  FOREIGN KEY (folderId) REFERENCES Folder(id),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS Invite (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  senderId TEXT NOT NULL,
  receiverId TEXT,
  receiverSupabaseId TEXT,
  email TEXT,
  content TEXT DEFAULT '',
  accepted INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (workspaceId) REFERENCES Workspace(id),
  FOREIGN KEY (senderId) REFERENCES User(id),
  FOREIGN KEY (receiverId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS Comment (
  id TEXT PRIMARY KEY,
  comment TEXT NOT NULL,
  commentId TEXT,
  reply INTEGER DEFAULT 0,
  videoId TEXT NOT NULL,
  userId TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (videoId) REFERENCES Video(id),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS Notification (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  content TEXT DEFAULT '',
  inviteId TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS Trial (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE,
  trial INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE INDEX IF NOT EXISTS idx_video_workspace ON Video(workspaceId);
CREATE INDEX IF NOT EXISTS idx_video_user ON Video(userId);
CREATE INDEX IF NOT EXISTS idx_video_folder ON Video(folderId);
CREATE INDEX IF NOT EXISTS idx_member_workspace ON Member(workspaceId);
CREATE INDEX IF NOT EXISTS idx_member_user ON Member(userId);
CREATE INDEX IF NOT EXISTS idx_member_supabase ON Member(supabaseId);
CREATE INDEX IF NOT EXISTS idx_folder_workspace ON Folder(workspaceId);
CREATE INDEX IF NOT EXISTS idx_invite_receiver ON Invite(receiverId);
CREATE INDEX IF NOT EXISTS idx_comment_video ON Comment(videoId);
CREATE INDEX IF NOT EXISTS idx_notification_user ON Notification(userId);
`;

export function getSchema() {
  return SCHEMA_SQL;
}
