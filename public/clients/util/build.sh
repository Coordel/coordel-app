#!/bin/bash

set -e

#The version here must match the one set at the end of the dir parameter in the profiles/app.js file
VERSION="0.0.0"

UTILDIR=$(cd $(dirname $0) && pwd)
RJSVERSION="0.24.0"
REQUIREJSDIR="${UTILDIR}/../web/js/requirejs-${RJSVERSION}"
PROFILE="${UTILDIR}/../profiles/app.js"

if [ ! -f "$PROFILE" ]; then
	echo "Invalid input profile"
	exit 1
fi

echo "Building with $PROFILE"
$REQUIREJSDIR/build/build.sh "$PROFILE" "$@"


