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


Roadmap to first 0.1 release
----------------------------
- States
  - Each state has a number of game objects associated
  - States can be switched on every tick
  - States can be accessed using their names
  - default state always present, name "default"
- Balls-Game as blueprint in facade
  - Start State and End State with Key-Control in Simple Game Base
  - Ctrl-Z to pause in Simple Game Base
- Rudimentary description of architecture in Readme.md
- Move each module into a namespace of its own
- Add build script (grunt? gulp?)

Things for later releases
-------------------------
- Double Buffering in Canvas
- Collision Detection of Circle with Line (for Borders or Boundaries)
- Mobile Control Plugin
- Animations (through sprite sheets)
- Playing of wave audio
- More JsDoc documentation
- Evaluate web animations http://updates.html5rocks.com/2014/05/Web-Animations---element-animate-is-now-in-Chrome-36
- Port of Hovercraft