# Modules

Modules are at the heart of XMPP and this xmpp-server in node.js.
The general approach is give a very strong power to all the modules.

## HOW-TO

Each module is loaded when the server starts.  Modules export only a single `configure` which is callbed with 2 params: the `server` itself and the configuration of this specific module (the general configuration file should include a object for each module).

### Configuration

<code>
exports.config = {
    port: 5222, 
    domain: 'zipline.local',
    tls: {
        keyPath: '/etc/xmpp-server/tls/localhost-key.pem',
        certPath: '/etc/xmpp-server/tls/localhost-cert.pem'
    }
    echo: {
        from: "echo@myserver.com"
    }
</code>

Then, your server will trigger 
<code>
    Echo.configure(server, config.echo);
</code>

### Implementation

Then, the module should be able to listen to events on the server, and each of the components of it, as well as objects passed as params to the events.



