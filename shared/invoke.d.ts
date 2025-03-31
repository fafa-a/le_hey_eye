import * as tauri from '@tauri-apps/api/tauri';
declare module '@tauri-apps/api/tauri' {
    type Commands = 
		  'send_message'
		| 'get_all_topics'
		| 'get_messages_by_topic'
		| 'add_topic'
		| 'add_message'
		| 'remove_topic'
		| 'edit_topic_name'
		| 'remove_messages'
		| 'update_topic_access'
		| 'get_last_accessed_topic'
		| 'call_cloudflare_api'
		| 'get_all_cloudflare_ai_models'
		| 'save_credentials'
		| 'get_cloudflare_ai_models_details'
		| 'get_credentials';
    function invoke<T>(cmd: Commands, args?: InvokeArgs): Promise<T>;
}