# MetaAds Decentraland's Scene

## Description

This project is a Decentraland's scene, the main logic of which is in *'src/game.ts'*. There are three displays on which turn on images and videos that come from the backend service. The specific URL binds to each of displays, and it makes to show some image or video.

## Install

You should install [Node.js](https://nodejs.org/en/) and a few requierements, writting in a terminal the next commands:

```console
npm i -g decentraland 
npm i decentraland-ecs@latest
npm i @dcl/ecs-scene-utils -B
```

## Setup of options

To build the parsel of your scene that you want, should open the json-file ***'scene.json'***. There is object **'scene'** that has two fields: *'parsels'* and *'base'*. If you transform them, you change the location of your scene and respawn in a select point (in local testing). Also there is one more object **'spawnPoints'**, you can change spawn place on the scene just changing coordinates on the **'position'**. And if you want to change your point of view, when you appear on the scene, you should to transform coords in **'cameraTarget'**.

## Run

At the first, open terminal in the project's directory and write the next command:

```console
dcl start
```

Automatically opens a windows in a browser with your scene. It is a locally display of the scene.

## Deploying

To publish the scene to Decentaland's world to write this command:

```console
dcl deploy
```

After it, apears a new tab with button that allows to deploy the scene. Also you should have **Metamask** wallet and bought parsel in the public world.
