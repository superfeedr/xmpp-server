# xmpp-server

A full XMPP server using node-xmpp, with some modules. Feel free to fork this and configure all the modules you need in server.js
This server uses Redis as its datastore. You need to install [redis >2.2.x](http://redis.io/) and configure it accordingly.

## Installation // TODO

<strong>Beware : this doesn't work just yet, as we need to merge the C2S code in the master node-xmpp as well as publish a node-xmpp npm that does include this branch. This is work in progress. Feel free to review the code to help make things a bit faster.</strong>

1. First, you need **nodejs** installed. Follow [these instructions](https://github.com/joyent/node/wiki/Installation), or skip to 2. if you have it already.

2. Then, you need **npm** installed. Same, follow [these instructions](http://howtonode.org/introduction-to-npm) or skip to 3.

3. Install **redis** (used to store the data). <code>apt-get install redis</code> should work just fine on most Ubuntus and Debians. Again, skip if you have it!

4. Install xmpp-server, finally. With package manager [npm](http://npmjs.org/):

    npm install -g xmpp-server 

## Running

TODO : we could automate this with a script that asks the right questions to the user when starting.

First, create a config file and place it at <code>/etc/xmpp-server/config.js</code> that includes the following (tls support is optional. You can follow the <a href="http://nodejs.org/docs/v0.4.11/api/tls.html#tLS_">instructions there</a> to create the key and certificate, and then uncomment the <code>tls</code> lines.):

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

Then, run the server: 

<code>xmpp-server /etc/xmpp-server/config.js </code>

## Motivation

One of the key design choices behind node-xmpp was to keep it very lean and only include the bare minimum. However, if you want to get started and run a server with some actual features without re-implementing the wheel, you can run this


## Dependencies

* [node-xmpp](http://github.com/astro/node-xmpp)

