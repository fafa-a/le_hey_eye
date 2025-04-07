use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize, TS)]
#[sea_orm(rs_type = "String", db_type = "Text", enum_name = "role_type")]
#[ts(
    export,
    export_to = "../../../../shared/types/db/enum.ts",
    rename = "Role"
)]
pub enum RoleType {
    #[sea_orm(string_value = "system")]
    #[serde(rename = "system")]
    System,
    #[sea_orm(string_value = "user")]
    #[serde(rename = "user")]
    User,
    #[sea_orm(string_value = "assistant")]
    #[serde(rename = "assistant")]
    Assistant,
}

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize, TS)]
#[sea_orm(table_name = "messages")]
#[ts(
    export,
    export_to = "../../../../shared/types/db/messages.ts",
    rename = "Message",
    rename_all = "camelCase"
)]
#[serde(rename_all = "camelCase")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(column_type = "Integer")]
    pub topic_id: i32,
    pub role: RoleType,
    pub content: String,
    pub created_at: DateTimeWithTimeZone,
    #[sea_orm(nullable)]
    pub tokens_used: i32,
    #[sea_orm(nullable)]
    pub updated_at: Option<DateTimeWithTimeZone>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::topics::Entity",
        from = "Column::TopicId",
        to = "super::topics::Column::Id"
    )]
    Topic,
}

impl Related<super::topics::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Topic.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
