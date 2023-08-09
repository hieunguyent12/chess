use crate::game_command::{CreateGame, JoinGame, PlayMove};
use actix::prelude::*;
use serde::Serialize;
use std::{collections::HashMap};

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

pub struct WsChessServer {
    sessions: HashMap<Uuid, Recipient<Message>>,
    //                   👇 player 1
    games: HashMap<Uuid, (Uuid, Option<Uuid>)>,
    /*                          👆 player 2 */
}

impl WsChessServer {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
            games: HashMap::new(),
        }
    }
}

impl WsChessServer {
    fn send_message(&self, msg: &str, id: &Uuid) {
        if let Some(recipient) = self.sessions.get(id) {
            recipient.do_send(Message(msg.to_owned()));
        } else {
            println!("attempting to send message but couldn't find user id.");
        }
    }

    /// Send a message to both player in the game
    fn broadcast(&self, msg: &str, game_id: &Uuid) {
        if let Some(game) = self.games.get(game_id) {
            if let Some(addr_player_one) = self.sessions.get(&game.0) {
                addr_player_one.do_send(Message(msg.to_string()));
            }
            
            // check if a second player exist
            if let Some(player_two_id) = game.1 {
                if let Some(addr_player_two) = self.sessions.get(&player_two_id) {
                    addr_player_two.do_send(Message(msg.to_string()));
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
        self.sessions.insert(msg.id, msg.addr.clone());

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
        self.games.insert(id, (msg.player_one_id, None));

        println!("Game created!");

        // Send a status message back to the user who created the room
        self.send_message(&format!("CreateGame {}", id), &msg.player_one_id);

        MessageResult(id) 
    }
}

impl Handler<JoinGame> for WsChessServer {
    type Result = Result<Uuid, String>;

    fn handle(&mut self, msg: JoinGame, _: &mut Self::Context) -> Self::Result {
        println!("Joining game {}", msg.id);

        if let Some(game) = self.games.get_mut(&msg.id) {
            if let (_, Some(_)) = game {
                println!("the game is full, unable to join");
                return Err("Game is full".to_string());
            }
            if let (player_one_id, None) = game {
                (*game).1 = Some(msg.player_id);

                // notify other player that the current player has joined
                // we have to clone the player_one_id here because of https://doc.rust-lang.org/nomicon/lifetime-mismatch.html
                let player_one_id = player_one_id.clone();
                self.send_message(&format!("PlayerJoined {}", msg.player_id), &player_one_id);

                println!("joined game successfully");
            }
        } else {
            println!("game doesn't exist");
            return Err("Game doesn't exist".to_string());
        }

        self.send_message(&format!("JoinGame {}", msg.id), &msg.player_id);
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
