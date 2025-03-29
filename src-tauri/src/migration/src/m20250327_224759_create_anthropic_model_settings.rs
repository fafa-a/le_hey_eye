use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(AnthropicModelSettings::Table)
                    .if_not_exists()
                    .col(pk_auto(AnthropicModelSettings::Id))
                    .col(integer(AnthropicModelSettings::TopicId))
                    .col(json_binary(AnthropicModelSettings::Thinking))
                    .col(integer(AnthropicModelSettings::BudgetTokens))
                    .col(json_binary(AnthropicModelSettings::Tools))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(
                Table::drop()
                    .table(AnthropicModelSettings::Table)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum AnthropicModelSettings {
    Table,
    Id,
    TopicId,
    Thinking,
    BudgetTokens,
    Tools,
}
