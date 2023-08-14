use actix::{Actor, Addr};
use actix_web::{dev::Server, get, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;

use crate::config::Settings;
use crate::websocket::{server::WsChessServer, session::SessionActor, servers::in_memory::InMemoryServer};

pub struct ChessServer {
    config: Settings,
}

impl ChessServer {
    pub fn new(config: Settings) -> Self {
        Self { config }
    }

    pub fn build(&self) -> Result<Server, Error> {
        let in_memory_state = InMemoryServer::default();
        let websocket_server = WsChessServer::new(in_memory_state).start();

        let host = self.config.app.host.as_str();
        let port = self.config.app.port;

        let server = HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(websocket_server.clone()))
                .service(websocket)
        })
        .bind((host, port))?
        .run();

        Ok(server)
    }
}

#[get("/ws")]
async fn websocket(
    req: HttpRequest,
    stream: web::Payload,
    ws_server: web::Data<Addr<WsChessServer<InMemoryServer>>>,
) -> Result<HttpResponse, Error> {
    ws::start(SessionActor::new(ws_server.get_ref().clone()), &req, stream)
}





