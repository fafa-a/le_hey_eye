use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize, TS)]
#[sea_orm(table_name = "thinking")]
#[ts(
    export,
    export_to = "../../../../shared/types/db/providers/anthropic.ts",
    rename = "Thinking",
    rename_all = "camelCase"
)]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub topic_id: i32,
    pub budget_tokens: i32,
    pub enabled: bool,
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

impl Related<super::anthropic_models_settings::Entity> for Entity {
    fn to() -> RelationDef {
        super::anthropic_models_settings::Relation::Thinking
            .def()
            .rev()
    }
}

impl ActiveModelBehavior for ActiveModel {}
