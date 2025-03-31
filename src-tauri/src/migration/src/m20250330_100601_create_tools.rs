use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {

        manager
            .create_table(
                Table::create()
                    .table(Tools::Table)
                    .if_not_exists()
                    .col(pk_auto(Tools::Id))
                    .col(string(Tools::Name).not_null())
                    .col(string(Tools::Description))
                    .col(string(Tools::SchemaType).not_null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {

        manager
            .drop_table(Table::drop().table(Tools::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Tools {
    Table,
    Id,
    Name,
    Description,
    SchemaType,
}
