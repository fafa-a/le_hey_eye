use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "messages")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(column_type = "Integer")]
    pub topic_id: i32,
    pub role: String,
    pub content: String,
    pub created_at: DateTimeWithTimeZone,
    pub tokens_used: Option<i32>,
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
