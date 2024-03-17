#!/bin/bash

tsc -p ./ts/src/tsconfig.json
cp lib/libcint/build/libcint.wasm dist/libcint
cp lib/libxc/build/libxc.wasm dist/libxc
