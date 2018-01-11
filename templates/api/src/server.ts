import * as Hapi from "hapi";
import * as Joi from "joi";

export let server = new Hapi.Server();
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
    reply(`Hello, ${name}!`);
  },
  config: {
    validate: {
      params: {
        name: Joi.string().min(3).max(12)
      }
    }
  }
});

//--------------------------------------------------------------------
// Start
//--------------------------------------------------------------------

server.start((err) => {
  if(err || !server.info) throw err;
  console.info(`Server running at: ${server.info.uri}`);
});
