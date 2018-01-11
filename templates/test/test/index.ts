//import {describe, it} from "mocha";
import {expect} from "chai";

describe("A test", function() {
  it("should prove something useful about the source", function() {
    expect({foo: "hi"}).to.contain.keys(["foo"]);
  });
});
