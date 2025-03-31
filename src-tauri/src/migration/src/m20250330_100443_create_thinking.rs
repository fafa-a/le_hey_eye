use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {

        manager
            .create_table(
                Table::create()
                    .table(Thinking::Table)
                    .if_not_exists()
                    .col(pk_auto(Thinking::Id))
                    .col(string(Thinking::TopicId).not_null())
                    .col(string(Thinking::BudgetTokens).not_null())
                    .col(boolean(Thinking::Enabled).not_null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        
        manager
            .drop_table(Table::drop().table(Thinking::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Thinking {
    Table,
    Id,
    TopicId,
    BudgetTokens,
    Enabled,
}
