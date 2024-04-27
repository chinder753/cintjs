#!/bin/bash

cd ..
tsc -p ./src/ts/tsconfig.json
cp lib/libcint/build/libcint.wasm dist/libcint
cp lib/libxc/build/libxc.wasm dist/libxc
cd tools
