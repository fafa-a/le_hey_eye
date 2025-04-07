use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize, TS)]
#[sea_orm(table_name = "providers_tools")]
#[ts(
    export,
    export_to = "../../../../shared/types/db/providers/anthropic.ts",
    rename = "ProviderTool",
    rename_all = "camelCase"
)]
#[serde(rename_all = "camelCase")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub provider_name: String,
    pub tool_id: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::tools::Entity",
        from = "Column::Id",
        to = "super::tools::Column::Id"
    )]
    Tool,
}

impl Related<super::anthropic_models_settings::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Tool.def()
    }
}
impl Related<super::tools::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Tool.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
