```bash
git submodule init
git submodule update

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


```