use actix::prelude::*;
use actix_web_actors::ws;
use uuid::Uuid;

use crate::websocket_server::{WsChessServer, Connect, Message};

pub struct WsChessSession {
    pub id: Uuid,

    /// Address of the websocket server actor
    pub server_addr: Addr<WsChessServer>,
}

impl WsChessSession {
    pub fn new(addr: Addr<WsChessServer>) -> Self {
        Self {
            id: Uuid::new_v4(),
            server_addr: addr,
        }
    }
}

impl Actor for WsChessSession {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        println!("Chess Session actor started");

        let addr = ctx.address();
        self.server_addr
            .send(Connect {
                addr: addr.recipient(),
            })
            .into_actor(self)
            .then(|res, _, ctx| {
                match res {
                    Ok(_res) => (),
                    _ => ctx.stop(),
                }
                fut::ready(())
            })
            .wait(ctx);
    }
}

impl Handler<Message> for WsChessSession {
    type Result = ();

    fn handle(&mut self, msg: Message, ctx: &mut Self::Context) -> Self::Result {
        ctx.text(msg.0);
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WsChessSession {
    fn handle(&mut self, item: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        let msg = item.expect("Unable to handle Websocket message");

        match msg {
            ws::Message::Text(text) => {
                println!("new message: {}", text);
            }
            _ => (),
        };
    }
}
