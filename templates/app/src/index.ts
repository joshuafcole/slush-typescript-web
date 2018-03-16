import {debug} from "efreet/debug";
import {Renderer, uElement} from "efreet/microReact";
import {events, raise, trigger, stop} from "efreet/dispatcher";
import {$shell} from "./client";

//-----------------------------------------------------
// Rendering
//-----------------------------------------------------

const renderer = new Renderer();

window.addEventListener("load", function() {
  document.body.appendChild(renderer.content);
  trigger("shell/loaded", {}, {});
});

function redraw() {
  if(renderer && !renderer.queued) {
    renderer.queued = true;
    requestAnimationFrame(forceDraw);
  }
}

debug.redraw = redraw;

events.eventRaised = (ev) => {
  redraw();
};

function forceDraw() {
  renderer.render([$shell()]);
  renderer.queued = false;
}
