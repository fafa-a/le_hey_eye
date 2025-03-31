pub use sea_orm_migration::prelude::*;

mod m20250327_224657_create_app_appearance;
mod m20250327_224711_create_provider_tools;
mod m20250327_224721_create_topics;
mod m20250327_224740_create_models_settings;
mod m20250327_224759_create_anthropic_model_settings;
mod m20250327_224808_create_messages;
mod m20250330_100443_create_thinking;
mod m20250330_100509_create_tool_properties;
mod m20250330_100533_create_tool_required_props;
mod m20250330_100601_create_tools;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20250327_224657_create_app_appearance::Migration),
            Box::new(m20250327_224711_create_provider_tools::Migration),
            Box::new(m20250327_224721_create_topics::Migration),
            Box::new(m20250327_224740_create_models_settings::Migration),
            Box::new(m20250327_224759_create_anthropic_model_settings::Migration),
            Box::new(m20250327_224808_create_messages::Migration),
            Box::new(m20250330_100443_create_thinking::Migration),
            Box::new(m20250330_100509_create_tool_properties::Migration),
            Box::new(m20250330_100533_create_tool_required_props::Migration),
            Box::new(m20250330_100601_create_tools::Migration),
        ]
    }
}
