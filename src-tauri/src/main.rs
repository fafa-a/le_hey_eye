// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod core;
mod providers;
mod types;
mod utils;

fn main() {
    le_hey_eye_lib::run()
}
