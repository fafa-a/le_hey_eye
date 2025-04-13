use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize, TS)]
#[sea_orm(table_name = "models_settings")]
#[ts(
    export,
    export_to = "../../../../shared/types/db/models-settings.ts",
    rename = "ModelSettings",
    rename_all = "camelCase"
)]
#[serde(rename_all = "camelCase")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(column_type = "Integer")]
    pub topic_id: i32,
    pub provider: String,
    pub system: String,
    pub model_name: String,
    pub stream: bool,
    pub max_tokens: i32,
    #[ts(optional)]
    #[sea_orm(column_type = "Float", nullable)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,
    #[ts(optional)]
    #[sea_orm(column_type = "Float", nullable)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_k: Option<f32>,
    #[ts(optional)]
    #[sea_orm(column_type = "Float", nullable)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f32>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::topics::Entity",
        from = "Column::TopicId",
        to = "super::topics::Column::Id"
    )]
    Topic,

    #[sea_orm(
        has_one = "super::anthropic_models_settings::Entity",
        from = "Column::Id",
        to = "super::anthropic_models_settings::Column::Id"
    )]
    AnthropicModelSettings,
}

impl Related<super::topics::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Topic.def()
    }
}

impl Related<super::anthropic_models_settings::Entity> for Entity {
    fn to() -> RelationDef {
        super::topics::Relation::AnthropicModelsSettings.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
