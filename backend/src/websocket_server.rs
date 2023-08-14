use crate::game_command::{CreateGame, JoinGame, PlayMove, UpdateGameStatus, UpdateName};
use actix::prelude::*;
use serde::Serialize;
use std::collections::HashMap;

use uuid::Uuid;

#[derive(Message)]
#[rtype(result = "()")]
pub struct Message(pub String);

#[derive(Message)]
#[rtype(result = "()")]
pub struct ErrMessage(pub String);

impl ErrMessage {
    pub fn new(msg: String) -> Self {
        Self(format!("Error {}", msg))
    }
}

#[derive(Message, Serialize)]
#[rtype(result = "()")]
pub struct Connect {
    /// the player id
    pub id: Uuid,

    #[serde(skip_serializing)]
    /// the address of the session actor
    pub addr: Recipient<Message>,
}

#[derive(Serialize)]
pub struct PlayerId {
    id: String,
}

struct Game {
    name: String,
    player_one: Uuid,
    player_one_color: String,
    player_two: Option<Uuid>,
    player_two_color: String,
}

impl Game {
    fn new(name: String, player_one: Uuid, player_one_color: String) -> Self {
        Self {
            name,
            player_one,
            player_one_color: player_one_color.clone(),
            player_two: None,
            player_two_color: match player_one_color.as_str() {
                "w" => String::from("b"),
                "b" => String::from("w"),
                _ => panic!("unable to parse color"),
            },
        }
    }
}

// impl WsServerState for InMemoryState {}

pub struct WsChessServer {
    /// A session holds the name of the player and its actor address to send messages to
    sessions: HashMap<Uuid, (String, Recipient<Message>)>,

    games: HashMap<Uuid, Game>,
}

impl WsChessServer {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
            games: HashMap::new(),
        }
    }

    fn send_message(&self, msg: &str, id: &Uuid) {
        if let Some(session) = self.sessions.get(id) {
            let recipient = &session.1;
            recipient.do_send(Message(msg.to_owned()));
        } else {
            println!("attempting to send message but couldn't find user id.");
        }
    }

    /// Send a message to both player in the game
    fn broadcast(&self, msg: &str, game_id: &Uuid) {
        if let Some(game) = self.games.get(game_id) {
            if let Some(session) = self.sessions.get(&game.player_one) {
                let player_one_addr = &session.1;
                player_one_addr.do_send(Message(msg.to_string()));
            }

            // check if a second player exist
            if let Some(player_two_id) = game.player_two {
                if let Some(session) = self.sessions.get(&player_two_id) {
                    let player_two_addr = &session.1;
                    player_two_addr.do_send(Message(msg.to_string()));
                }
            }
        }
    }
}

impl Actor for WsChessServer {
    type Context = Context<Self>;
}

impl Handler<Connect> for WsChessServer {
    type Result = ();

    fn handle(&mut self, msg: Connect, _: &mut Self::Context) -> Self::Result {
        println!("Someone connected!");

        // register session with unique id
        // each player will be assigned this unique id
        self.sessions
            .insert(msg.id, ("".to_string(), msg.addr.clone()));

        let res = format!(
            "Connect {}",
            &serde_json::to_string(&msg).expect("Unable to parse player id")
        );

        self.send_message(&res, &msg.id);
    }
}

impl Handler<CreateGame> for WsChessServer {
    type Result = MessageResult<CreateGame>;

    fn handle(&mut self, msg: CreateGame, _: &mut Self::Context) -> Self::Result {
        println!("Creating game");

        let id = Uuid::new_v4();
        self.games
            .insert(id, Game::new(msg.name, msg.player_one_id, msg.color));

        println!("Game created!");

        // Send a status message back to the user who created the room
        self.send_message(&format!("CreateGame {}", id), &msg.player_one_id);

        MessageResult(id)
    }
}

impl Handler<JoinGame> for WsChessServer {
    type Result = Result<Uuid, String>;

    fn handle(&mut self, mut msg: JoinGame, _: &mut Self::Context) -> Self::Result {
        println!("Joining game {}", msg.id);

        if let Some(game) = self.games.get_mut(&msg.id) {
            if game.player_two.is_some() {
                println!("the game is full, unable to join");
                return Err("Game is full".to_string());
            }

            if game.player_two.is_none() {
                game.player_two = Some(msg.player_id);

                let player_two_color = game.player_two_color.clone();
                let gameName = game.name.clone();

                // notify other player that the current player has joined
                // we have to clone the player_one_id here because of https://doc.rust-lang.org/nomicon/lifetime-mismatch.html
                let player_one_id = game.player_one.clone();
                let player_one_name = &self
                    .sessions
                    .get(&player_one_id)
                    .expect("This isn't supposed to happen")
                    .0;

                msg.color = game.player_one_color.clone();
                let res = serde_json::to_string::<JoinGame>(&msg).map_err(|e| e.to_string())?;
                self.send_message(&format!("PlayerJoined {}", res), &player_one_id);

                // send a message that contains the player one info to the second player
                let new_msg = JoinGame {
                    id: msg.id,
                    player_id: player_one_id,
                    player_name: player_one_name.clone(),
                    // also let the player two knows what color they're playing as
                    color: player_two_color,
                };
                let mut res =
                    serde_json::to_string::<JoinGame>(&new_msg).map_err(|e| e.to_string())?;
                res.insert_str(1, &format!("\"name\":\"{}\",", gameName));

                self.send_message(&format!("JoinGame {}", res), &msg.player_id);

                println!("joined game successfully");
            }
        } else {
            println!("game doesn't exist");
            return Err("Game doesn't exist".to_string());
        }

        return Ok(msg.id);
    }
}

impl Handler<PlayMove> for WsChessServer {
    type Result = ();

    fn handle(&mut self, msg: PlayMove, _: &mut Self::Context) -> Self::Result {
        println!("Making move");
        let res = serde_json::to_string::<PlayMove>(&msg);

        match res {
            Ok(m) => {
                self.broadcast(&format!("PlayMove {}", m), &msg.game_id);
            }
            Err(_) => {
                println!("Error parsing move");
            }
        }
    }
}

impl Handler<UpdateName> for WsChessServer {
    type Result = ();

    fn handle(&mut self, msg: UpdateName, _: &mut Self::Context) -> Self::Result {
        if let Some(session) = self.sessions.get_mut(&msg.id) {
            if msg.name.len() <= 50 {
                (*session).0 = msg.name;
            }
        } else {
            println!("game doesn't exist when updating name");
        }
    }
}

impl Handler<UpdateGameStatus> for WsChessServer {
    type Result = ();

    fn handle(&mut self, msg: UpdateGameStatus, _: &mut Self::Context) -> Self::Result {
        self.send_message(&msg.status, &msg.to_id);
    }
}
