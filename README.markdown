# xmpp-server

A full XMPP server using node-xmpp, with some modules. Feel free to fork this and configure all the modules you need in server.js
This server uses Redis as its datastore. 

## Installation 

<strong>Beware : this project is really early stage... There are a lot of things to fix :) Install it for fun or for help... but probably not for profit just yet!</strong>

1. First, you need **nodejs** installed. Pre-compiled packages exist for Unix (Linux, BSD, Mac OS X) as explained in [these instructions](https://github.com/joyent/node/wiki/Installation). Skip to 2. if you already have a working Node.JS environment.

2. Then, you need **npm** installed. As in step 1, follow [these instructions](http://howtonode.org/introduction-to-npm) or skip to 3.

3. Install **redis** (used to store the data). <code>apt-get install redis-server</code> should work just fine on most Ubuntus and Debians. On MacOS X redis can be installed e.g. with Homebrew: <code>brew install redis</code>

4. Install xmpp-server, finally. With package manager [npm](http://npmjs.org/):

<code>npm install -g xmpp-server </code>

## Running

*TODO : automate this with a script that asks the right questions to the user when starting.*

First, create a config file and place it at <code>/etc/xmpp-server/config.js</code> that includes the following (tls support is optional. You can follow the <a href="http://nodejs.org/docs/v0.4.11/api/tls.html#tLS_">instructions there</a> to create the key and certificate, and then uncomment the <code>tls</code> lines.):

<pre>
    <code>
    exports.config = {
        port: 5222, 
        domain: 'localhost',
        //tls: {
        //    keyPath: '/etc/xmpp-server/tls/localhost-key.pem',
        //    certPath: '/etc/xmpp-server/tls/localhost-cert.pem'
        //}
    }
    </code>
</pre>

Then, run the server: 

<code>xmpp-server /etc/xmpp-server/config.js </code>

## Trying

There is a server running at [ouvre-boite.com](xmpp://ouvre-boite.com). You can certainly create an account there, but don't leave any valuable belongings as they will be trashed every couple hours :)

## TODO

* <del>In-band registration</del>
* <del>C2S</del>
* <del>TLS</del>
* Digets Auth
* Roster
* Presence
* Pass on global configuration to modules.


## Dependencies

* [node-xmpp](http://github.com/astro/node-xmpp)
* [redis](https://github.com/mranney/node_redis)
