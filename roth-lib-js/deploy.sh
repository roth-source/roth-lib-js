#!/bin/bash

REPO_USER="root";
REPO_HOST="dist.roth.cm";
REPO_PORT="22";
REPO_DIR="/opt/nginx/base/apps/dist";
CTL_DIR="$HOME/.ssh/ctl";
CTL_PATH="$CTL_DIR/%L-%r@%h:%p";

source "package.sh";

mkdir -p "$CTL_DIR";
ssh -nNf -o "ControlMaster=yes" -o "ControlPath=$CTL_PATH" -p "$REPO_PORT" "$REPO_USER@$REPO_HOST";

for ARTIFACT in "${ARTIFACTS[@]}";
do
	
	cd ../"$ARTIFACT";
	if [ -f "$PROJECT" ];
	then
		
		source "$PROJECT";
		version="$VERSION";
		group=${GROUP//./\/};
		artifact="$ARTIFACT";
		target="$TARGET";
		
		repo_dest="$REPO_DIR/$group/$artifact/$version";
		ssh -o "ControlPath=$CTL_PATH" -p "$REPO_PORT" "$REPO_USER@$REPO_HOST" "mkdir -p \"$repo_dest\"";
		scp -o "ControlPath=$CTL_PATH" -P "$REPO_PORT" -r "$target"/* "$REPO_USER@$REPO_HOST":"$repo_dest";
		
	fi
	
done

ssh -O exit -o "ControlPath=$CTL_PATH" -p "$REPO_PORT" "$REPO_USER@$REPO_HOST";
