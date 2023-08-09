use actix::{Actor, Addr};
use actix_web::{dev::Server, get, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;

use crate::{session::WsChessSession, websocket_server::WsChessServer};

pub struct ChessServer<'a> {
    pub address: &'a str,
    pub port: u16,
}

impl<'a> ChessServer<'a> {
    pub fn build(&self) -> Result<Server, Error> {
        let websocket_server = WsChessServer::new().start();

        let server = HttpServer::new(move || {
            App::new()
                // .route("/", web::get().to(hello))
                // .route("/ws/", web::get().to(websocket))
                .app_data(web::Data::new(websocket_server.clone()))
                .service(websocket)
        })
        .bind(("127.0.0.1", 8080))?
        .run();

        Ok(server)
    }
} 

#[get("/ws")]
async fn websocket(
    req: HttpRequest,
    stream: web::Payload,
    ws_server: web::Data<Addr<WsChessServer>>,
) -> Result<HttpResponse, Error> {
    ws::start(
        WsChessSession::new(ws_server.get_ref().clone()),
        &req,
        stream,
    )
}
