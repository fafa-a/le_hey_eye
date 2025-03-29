use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize, TS)]
#[sea_orm(rs_type = "String", db_type = "Text", enum_name = "theme_type")]
#[ts(export, export_to = "../../../../types/entity.ts", rename = "Theme")]
pub enum ThemeType {
    #[sea_orm(string_value = "system")]
    #[serde(rename = "system")]
    System,
    #[sea_orm(string_value = "dark")]
    #[serde(rename = "dark")]
    Dark,
    #[sea_orm(string_value = "light")]
    #[serde(rename = "light")]
    Light,
}

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize, TS)]
#[sea_orm(table_name = "app_appearance")]
#[ts(
    export,
    export_to = "../../../../types/entity.ts",
    rename = "AppAppearance",
    rename_all = "camelCase"
)]
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
