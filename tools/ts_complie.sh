#!/bin/bash

tsc -p ./src/tsconfig.json
cp lib/libcint/build/libcint.wasm dist/libcint
cp lib/libxc/build/libxc.wasm dist/libxc
