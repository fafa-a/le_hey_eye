use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize, TS)]
#[sea_orm(table_name = "tools")]
#[ts(
    export,
    export_to = "../../../../shared/types/db/providers/anthropic.ts",
    rename = "Tool",
    rename_all = "camelCase"
)]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub schema_type: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::tool_properties::Entity")]
    ToolProperties,

    #[sea_orm(has_many = "super::tool_required_props::Entity")]
    ToolRequiredProps,

    #[sea_orm(has_many = "super::providers_tools::Entity")]
    ProvidersTool,
}

impl Related<super::tool_properties::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ToolProperties.def()
    }
}

impl Related<super::tool_required_props::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ToolRequiredProps.def()
    }
}

impl Related<super::providers_tools::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ProvidersTool.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
