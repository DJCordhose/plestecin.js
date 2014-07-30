plestecin.js
============

Minimal js/canvas game engine

Why the framework?
------------------

*Simple*, *modular*, and *minimal* version of a game engine for educational purposes. All the code is meant to be understandable by
people who do not have any experience in game programming.

Why the name?
-------------

Have a look at this [Twitter discussion](https://twitter.com/BjoernKaiser/status/481437566550695936)

Examples
--------


Game Loop
---------

The very core of the game engine is the game loop, a plugin system, an abstract concept of a game object and a means of 
communication between those parts. That's it.
 
Plugins
-------

Game Objects
------------

Communication between parts
---------------------------

An eventbus is in place that allows components to communicate with each other without being tightly coupled.

States
------

- Each state has a number of game objects associated
- States can be switched on every tick
- States can be accessed using their names
- default state always present, name "main"


Roadmap to first 0.1 release
----------------------------
- Port of raw-game
- Rudimentary description of architecture in Readme.md
- Add build script (grunt? gulp?)

Things for later releases
-------------------------
- Double Buffering in Canvas
- Collision Detection of Circle with Line (for Borders or Boundaries)
  - http://devmag.org.za/2009/04/17/basic-collision-detection-in-2d-part-2/
- Mobile Control Plugin
- Animations (through sprite sheets)
- Playing of wave audio
- More JsDoc documentation
- Evaluate web animations http://updates.html5rocks.com/2014/05/Web-Animations---element-animate-is-now-in-Chrome-36
- Port of Hovercraft
- Move each module into a namespace of its own?
