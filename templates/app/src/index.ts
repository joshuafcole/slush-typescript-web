import {debug} from "efreet/debug";
import {Renderer, uElement} from "efreet/microReact";
import {events, raise, trigger, stop} from "efreet/dispatcher";

let msg = "<%= name %>";

events.on("hello click", "hello/click", function() {
  msg = "and Goodbye!";
  redraw();
});

function $shell() {
  return {c: "shell", children: [
    {text: `Hello, ${msg}!`, click: raise("hello/click")}
  ]};
}

//-----------------------------------------------------
// Rendering
//-----------------------------------------------------

const renderer = new Renderer();

window.addEventListener("load", function() {
  document.body.appendChild(renderer.content);
  redraw();
})

function redraw() {
  if(renderer && !renderer.queued) {
    renderer.queued = true;
    requestAnimationFrame(force_draw);
  }
}

debug.redraw = redraw;

function force_draw() {
  renderer.render([$shell()]);
  renderer.queued = false;
}
