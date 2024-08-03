# Events Drop

[![Events Drop Demo](demo.gif)](https://www.loom.com/share/f887e4d6b7da4e0a8d92f83403c48d90)

## About

A Figma plugin for communicating and proposing analytics instrumentation between members of the product team. ([Demo](https://www.loom.com/share/f887e4d6b7da4e0a8d92f83403c48d90))

Figma plugins have an isolated UI made up of HTML/JS/CSS (start in `ui.html` in this project) and a separate file (`src/code.tsx`) that actually interacts with the Figma API (e.g. the Canvas and all). There is a event messaging system for passing data back and forth. Figma recommends Typescript, and webpack is handling all the bundling here.

### Note on the events data:
This was built with a bootstrapped JSON list of events for my org that I regenerate with a Python script. If you want to use it, you'll want to add your own, and optimally, load those dynamically, which is on the TODO list :)

## Run it with updates after save

```npm run build -- --watch```

Then you'll need to import the plugin into your Figma environement. You'll be asked to point to your `manifest.json` file.