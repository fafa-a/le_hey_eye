use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tauri::command;
use tauri::Manager;
use tauri::{AppHandle, State};

#[derive(Debug, Serialize, Deserialize)]
pub struct Topic {
    pub id: String,
    pub name: String,
    pub created_at: String,
    pub bg_color: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
    pub id: String,
    pub topic_id: String,
    pub role: String,
    pub content: String,
    pub timestamp: String,
    pub tokens_used: Option<i32>,
}

pub struct DatabaseConnection(pub Arc<Mutex<Connection>>);

fn get_db_path(app: &tauri::AppHandle) -> PathBuf {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
    app_dir.join("topics.db")
}

pub fn initialize_database(app_handle: &AppHandle) -> DatabaseConnection {
    let db_path = get_db_path(app_handle);
    let conn = Connection::open(db_path).expect("Failed to open database");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS topics (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            bg_color TEXT NOT NULL,
            last_accessed_at TEXT
        )",
        [],
    )
    .expect("Failed to create topics table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            topic_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            tokens_used INTEGER,
            FOREIGN KEY (topic_id) REFERENCES topics (id)
        )",
        [],
    )
    .expect("Failed to create messages table");

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_topics_last_accessed_at ON topics(last_accessed_at DESC)",
        [],
    )
    .expect("Failed to create index on topics table");

    DatabaseConnection(Arc::new(Mutex::new(conn)))
}

#[command]
pub fn get_all_topics(db: State<'_, DatabaseConnection>) -> Result<Vec<Topic>, String> {
    let conn =
        db.0.lock()
            .map_err(|_| "Failed to lock database".to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, created_at, bg_color FROM topics ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let topics = stmt
        .query_map([], |row| {
            Ok(Topic {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
                bg_color: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(topics)
}

#[command]
pub fn get_messages_for_topic(
    db: State<'_, DatabaseConnection>,
    topic_id: String,
) -> Result<Vec<Message>, String> {
    let conn =
        db.0.lock()
            .map_err(|_| "Failed to lock database".to_string())?;
    let mut stmt = conn.prepare("SELECT id, topic_id, role, content, timestamp, tokens_used FROM messages WHERE topic_id = ? ORDER BY timestamp")
        .map_err(|e| e.to_string())?;

    let messages = stmt
        .query_map(params![topic_id], |row| {
            Ok(Message {
                id: row.get(0)?,
                topic_id: row.get(1)?,
                role: row.get(2)?,
                content: row.get(3)?,
                timestamp: row.get(4)?,
                tokens_used: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(messages)
}

#[command]
pub fn add_topic(
    db: State<'_, DatabaseConnection>,
    id: String,
    name: String,
    bg_color: String,
) -> Result<(), String> {
    let conn =
        db.0.lock()
            .map_err(|_| "Failed to lock database".to_string())?;
    let created_at = chrono::Utc::now().to_rfc3339();

    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO topics (id, name, created_at, bg_color, last_accessed_at) VALUES (?, ?, ?, ?, ?)",
        params![id, name, created_at, bg_color, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
pub fn add_message(
    db: State<'_, DatabaseConnection>,
    id: String,
    topic_id: String,
    role: String,
    content: String,
    tokens_used: Option<i32>,
) -> Result<(), String> {
    let conn =
        db.0.lock()
            .map_err(|_| "Failed to lock database".to_string())?;
    let timestamp = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO messages (id, topic_id, role, content, timestamp, tokens_used) 
         VALUES (?, ?, ?, ?, ?, ?)",
        params![id, topic_id, role, content, timestamp, tokens_used],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
pub fn remove_topic(db: State<'_, DatabaseConnection>, topic_id: String) -> Result<(), String> {
    let conn =
        db.0.lock()
            .map_err(|_| "Failed to lock database".to_string())?;

    // Delete associated messages first
    conn.execute("DELETE FROM messages WHERE topic_id = ?", params![topic_id])
        .map_err(|e| e.to_string())?;

    // Delete the topic
    conn.execute("DELETE FROM topics WHERE id = ?", params![topic_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
pub fn edit_topic_name(
    db: State<'_, DatabaseConnection>,
    topic_id: String,
    name: String,
) -> Result<(), String> {
    let conn =
        db.0.lock()
            .map_err(|_| "Failed to lock database".to_string())?;

    conn.execute(
        "UPDATE topics SET name = ? WHERE id = ?",
        params![name, topic_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
pub fn remove_message(db: State<'_, DatabaseConnection>, message_id: String) -> Result<(), String> {
    let conn =
        db.0.lock()
            .map_err(|_| "Failed to lock database".to_string())?;

    conn.execute("DELETE FROM messages WHERE id = ?", params![message_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_topic_access(
    topic_id: String,
    db: State<'_, DatabaseConnection>,
) -> Result<(), String> {
    let conn =
        db.0.lock()
            .map_err(|_| "Failed to lock database".to_string())?;

    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE topics SET last_accessed_at = ? WHERE id = ?",
        params![now, topic_id],
    )
    .map_err(|e| format!("Failed to update topic access: {:?}", e))?;

    Ok(())
}

#[tauri::command]
pub fn get_last_accessed_topic(
    db: State<'_, DatabaseConnection>,
) -> Result<Option<String>, String> {
    let conn =
        db.0.lock()
            .map_err(|_| "Failed to lock database".to_string())?;

    let topic_id: Result<String, rusqlite::Error> = conn.query_row(
        "SELECT id FROM topics WHERE last_accessed_at IS NOT NULL 
         ORDER BY last_accessed_at DESC LIMIT 1",
        [],
        |row| row.get(0),
    );

    match topic_id {
        Ok(id) => Ok(Some(id)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(format!("Database error: {:?}", e)),
    }
}
