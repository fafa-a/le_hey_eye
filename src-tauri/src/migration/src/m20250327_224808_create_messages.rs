use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Messages::Table)
                    .if_not_exists()
                    .col(pk_auto(Messages::Id))
                    .col(string(Messages::TopicId))
                    .col(string(Messages::Role))
                    .col(string(Messages::Content))
                    .col(date_time(Messages::CreatedAt))
                    .col(integer(Messages::TokensUsed))
                    .col(date_time(Messages::UpdatedAt))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Messages::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Messages {
    Table,
    Id,
    TopicId,
    Role,
    Content,
    CreatedAt,
    TokensUsed,
    UpdatedAt,
}
