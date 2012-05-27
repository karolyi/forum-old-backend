#!/usr/bin/env ash
DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

cd $DIR

msgmerge -v -U languages/hu_HU.po languages/messages.pot
msgmerge -v -U languages/en_US.po languages/messages.pot
