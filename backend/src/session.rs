use actix::prelude::*;
use actix_web_actors::ws;
use uuid::Uuid;

use crate::game_command::GameCommand;
use crate::websocket_server::{Connect, ErrMessage, Message, WsChessServer};

/// A actor struct representing an ongoing websocket session between client and server
pub struct WsChessSession {
    id: Uuid,

    /// Address of the websocket server actor
    server_addr: Addr<WsChessServer>,

    /// joined game
    game: Option<Uuid>,
}

impl WsChessSession {
    pub fn new(addr: Addr<WsChessServer>) -> Self {
        Self {
            id: Uuid::new_v4(),
            server_addr: addr,
            game: None,
        }
    }

    // /// Send a message to a the websocket server
    // fn send_to_ws_server<M: Message>(&self, msg: M, ctx: &mut Self::Context) {
    //     self.server_addr
    //         .send(msg)
    //         .into_actor(self)
    //         .then(|res, _, ctx| {
    //             match res {
    //                 Ok(_res) => (),
    //                 _ => ctx.stop(),
    //             }
    //             fut::ready(())
    //         })
    //         .wait(ctjx);
    // }
}

impl Actor for WsChessSession {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        println!("Chess Session actor started");

        let addr = ctx.address();
        self.server_addr
            .send(Connect {
                id: self.id,
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

impl Handler<ErrMessage> for WsChessSession {
    type Result = ();

    fn handle(&mut self, msg: ErrMessage, ctx: &mut Self::Context) -> Self::Result {
        ctx.text(msg.0);
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WsChessSession {
    fn handle(&mut self, item: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        let msg = item.expect("Unable to handle Websocket message");

        match msg {
            ws::Message::Text(text) => {
                println!("new message: {}", text);
                let game_action = GameCommand::parse_str(&text);
                match game_action {
                    Ok(action) => {
                        println!("action: {}", action);

                        match action {
                            GameCommand::CreateGame(msg) => {
                                self.server_addr
                                    .send(msg)
                                    .into_actor(self)
                                    .then(|res, actor, ctx| {
                                        match res {
                                            Ok(game_id) => actor.game = Some(game_id),
                                            _ => ctx.stop(),
                                        }
                                        fut::ready(())
                                    })
                                    .wait(ctx);
                            }

                            GameCommand::JoinGame(msg) => {
                                self.server_addr
                                    .send(msg)
                                    .into_actor(self)
                                    .then(|res, actor, ctx| {
                                        match res {
                                            Ok(res_data) => match res_data {
                                                Ok(game_id) => actor.game = Some(game_id),
                                                Err(msg) => {
                                                    println!("{}", msg);
                                                    ctx.address().do_send(ErrMessage::new(msg));
                                                }
                                            },
                                            _ => ctx.stop(),
                                        }
                                        fut::ready(())
                                    })
                                    .wait(ctx);
                            }
                            GameCommand::PlayMove(mut msg) => {
                                if let Some(game_id) = self.game {
                                    msg.game_id = game_id;

                                    self.server_addr
                                        .send(msg)
                                        .into_actor(self)
                                        .then(|res, _, ctx| {
                                            match res {
                                                Ok(_res) => (),
                                                _ => ctx.stop(),
                                            }
                                            fut::ready(())
                                        })
                                        .wait(ctx);
                                } else {
                                    println!("game must exist to play");
                                    ctx.stop();
                                }
                            }
                            GameCommand::UpdateName(msg) => {
                                self.server_addr
                                    .send(msg)
                                    .into_actor(self)
                                    .then(|res, _, ctx| {
                                        match res {
                                            Ok(_) => (),
                                            _ => ctx.stop(),
                                        }
                                        fut::ready(())
                                    })
                                    .wait(ctx);
                            }
                            GameCommand::UpdateGameStatus(msg) => {
                                self.server_addr
                                    .send(msg)
                                    .into_actor(self)
                                    .then(|res, _, ctx| {
                                        match res {
                                            Ok(_) => (),
                                            _ => ctx.stop(),
                                        }
                                        fut::ready(())
                                    })
                                    .wait(ctx);
                            }
                        };
                    }
                    Err(e) => {
                        println!("error parsing cmd: {}", e);
                        ctx.stop();
                    }
                }
            }
            _ => (),
        };
    }
}
