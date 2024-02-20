```bash
git submodule init
git submodule update

###
# generate func.txt
###
cd tools/
python3 get_func.py
cd ..
cp func.txt lib/libcint

###
# compile libcint to wasm
###
cd lib/libcint
mkdir build
emcmake cmake ..
emcc libcint.a -o libcint.mjs --emit-symbol-map -O3 -MODULARIZE=1 -sALLOW_MEMORY_GROWTH -sEXPORTED_FUNCTIONS=@../func.txt

cd ../../
cp lib/libcint/build/libcint.wasm src/wasm
cp lib/libcint/build/libcint.mjs src/wasm


```