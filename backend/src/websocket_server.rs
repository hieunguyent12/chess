use actix::prelude::*;
use std::collections::HashMap;

use uuid::Uuid;

#[derive(Message)]
#[rtype(result = "()")]
pub struct Message(pub String);

#[derive(Message)]
#[rtype(result = "()")]
pub struct Connect {
    pub addr: Recipient<Message>,
}

pub struct WsChessServer {
    sessions: HashMap<Uuid, Recipient<Message>>,
}

impl WsChessServer {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
        }
    }
}

impl WsChessServer {
    fn send_message(&self, msg: &str, id: &Uuid) {
        if let Some(recpient) = self.sessions.get(id) {
            recpient.do_send(Message(msg.to_owned()));
        } else {
            println!("attempting to send message but couldn't find user id.");
        }
    }
}

impl Actor for WsChessServer {
    type Context = Context<Self>;
}

impl Handler<Connect> for WsChessServer {
    type Result = ();

    fn handle(&mut self, msg: Connect, ctx: &mut Self::Context) -> Self::Result {
        println!("Someone connected!");

        // register session with unique id
        let id = Uuid::new_v4();
        self.sessions.insert(id, msg.addr);

        self.send_message(&format!("Your id is {}", id), &id);

        // send the unique session id back
        ()
    }
}
