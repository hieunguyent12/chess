use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub enum GameAction {
    CreateRoom(String),
}

impl GameAction {
    pub fn parse_str(s: &str) -> Self {
        match serde_json::from_str::<Self>(s) {
            Ok(action) => action,
            Err(_) => panic!()
        }
    }
}
