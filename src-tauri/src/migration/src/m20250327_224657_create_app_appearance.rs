use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(AppAppearance::Table)
                    .if_not_exists()
                    .col(pk_auto(AppAppearance::Id))
                    .col(string(AppAppearance::Theme))
                    .col(string(AppAppearance::CodeTheme))
                    .col(boolean(AppAppearance::ThumbnailRandomColor))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(AppAppearance::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum AppAppearance {
    Table,
    Id,
    Theme,
    CodeTheme,
    ThumbnailRandomColor,
}
