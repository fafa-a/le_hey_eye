use chrono::Utc;
use log::LevelFilter;
use sea_orm::ActiveValue::NotSet;
use sea_orm::{ColumnTrait, ConnectOptions, Database, DatabaseConnection, DbErr, EntityTrait, QueryFilter,QueryOrder, ActiveModelTrait, IntoActiveModel,Set,Condition};

use std::path::PathBuf;
use std::time::Duration;
use tauri::command;
use tauri::Manager;
use tauri::{async_runtime, AppHandle, State};

use crate::core::models::{ChatRole, ContentType, Topic, TopicMessage};
use entity::messages::{
    ActiveModel as MessagesActiveModel, Column as MessagesColumn, Entity as Messages,
    Model as MessagesModel,
};
use entity::topics::{ActiveModel as TopicActiveModel, Column as TopicsColumn, Entity as Topics, Model};
use migration::{Migrator, MigratorTrait};

fn get_db_path(app: &tauri::AppHandle) -> PathBuf {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
    app_dir.join("topics.db")
}

pub async fn initialize_database(app_handle: &AppHandle) -> Result<DatabaseConnection, DbErr> {
    let db_path = get_db_path(app_handle);
    let db_url = format!("sqlite:{}?mode=rwc", db_path.to_string_lossy());

    let mut opt = ConnectOptions::new(&db_url);
    opt.max_connections(1)
        .min_connections(1)
        .connect_timeout(Duration::from_secs(10))
        .idle_timeout(Duration::from_secs(60))
        .sqlx_logging(true)
        .sqlx_logging_level(LevelFilter::Info);
    let conn: DatabaseConnection = Database::connect(&db_url).await?;

    Migrator::up(&conn, None).await?;

    Result::Ok(conn)
}

#[command]
pub async fn get_all_topics(db: &DatabaseConnection) -> Result<Vec<Model>, DbErr> {
    Topics::find().order_by_desc(TopicsColumn::Id).all(db).await
}

#[command]
pub async fn get_messages_by_topic(
    db: &DatabaseConnection,
    topic_id: String,
) -> Result<Vec<MessagesModel>, DbErr> {

    Messages::find()
        .filter(MessagesColumn::TopicId.eq(topic_id))
        .order_by_asc(MessagesColumn::CreatedAt)
        .all(db)
        .await

}

#[command]
pub async fn add_topic(
    db: &DatabaseConnection,
    name: String,
) -> Result<i32, String> {
    let now = Utc::now().fixed_offset();
    
    let new_topic = TopicActiveModel {
        id: NotSet,
        name: Set(name),
        created_at: Set(now),
        last_accessed_at: Set(now),
    };

    let result = new_topic
        .insert(db)
        .await
        .map_err(|e: DbErr| e.to_string())?;

    Ok(result.id)
}
//
// #[command]
// pub fn add_message(
//     db: State<'_, DatabaseConnection>,
//     id: String,
//     topic_id: String,
//     role: String,
//     content: String,
//     tokens_used: Option<i32>,
// ) -> Result<(), String> {
//     let conn =
//         db.0.lock()
//             .map_err(|_| "Failed to lock database".to_string())?;
//     let timestamp = chrono::Utc::now().to_rfc3339();
//
//     conn.execute(
//         "INSERT INTO messages (id, topic_id, role, content, timestamp, tokens_used)
//          VALUES (?, ?, ?, ?, ?, ?)",
//         params![id, topic_id, role, content, timestamp, tokens_used],
//     )
//     .map_err(|e| e.to_string())?;
//
//     Ok(())
// }
//
// #[command]
// pub fn remove_topic(db: State<'_, DatabaseConnection>, topic_id: String) -> Result<(), String> {
//     let conn =
//         db.0.lock()
//             .map_err(|_| "Failed to lock database".to_string())?;
//
//     // Delete associated messages first
//     conn.execute("DELETE FROM messages WHERE topic_id = ?", params![topic_id])
//         .map_err(|e| e.to_string())?;
//
//     // Delete the topic
//     conn.execute("DELETE FROM topics WHERE id = ?", params![topic_id])
//         .map_err(|e| e.to_string())?;
//
//     Ok(())
// }
//
// #[command]
// pub fn edit_topic_name(
//     db: State<'_, DatabaseConnection>,
//     topic_id: String,
//     name: String,
// ) -> Result<(), String> {
//     let conn =
//         db.0.lock()
//             .map_err(|_| "Failed to lock database".to_string())?;
//
//     conn.execute(
//         "UPDATE topics SET name = ? WHERE id = ?",
//         params![name, topic_id],
//     )
//     .map_err(|e| e.to_string())?;
//
//     Ok(())
// }

