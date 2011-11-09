/**
 * Aggregates UserSession instances
 *
 * Emits 'stanza' for traffic coming from users. Use send() for
 * traffic to users.
 *
 * TODO: inherit from EventEmitter
 */
exports.SessionManager = function() {
    this.userSessions = {};
};

exports.SessionManager.prototype.addClient = function(jid, conn) {
    var userSession = this.userSessions[jid];
    if (!userSession)
	userSession = this.userSessions[jid] = new exports.UserSession(jid);

    userSession.addClient(conn);
};

/**
 * Aggregates ClientSession instances
 */
exports.UserSession = function(jid) {
    this.jid = jid;
    this.clientSessions = [];
}

exports.UserSession.prototype.addClient = function(conn) {
    this.clientSessions.push(new exports.ClientSession(conn));
};

/**
 * One client instance of a user
 */
exports.ClientSession = function(conn) {
    var that = this;
    this.conn = conn;

    this.conn.on('stanza', function(stanza) {
	that.onStanza(stanza);
    });
};

var stanzaHooks = [];
exports.ClientSession.prototype.onStanza = function(stanza) {
    var that = this;
    var hooks = stanzaHooks.slice(0);  // clone

    var replyCb = function(reply) {
	that.conn.send(reply);
    };

    var nextCb = function() {
	var cb;
	if ((cb = hooks.shift())) {
	    cb(stanza, nextCb, replyCb);
	}
    };
    nextCb();
};

/**
 * Handle stanza from client
 *
 * @param {Function} cb Callback called with (stanza, nextHookCb, replyCb)
 */
exports.addStanzaHook = function(cb) {
    stanzaHooks.push(cb);
};
