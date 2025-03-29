use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use ts_rs::TS;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize, TS)]
#[sea_orm(table_name = "anthropic_models_settings")]
#[ts(
    export,
    export_to = "../../../../types/entity.ts",
    rename = "AnthropicModelSettings",
    rename_all = "camelCase"
)]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(column_type = "Integer")]
    pub topic_id: i32,
    #[sea_orm(column_type = "Json")]
    pub thinking: Value,
    pub budget_tokens: i32,
    #[sea_orm(column_type = "Json", nullable)]
    pub tools: Option<Value>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::models_settings::Entity",
        from = "Column::TopicId",
        to = "super::models_settings::Column::Id"
    )]
    ModelsSettings,
}

impl Related<super::models_settings::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ModelsSettings.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
