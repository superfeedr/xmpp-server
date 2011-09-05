# xmpp-server

A full XMPP server using node-xmpp, with some modules.
Feel free to fork this and configure all the modules you need in server.js

## Installation // TODO

<strong>Beware : this doesn't work just yet, as we need to merge the C2S code in the master node-xmpp as well as publish a node-xmpp npm that does include this branch. This is work in progress. Feel free to review the code to help make things a bit faster.</strong>

With package manager [npm](http://npmjs.org/):

    npm install xmpp-server

## Running

<code>node bin/server.js</code>

## Motivation

One of the key design choices behind node-xmpp was to keep it very lean and only include the bare minimum. However, if you want to get started and run a server with some actual features without re-implementing the wheel, you can run this


## Dependencies

* [node-xmpp](http://github.com/astro/node-xmpp)

