use actix::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Message, Deserialize, Serialize, Debug)]
#[rtype(result = "Uuid")]
pub struct CreateGame {
    pub name: String,
    pub player_one_id: Uuid,
}

#[derive(Message, Deserialize, Serialize, Debug)]
#[rtype(result = "Result<Uuid, String>")]
pub struct JoinGame {
    pub id: Uuid,
    /// The second player id
    pub player_id: Uuid,
}

pub struct JoinGameResponse(pub Uuid);

#[derive(Message, Deserialize, Serialize, Debug)]
#[rtype(result = "()")]
// #[serde(rename_all = "lowercase")]
pub struct PlayMove {
    from: String,
    to: String,
    promotion_piece: Option<String>,
    // #[serde(skip_serializing)]
    player_id: Uuid,
    #[serde(skip_deserializing)]
    #[serde(skip_serializing)]
    pub game_id: Uuid,
}

#[derive(Debug)]
pub enum GameCommand {
    CreateGame(CreateGame),
    JoinGame(JoinGame),
    PlayMove(PlayMove),
}

/*
    A command has a form of "{commandName} {data}"
    Data is a json string and its structure depends on the command
*/

impl GameCommand {
    pub fn parse_str(s: &str) -> Result<Self, &'static str> {
        let msg = s.split_once(" ");

        match msg {
            Some(("CreateGame", data)) => {
                let game_data = serde_json::from_str::<CreateGame>(data)
                    .map_err(|_| "incorrect data format for CreateGame")?;

                Ok(Self::CreateGame(game_data))
            }

            Some(("JoinGame", data)) => {
                let game_data = serde_json::from_str::<JoinGame>(data)
                    .map_err(|_| "incorrect data format for JoinGame")?;

                Ok(Self::JoinGame(game_data))
            }

            Some(("Move", data)) => {
                let game_data = serde_json::from_str::<PlayMove>(data)
                    .map_err(|_| "incorrect data format for PlayMove")?;

                Ok(Self::PlayMove(game_data))
            }
            _ => Err("Unable to parse command"),
        }
    }
}

impl std::fmt::Display for GameCommand {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}
