use actix::{Actor, StreamHandler};
use actix_web::{dev::Server, web, App, Error, HttpRequest, HttpResponse, HttpServer, Responder};
use actix_web_actors::ws;

pub struct ChessServer<'a> {
    pub address: &'a str,
    pub port: u16,
}

impl<'a> ChessServer<'a> {
    pub fn build(&self) -> Result<Server, Error> {
        let server = HttpServer::new(|| {
            App::new()
                // .route("/", web::get().to(hello))
                // .route("/ws/", web::get().to(websocket))
                .service(web::resource("/ws").route(web::get().to(websocket)))
        })
        .bind(("127.0.0.1", 8080))?
        .run();
        Ok(server)
    }
}

struct ChessWs;

impl Actor for ChessWs {
    type Context = ws::WebsocketContext<Self>;
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for ChessWs {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => ctx.pong(&msg),
            Ok(ws::Message::Text(text)) => ctx.text(text),
            Ok(ws::Message::Binary(bin)) => ctx.binary(bin),
            _ => (),
        }
    }
}

async fn websocket(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    let resp = ws::start(ChessWs {}, &req, stream);

    resp
}
