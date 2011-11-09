/**
 * Aggregates UserSession instances
 *
 * Emits 'stanza' for traffic coming from users. Use send() for
 * traffic to users.
 *
 * TODO: inherit from EventEmitter
 */
function SessionManager() {
}

SessionManager.prototype = {
    addClient: function(jid, conn) {
    },

    send: function(stanza) {
    }
};

/**
 * Aggregates ClientSession instances
 */
function UserSession(jid) {
}

/**
 * One client instance of a user
 */
function ClientSession(conn) {

}

ClientSession.prototype = {
    /**
     * Handle stanza from client
     *
     * @param {Function} cb Callback called with (stanza, nextHookCb, replyCb)
     */
    addStanzaHook: function(cb) {
    }
};
