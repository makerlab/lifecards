
import { contentType } from "https://deno.land/x/media_types/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";

// todo - invent some way to do a spa app from the server side - maybe scan for real files?

// Start listening on port 8080 of localhost.
const port = Deno.env.get("PORT") || 8080
const server = Deno.listen({ port });
console.log(`File server running on http://localhost:${port}/`);

for await (const conn of server) {
  handleHttp(conn).catch(console.error);
}

async function handleHttp(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {

    // Use the request pathname as filepath
    const url = new URL(requestEvent.request.url);

    // fix up root doc
    if(url.pathname.length < 2) url.pathname = "index.html"

    let filepath = decodeURIComponent(url.pathname);

    // get mimetype
    let mimetype = filepath.match(/\.[0-9a-z]+$/i)

    // get stats if any
    let fileInfo = await Deno.stat("."+filepath);

    // SPA support - any folder like thing always returns the index
    if(!mimetype || (fileInfo && fileInfo.isFile==false)) {
      filepath = "/index.html"
      fileInfo = await Deno.stat("."+filepath);
    }

    // found the file? disallow folders in general again
    if (!fileInfo || !fileInfo.isFile) {
      const notFoundResponse = new Response("404 Not Found", { status: 404 });
      await requestEvent.respondWith(notFoundResponse);
      return;
    }

    // Try opening the file as a stream
    let file = 0;
    try {
      file = await Deno.open("." + filepath, { read: true });
    } catch {
      console.log("not found " + filepath)
      const notFoundResponse = new Response("404 Not Found", { status: 404 });
      await requestEvent.respondWith(notFoundResponse);
      return;
    }

    const headers = new Headers();
    const contentTypeValue = contentType(path.extname(filepath));
    if (contentTypeValue) {
      headers.set("content-type", contentTypeValue);
    } else {
      //headers.set("content-type", "text/plain; charset=utf-8");
    }

    headers.set("content-length", fileInfo.size.toString());

    // Build a readable stream so the file doesn't have to be fully loaded into
    // memory while we send it
    const readableStream = file.readable;

    // Build and send the response
    const response = new Response(readableStream, { headers } );

    await requestEvent.respondWith(response);
  }
}