// #[command]
// pub fn remove_message(db: State<'_, DatabaseConnection>, message_id: String) -> Result<(), String> {
//     let conn =
//         db.0.lock()
//             .map_err(|_| "Failed to lock database".to_string())?;
//
//     conn.execute("DELETE FROM messages WHERE id = ?", params![message_id])
//         .map_err(|e| e.to_string())?;
//
//     Ok(())
// }

// #[command]
// pub fn remove_message(db: State<'_, DatabaseConnection>, message_id: String) -> Result<(), String> {
//     let mut conn =
//         db.0.lock()
//             .map_err(|_| "Failed to lock database".to_string())?;
//
//     let tx = conn
//         .transaction()
//         .map_err(|e| format!("Failed to start transaction: {}", e))?;
//
//     let message = tx
//         .query_row(
//             "SELECT role, topic_id, timestamp FROM messages WHERE id = ?",
//             params![message_id],
//             |row| {
//                 Ok((
//                     row.get::<_, String>(0)?,
//                     row.get::<_, String>(1)?,
//                     row.get::<_, String>(2)?,
//                 ))
//             },
//         )
//         .map_err(|e| {
//             if e.to_string().contains("no rows") {
//                 "Message not found".to_string()
//             } else {
//                 format!("Failed to fetch message info: {}", e)
//             }
//         })?;
//
//     let (role, topic_id, timestamp) = message;
//
//     if role == "assistant" {
//         tx.execute(
//             "DELETE FROM messages
//              WHERE topic_id = ?
//              AND role = 'user'
//              AND timestamp < ?
//              AND timestamp = (
//                 SELECT MAX(timestamp) FROM messages
//                 WHERE topic_id = ?
//                 AND role = 'user'
//                 AND timestamp < ?
//              )",
//             params![topic_id, timestamp, topic_id, timestamp],
//         )
//         .map_err(|e| format!("Failed to delete previous user message: {}", e))?;
//     } else if role == "user" {
//         tx.execute(
//             "DELETE FROM messages
//              WHERE topic_id = ?
//              AND role = 'assistant'
//              AND timestamp > ?
//              AND timestamp = (
//                 SELECT MIN(timestamp) FROM messages
//                 WHERE topic_id = ?
//                 AND role = 'assistant'
//                 AND timestamp > ?
//              )",
//             params![topic_id, timestamp, topic_id, timestamp],
//         )
//         .map_err(|e| format!("Failed to delete next assistant message: {}", e))?;
//     }
//
//     tx.execute("DELETE FROM messages WHERE id = ?", params![message_id])
//         .map_err(|e| format!("Failed to delete original message: {}", e))?;
//
//     tx.commit()
//         .map_err(|e| format!("Failed to commit transaction: {}", e))?;
//
//     Ok(())
// }
//
// #[tauri::command]
// pub fn update_topic_access(
//     topic_id: String,
//     db: State<'_, DatabaseConnection>,
// ) -> Result<(), String> {
//     let conn =
//         db.0.lock()
//             .map_err(|_| "Failed to lock database".to_string())?;
//
//     let now = chrono::Utc::now().to_rfc3339();
//
//     conn.execute(
//         "UPDATE topics SET last_accessed_at = ? WHERE id = ?",
//         params![now, topic_id],
//     )
//     .map_err(|e| format!("Failed to update topic access: {:?}", e))?;
//
//     Ok(())
// }
//
// #[tauri::command]
// pub fn get_last_accessed_topic(
//     db: State<'_, DatabaseConnection>,
// ) -> Result<Option<String>, String> {
//     let conn =
//         db.0.lock()
//             .map_err(|_| "Failed to lock database".to_string())?;
//
//     let topic_id: Result<String, rusqlite::Error> = conn.query_row(
//         "SELECT id FROM topics WHERE last_accessed_at IS NOT NULL
//          ORDER BY last_accessed_at DESC LIMIT 1",
//         [],
//         |row| row.get(0),
//     );
//
//     match topic_id {
//         Ok(id) => Ok(Some(id)),
//         Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
//         Err(e) => Err(format!("Database error: {:?}", e)),
//     }
// }
