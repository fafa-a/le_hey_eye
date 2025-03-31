use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize, TS)]
#[sea_orm(table_name = "tool_properties")]
#[ts(
    export,
    export_to = "../../../../shared/types/db/providers/anthropic.ts",
    rename = "ToolProperty",
    rename_all = "camelCase"
)]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub tool_id: i32,
    pub name: String,
    pub type_name: String,
    pub description: Option<String>,
    pub required: bool,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::tools::Entity",
        from = "Column::ToolId",
        to = "super::tools::Column::Id"
    )]
    Tool,
}

impl Related<super::tools::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Tool.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
