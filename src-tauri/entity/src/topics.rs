use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "topics")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    pub created_at: DateTimeWithTimeZone,
    pub last_accessed_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::messages::Entity")]
    Messages,
    #[sea_orm(has_many = "super::models_settings::Entity")]
    ModelsSettings,
}

impl Related<super::messages::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Messages.def()
    }
}

impl Related<super::models_settings::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ModelsSettings.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
