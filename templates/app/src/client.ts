import {events, raise} from "efreet/dispatcher";

import "../styles/base.styl";

let msg = "<%= name %>";

events.on("hello click", "hello/click", () => {
  msg = "and goodbye!";
});

export function $shell() {
  return {c: "shell", children: [
    {text: `Hello, ${msg}`, click:raise("hello/click")}
  ]};
}
