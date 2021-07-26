module.exports = {
    sendUnknownError: function(message) {
        message.reply('Whoopsie doopsie, there\'s an unknown problem. Please tell this to the simp that created me.');
        message.reply('オットー、エラーか。私を作成したSIMPに報告してくださいね、フヒヒ。');
    },
    sendErrorCode: function(message, errorCode) {
        message.reply(`Whoopsie doopsie, there\'s a problem. Please tell this to the simp that created me. Error code ${ errorCode }`);
        message.reply(`オットー、エラーか。私を作成したSIMPに報告してくださいね、フヒヒ。エラーコード ${ errorCode }`);        
    },
    sendErrorCodeToChannel: function (channel, errorCode) {
        channel.send(`Whoopsie doopsie, there\'s a problem. Please tell this to the simp that created me. Error code ${ errorCode }`);
        channel.send(`オットー、エラーか。私を作成したSIMPに報告してくださいね、フヒヒ。エラーコード ${ errorCode }`);
    }
}
