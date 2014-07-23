plestecin.js
============

Minimal js/canvas game engine

Why the framework?
------------------

Very simple version of a game engine for educational purposes. All the code is meant to be understandable by
people who do not have any experience in game programming.

Why the name?
-------------

Have a look at this [Twitter discussion](https://twitter.com/BjoernKaiser/status/481437566550695936)

Concepts
--------

The very core of the game engine is the game loop, a plugin system and an abstract concept of a game object. That's it.
 
Game Loop

Plugins

Game Objects

Communication between parts
---------------------------

An eventbus is in place that allows components to communicate with each other without being tightly coupled.

