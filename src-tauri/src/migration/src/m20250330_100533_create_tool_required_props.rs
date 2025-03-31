use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(ToolRequiredProps::Table)
                    .if_not_exists()
                    .col(pk_auto(ToolRequiredProps::Id))
                    .col(string(ToolRequiredProps::ToolId).not_null())
                    .col(string(ToolRequiredProps::PropertyName).not_null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(ToolRequiredProps::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum ToolRequiredProps {
    Table,
    Id,
    ToolId,
    PropertyName,
}
