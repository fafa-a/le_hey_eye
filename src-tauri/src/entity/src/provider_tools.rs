use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use ts_rs::TS;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize, TS)]
#[sea_orm(table_name = "providers_tools")]
#[ts(
    export,
    export_to = "../../../../types/entity.ts",
    rename = "ProviderTool",
    rename_all = "camelCase"
)]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub provider_name: String,
    #[sea_orm(column_type = "Json")]
    pub tool: Value,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::anthropic_models_settings::Entity",
        from = "Column::Id",
        to = "super::anthropic_models_settings::Column::Id"
    )]
    AnthropicModelsSettings,
}

impl Related<super::anthropic_models_settings::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::AnthropicModelsSettings.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
