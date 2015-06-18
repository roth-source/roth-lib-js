#!/usr/bin/env bash

GROUP="roth/js/client";
ARTIFACT="roth-js-client";
VERSION="1.0.3";

TARGET="target";
PACKAGE="src/roth/js/client";
FILES=(Global.js Client.js Config.js Request.js Endpoint.js Queue.js Cache.js);
DEV="$PACKAGE/dev";

REPO_HOST="dist-deploy.roth.cm";
REPO_DIR="/opt/nginx/base/apps/dist";
REPO_DEST="$REPO_DIR/$GROUP/$ARTIFACT/$VERSION";

# empty target
rm -rf $TARGET/*;
mkdir -p $TARGET;

# combine client files
CAT_FILES="";
for i in ${!FILES[*]}
do
    CAT_FILES="$CAT_FILES$PACKAGE/${FILES[$i]} "
done
echo -e "
window.roth = window.roth || {};
window.roth.js = window.roth.js || {};
window.roth.js.version = \"$VERSION\";
" > "$TARGET/$ARTIFACT.js";
cat $CAT_FILES >> "$TARGET/$ARTIFACT.js";

# copy dev html files
cp -R $DEV $TARGET

# deploy target directory
ssh root@$REPO_HOST "mkdir -p $REPO_DEST";
scp -r $TARGET/* root@$REPO_HOST:$REPO_DEST;

echo "Deployed version $VERSION";