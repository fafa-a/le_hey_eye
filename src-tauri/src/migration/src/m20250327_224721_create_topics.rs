use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Topics::Table)
                    .if_not_exists()
                    .col(pk_auto(Topics::Id))
                    .col(string(Topics::Name))
                    .col(date_time(Topics::CreatedAt))
                    .col(date_time(Topics::LastAccessedAt))
                    .to_owned(),
            )
            .await;

        manager
            .create_index(
                Index::create()
                    .name("idx_topics_last_accessed_at")
                    .table(Topics::Table)
                    .col(Topics::LastAccessedAt)
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_index(
                Index::drop()
                    .name("idx_topics_last_accessed_at")
                    .table(Topics::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_table(Table::drop().table(Topics::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Topics {
    Table,
    Id,
    Name,
    CreatedAt,
    LastAccessedAt,
}
