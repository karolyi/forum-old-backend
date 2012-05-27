#!/usr/bin/env ash
DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

cd $DIR

#../po2json -p languages/hu_HU.po >languages/hu_HU.json
../po2json languages/hu_HU.po >languages/hu_HU.json
../po2json languages/en_US.po >languages/en_US.json
