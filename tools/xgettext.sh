#!/usr/bin/env bash
DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

cd $DIR

xgettext --language=Python --force-po -o languages/messages.pot js/app.js `find js/model js/controller js/widget -type f` `find ./ -name "*php"`
