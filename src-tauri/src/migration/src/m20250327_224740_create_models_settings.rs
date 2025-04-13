use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(ModelsSettings::Table)
                    .if_not_exists()
                    .col(pk_auto(ModelsSettings::Id))
                    .col(integer(ModelsSettings::TopicId))
                    .col(string(ModelsSettings::Provider))
                    .col(string(ModelsSettings::System))
                    .col(string(ModelsSettings::ModelName))
                    .col(boolean(ModelsSettings::Stream))
                    .col(integer(ModelsSettings::MaxTokens))
                    .col(float(ModelsSettings::Temperature))
                    .col(float(ModelsSettings::TopK))
                    .col(float(ModelsSettings::TopP))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(ModelsSettings::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum ModelsSettings {
    Table,
    Id,
    TopicId,
    Provider,
    System,
    ModelName,
    Stream,
    MaxTokens,
    Temperature,
    TopK,
    TopP,
}
