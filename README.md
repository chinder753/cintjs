```bash
git submodule init


###
# compile libcint to wasm
###
cd lib/libcint
mkdir build
emcmake cmake ..
# emcc

cd ../../
cp libcint.wasm src/wasm
cp libcint.mjs src/wasm



###
# compile OpenBLAS to wasm
###
cd lib/libcint
mkdir build
emcmake cmake..
# emcc

cd ../../
cp openblas.wasm src/wasm
cp openblas.mjs src/wasm

```