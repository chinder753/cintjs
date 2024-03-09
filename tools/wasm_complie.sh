#!/bin/bash

cd ..

###
# libcint
###
cd lib/libcint
mkdir build
cd build
emcmake cmake ..
emmake make -j
emcc libcint.a -o libcint.mjs --emit-symbol-map -O3 -sMODULARIZE=1 -sEXPORT_ES6=1 -sEXPORT_NAME="libcint" -sALLOW_MEMORY_GROWTH -sEXPORTED_FUNCTIONS=@../func.txt


###
# libxc
###
cd ../../libxc
mkdir build
cd build
emcmake cmake ..
emmake make -j
wget https://raw.githubusercontent.com/pyscf/pyscf/master/pyscf/lib/dft/CxLebedevGrid.c
emcc CxLebedevGrid.c libxc.a -o libxc.mjs --emit-symbol-map -O3 -sMODULARIZE=1 -sALLOW_MEMORY_GROWTH -sLINKABLE
# emcc CxLebedevGrid.c -o lebedev.mjs --emit-symbol-map -O3 -sMODULARIZE=1 -sALLOW_MEMORY_GROWTH -sEXPORTED_FUNCTIONS=_MakeAngularGrid


###
# mjs
###
cd ../../../
cp lib/libcint/build/libcint.mjs src/libcint
cp lib/libxc/build/libxc.mjs src/libxc
