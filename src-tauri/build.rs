fn main() {
    tauri_named_invoke::build("../shared").unwrap();
    tauri_build::build()
}
