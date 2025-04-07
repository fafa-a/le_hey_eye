use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize, TS)]
#[sea_orm(table_name = "anthropic_models_settings")]
#[ts(
    export,
    export_to = "../../../../shared/types/db/providers/anthropic.ts",
    rename = "AnthropicModelSettings",
    rename_all = "camelCase"
)]
#[serde(rename_all = "camelCase")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(column_type = "Integer")]
    pub topic_id: i32,
    pub budget_tokens: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::topics::Entity",
        from = "Column::TopicId",
        to = "super::topics::Column::Id"
    )]
    Topic,

    #[sea_orm(
        has_one = "super::thinking::Entity",
        from = "Column::TopicId",
        to = "super::thinking::Column::TopicId"
    )]
    Thinking,

    #[sea_orm(
        belongs_to = "super::models_settings::Entity",
        from = "Column::Id", 
        to = "super::models_settings::Column::Id"
    )]
    ModelSettings,
}

impl Related<super::topics::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Topic.def()
    }
}

impl Related<super::thinking::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Thinking.def()
    }
}

impl Related<super::models_settings::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ModelSettings.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

// Fonctions utilitaires pour récupérer les données associées
impl Model {
    // Récupère les paramètres de thinking
    pub async fn get_thinking(
        &self,
        db: &DatabaseConnection,
    ) -> Result<Option<super::thinking::Model>, DbErr> {
        use super::thinking::Entity as ThinkingEntity;

        ThinkingEntity::find()
            .filter(super::thinking::Column::TopicId.eq(self.topic_id))
            .one(db)
            .await
    }

    // Récupère tous les outils associés via providers_tools
    pub async fn get_tools(
        &self,
        db: &DatabaseConnection,
    ) -> Result<
        Vec<(
            super::tools::Model,
            Vec<super::tool_properties::Model>,
            Vec<String>,
        )>,
        DbErr,
    > {
        use super::providers_tools::Entity as ProvidersToolsEntity;
        use super::tools::Entity as ToolsEntity;

        // 1. Récupérer tous les outils associés à ce fournisseur (Anthropic)
        let provider_tools = ProvidersToolsEntity::find()
            .filter(super::providers_tools::Column::ProviderName.eq("anthropic"))
            .all(db)
            .await?;

        let mut result = Vec::new();

        // 2. Pour chaque outil, récupérer ses propriétés et ses champs requis
        for provider_tool in provider_tools {
            let tool = ToolsEntity::find_by_id(provider_tool.tool_id)
                .one(db)
                .await?
                .ok_or_else(|| {
                    DbErr::RecordNotFound(format!(
                        "Tool with id {} not found",
                        provider_tool.tool_id
                    ))
                })?;

            // 3. Récupérer les propriétés
            let properties = tool
                .find_related(super::tool_properties::Entity)
                .all(db)
                .await?;

            // 4. Récupérer les champs requis
            let required_props = tool
                .find_related(super::tool_required_props::Entity)
                .all(db)
                .await?;

            // 5. Extraire les noms des champs requis
            let required_names = required_props
                .into_iter()
                .map(|prop| prop.property_name)
                .collect();

            result.push((tool, properties, required_names));
        }

        Ok(result)
    }

    // Convertit les données normalisées en structure JSON pour Anthropic
    pub async fn to_anthropic_format(
        &self,
        db: &DatabaseConnection,
    ) -> Result<AnthropicModelData, DbErr> {
        // 1. Récupérer les paramètres thinking
        let thinking_config = self.get_thinking(db).await?;

        // 2. Récupérer tous les outils
        let tools_data = self.get_tools(db).await?;

        // 3. Construire la structure JSON pour Anthropic
        let thinking = match thinking_config {
            Some(thinking) => ThinkingConfig {
                budget_tokens: thinking.budget_tokens,
                type_name: if thinking.enabled {
                    "enabled".to_string()
                } else {
                    "disabled".to_string()
                },
            },
            None => ThinkingConfig {
                budget_tokens: 0,
                type_name: "disabled".to_string(),
            },
        };

        // 4. Construire les outils
        let tools = tools_data
            .into_iter()
            .map(|(tool, properties, required)| {
                // 4.1 Construire le schéma des propriétés
                let mut props_map = std::collections::HashMap::new();

                for prop in properties {
                    props_map.insert(
                        prop.name,
                        ToolProperty {
                            type_name: prop.type_name,
                            description: prop.description,
                            required: prop.required,
                        },
                    );
                }

                // 4.2 Construire l'outil complet
                AnthropicTool {
                    name: tool.name,
                    description: tool.description,
                    input_schema: ToolInputSchema {
                        type_name: tool.schema_type,
                        properties: props_map,
                        required,
                    },
                }
            })
            .collect();

        Ok(AnthropicModelData {
            thinking,
            budget_tokens: self.budget_tokens,
            tools: Some(tools),
        })
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AnthropicModelData {
    pub thinking: ThinkingConfig,
    pub budget_tokens: i32,
    pub tools: Option<Vec<AnthropicTool>>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ThinkingConfig {
    pub budget_tokens: i32,
    pub type_name: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AnthropicTool {
    pub name: String,
    pub description: Option<String>,
    pub input_schema: ToolInputSchema,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ToolProperty {
    pub type_name: String,
    pub description: Option<String>,
    pub required: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ToolInputSchema {
    pub type_name: String,
    pub properties: std::collections::HashMap<String, ToolProperty>,
    pub required: Vec<String>,
}
