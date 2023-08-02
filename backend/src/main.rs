use futures_util::{future, StreamExt, TryStreamExt};
use std::{env, io::Error as IoError};
use tokio::{self, net::TcpListener};

#[tokio::main]
async fn main() -> Result<(), IoError> {
    let addr = env::args()
        .nth(1)
        .unwrap_or_else(|| "127.0.0.1:8080".to_string());

    let try_socket = TcpListener::bind(&addr).await;
    let listener = try_socket.expect("Failed to bind TcpListener");
    println!("Listening on {}", addr);

    while let Ok((stream, addr)) = listener.accept().await {
        tokio::spawn(async {
            let addr = stream.peer_addr().expect("peer address not found");
            println!("Peer address: {}", addr);

            let mut ws_stream = tokio_tungstenite::accept_async(stream)
                .await
                .expect("Error during the websocket handshake");

            println!("New websocket connection {}", addr);

            while let Some(msg) = ws_stream.next().await {
                let msg = msg.expect("unable to read message");

                println!("{}: {}", addr, msg);
            }

            // TODO:
            // keep track of connected clients
            // create a unique room

            // read.try_filter(|msg| {
            //     println!("{}", msg);
            //     future::ready(msg.is_text() || msg.is_binary())
            // })
            // .forward(write)
            // .await
            // .expect("Failed to forward messages")
        });
    }

    Ok(())
}
