import * as Hapi from "hapi";

export const server = new Hapi.Server();
server.connection({port: 3000, host: "localhost"});

//--------------------------------------------------------------------
// Routes
//--------------------------------------------------------------------

server.route({
  method: "GET",
  path: "/",
  handler: (request, reply) => {
    reply("Hello, world!");
  }
});

server.route({
  method: "GET",
  path: "/{name}",
  handler: (request, reply) => {
    let name = decodeURIComponent(request.params.name);
    reply(`Hello, world! ${name}!`);
  }
});

//--------------------------------------------------------------------
// Start
//--------------------------------------------------------------------

server.start((err) => {
  if(err || !server.info) throw err;
  console.info(`Server running at: ${server.info.uri}`);
});
