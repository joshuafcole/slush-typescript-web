import {Renderer, uElement} from "./framework/microReact";
import {Keys, Dispatcher, events, raise, trigger, stop} from "./framework/dispatcher";

function $shell():uElement {
  return {c: "shell", children: [
    {text: "Hello, <%= name %>!"}
  ]};
}

//-----------------------------------------------------
// Rendering
//-----------------------------------------------------

const renderer = new Renderer();
(window as any)["renderer"] = renderer; // @DEBUG

window.addEventListener("load", function() {
  document.body.appendChild(renderer.content);
  redraw();
})

function redraw() {
  let renderer = (window as any)["renderer"];
  if(renderer && !renderer.queued) {
    renderer.queued = true;
    requestAnimationFrame(force_draw);
  }
}
(window as any)["redraw_editor"] = redraw; // @DEBUG

function force_draw() {
  renderer.render([$shell()]);
  renderer.queued = false;
}
