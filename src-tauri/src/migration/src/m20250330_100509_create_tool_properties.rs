use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(ToolProperties::Table)
                    .if_not_exists()
                    .col(pk_auto(ToolProperties::Id))
                    .col(integer(ToolProperties::ToolId).not_null())
                    .col(string(ToolProperties::Name).not_null())
                    .col(string(ToolProperties::TypeName).not_null())
                    .col(string(ToolProperties::Description))
                    .col(boolean(ToolProperties::Required).not_null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(ToolProperties::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum ToolProperties {
    Table,
    Id,
    ToolId,
    Name,
    TypeName,
    Description,
    Required,
}
