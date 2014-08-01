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

TypeScript
----------

The game engine has been written entirely in TypeScript. You can program your own game in TypeScript as well or just
use the library as JavaScript and do your own coding in JavaScript as well.

Examples
--------

There are a couple of examples in the *src/examples* folder.
- balls: very simple, but complete game, illustrates game control, logic and physics
- wurfram: more complex, has game states and sprites, and more complex game logic

Game Loop
---------

The very core of the game engine is the game loop to be found in *plestecin.ts*. Based on that core there is a plugin system, 
an abstract concept of a game object, game states and a means of communication between parts of the game. That's it.
 
Plugins
-------


Game Objects
------------

Communication between parts
---------------------------

An eventbus (defined in *util.ts*) is in place that allows components to communicate with each other without being tightly coupled.

States
------
- Different phases or levels of the game are represented as states
- A state can represent a start screen and a game over screen
- Different levels or stages can also be states
- States are thus a means of organizing and structuring your game
- Each state has a number of game objects associated
- States can be switched on every tick of the game loop
- States can be accessed using their names
- default state always present, name "main"

Roadmap to first 0.1 release
----------------------------
- Port of raw-game (as hello world)
- Port of snake-game
- Rudimentary description of architecture in Readme.md
- Add build script (grunt? gulp?) creating JavaScript and .d.ts files for external declarations

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
