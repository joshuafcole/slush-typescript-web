import commander from "commander";
import * as pkg from "../../package.json";

commander
  .version(pkg.version)
  .option("-t, --test-flag", "Implement me!")
  .command("do-a-thing", "Simple demo command")
  .action((args) => {
    console.log("@IMPLEMENT ME!", args);
    process.exit(0);
  })
  .parse(process.argv);
