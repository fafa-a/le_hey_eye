use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Text", enum_name = "theme_type")]
pub enum ThemeType {
    #[sea_orm(string_value = "system")]
    System,
    #[sea_orm(string_value = "dark")]
    Dark,
    #[sea_orm(string_value = "light")]
    Light,
}

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "app_appearance")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub theme: ThemeType,
    pub code_theme: ThemeType,
    pub thumbnail_random_color: bool,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
