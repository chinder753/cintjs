#!/bin/bash

cd lib/libcint
mkdir build
cd build
emcmake cmake ..
emmake make -j
emcc libcint.a -o libcint.mjs --emit-symbol-map -O3 -sMODULARIZE=1 -sEXPORT_ES6=1 -sEXPORT_NAME="libcint" -sALLOW_MEMORY_GROWTH -sEXPORTED_FUNCTIONS=@../func.txt
cd ../../../
cp lib/libcint/build/libcint.mjs src/libcint
