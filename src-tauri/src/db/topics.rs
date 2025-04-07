use chrono::Utc;
use log::LevelFilter;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, Condition, ConnectOptions, Database, DatabaseConnection, DbErr,
    EntityTrait, IntoActiveModel, NotSet, QueryFilter, QueryOrder, Set, TransactionTrait,
};
use tauri::State;

use std::path::PathBuf;
use std::time::Duration;
use tauri::command;
use tauri::Manager;
use tauri::AppHandle;

use entity::messages::{
    ActiveModel as MessagesActiveModel, Column as MessagesColumn, Entity as Messages,
    Model as MessagesModel, RoleType,
};
use entity::topics::{
    ActiveModel as TopicActiveModel, Column as TopicsColumn, Entity as Topics, Model,
};
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
pub async fn get_all_topics(db: State<'_, DatabaseConnection>) -> Result<Vec<Model>, String> {
    Topics::find()
        .order_by_desc(TopicsColumn::Id)
        .all(&*db)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn get_messages_by_topic(
    db: State<'_, DatabaseConnection>,
    topic_id: i32,
) -> Result<Vec<MessagesModel>, String> {
    Messages::find()
        .filter(MessagesColumn::TopicId.eq(topic_id))
        .order_by_asc(MessagesColumn::CreatedAt)
        .all(&*db)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn add_topic(db: State<'_, DatabaseConnection>, name: String) -> Result<Model, String> {
    let now = Utc::now().fixed_offset();

    let new_topic = TopicActiveModel {
        id: NotSet,
        name: Set(name),
        created_at: Set(now),
        last_accessed_at: Set(now),
    };

    let result = new_topic
        .insert(&*db)
        .await
        .map_err(|e: DbErr| e.to_string())?;

    Ok(result)
}

#[command]
pub async fn add_message(
    db: State<'_, DatabaseConnection>,
    topic_id: i32,
    role: RoleType,
    content: String,
    tokens_used: Option<i32>,
) -> Result<i32, String> {
    let timestamp = Utc::now().fixed_offset();
    let tokens_used_value = tokens_used.unwrap_or(0);

    let new_message = MessagesActiveModel {
        id: NotSet,
        topic_id: Set(topic_id),
        role: Set(role),
        content: Set(content),
        created_at: Set(timestamp),
        updated_at: Set(Some(timestamp)),
        tokens_used: Set(tokens_used_value),
    };
    println!("new_message: {:?}", new_message);

    let result = new_message
        .insert(&*db)
        .await
        .map_err(|e: DbErr| e.to_string())?;

    println!("result: {:?}", result);

    Ok(result.id)
}

#[command]
pub async fn remove_topic(db: State<'_, DatabaseConnection>, topic_id: i32) -> Result<bool, String> {
    let transaction = db.begin().await.map_err(|e| e.to_string())?;

    Messages::delete_many()
        .filter(MessagesColumn::TopicId.eq(topic_id))
        .exec(&transaction)
        .await
        .map_err(|e| e.to_string())?;

    // remove_settings
    // Settings::delete_many()
    //     .filter(settings::Column::TopicId.eq(topic_id))
    //     .exec(&transaction)
    //     .await
    //     .map_err(|e| e.to_string())?;

    let topic_deleted = Topics::delete_by_id(topic_id)
        .exec(&transaction)
        .await
        .map_err(|e| e.to_string())?;

    transaction.commit().await.map_err(|e| e.to_string())?;

    Ok(topic_deleted.rows_affected > 0)
}

#[command]
pub async fn edit_topic_name(
    db: State<'_, DatabaseConnection>,
    topic_id: i32,
    new_name: String,
) -> Result<bool, String> {
    let topic_to_udpate = Topics::find_by_id(topic_id)
        .one(&*db)
        .await
        .map_err(|e| e.to_string())?;

    let topic = match topic_to_udpate {
        Some(t) => t,
        None => return Ok(false),
    };

    let mut topic_model: TopicActiveModel = topic.into();
    topic_model.name = Set(new_name.clone());

    let updated_topic = topic_model.update(&*db).await.map_err(|e| e.to_string())?;

    Ok(updated_topic.name == new_name)
}

#[command]
pub async fn remove_messages(
    db: State<'_, DatabaseConnection>,
    message_ids: Vec<i32>,
) -> Result<u64, String> {
    let result = Messages::delete_many()
        .filter(MessagesColumn::Id.is_in(message_ids))
        .exec(&*db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(result.rows_affected)
}

#[tauri::command]
pub async fn update_topic_access(topic_id: i32, db: State<'_, DatabaseConnection>) -> Result<bool, String> {
    let topic_to_udpate = Topics::find_by_id(topic_id)
        .one(&*db)
        .await
        .map_err(|e| e.to_string())?;

    let topic = match topic_to_udpate {
        Some(t) => t,
        None => return Ok(false),
    };

    let now = Utc::now().fixed_offset();

    let mut topic_model: TopicActiveModel = topic.into();
    topic_model.last_accessed_at = Set(now);

    let updated_topic = topic_model.update(&*db).await.map_err(|e| e.to_string())?;

    Ok(updated_topic.last_accessed_at == now)
}

#[tauri::command]
pub async fn get_last_accessed_topic(db: State<'_, DatabaseConnection>) -> Result<Option<i32>, String> {
    let topic_result = Topics::find()
        .order_by_desc(TopicsColumn::LastAccessedAt)
        .one(&*db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(topic_result.map(|topic| topic.id))
}
