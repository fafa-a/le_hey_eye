use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(ProviderTool::Table)
                    .if_not_exists()
                    .col(pk_auto(ProviderTool::Id))
                    .col(string(ProviderTool::ProviderName))
                    .col(json_binary(ProviderTool::Tool))
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_provider_tool_provider_name")
                    .table(ProviderTool::Table)
                    .col(ProviderTool::ProviderName)
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_index(
                Index::drop()
                    .name("idx_provider_tool_provider_name")
                    .table(ProviderTool::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_table(Table::drop().table(ProviderTool::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum ProviderTool {
    Table,
    Id,
    ProviderName,
    Tool,
}
