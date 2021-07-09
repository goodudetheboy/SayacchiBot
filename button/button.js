const Error = require('../error/error.js');

module.exports = {
    run(client, button) {
        let args = button.id.split("_");
        switch (args[0]) {
            case "oddEven":
                diceGameCheck(client, button, args[1]);
        }
    }
}

function diceGameCheck(client, button, answer) {
    let rolldice = client.commands.get("rolldice");
    rolldice.check(client, button, answer);
}
