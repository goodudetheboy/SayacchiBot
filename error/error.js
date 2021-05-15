module.exports = {
    sendUnknownError: function(message) {
        message.reply('Whoopsie doopsie, there\'s a problem requesting search. Please tell this to the simp that created me.');
        message.reply('オットー、エラーか。これを作成したSIMPに報告してくださいね、フヒヒ。');
    },
    sendErrorCode: function(message, errorCode) {
        message.reply(`Whoopsie doopsie, there\'s a problem. Please tell this to the simp that created me. Error code ${ errorcode }`);
        message.reply(`オットー、エラーか。これを作成したSIMPに報告してくださいね、フヒヒ。エラーコード ${ errorCode }`);        
    }
}
