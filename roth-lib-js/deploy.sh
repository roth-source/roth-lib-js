#!/bin/bash

REPO_HOST="dist-deploy.roth.cm";
REPO_DIR="/opt/nginx/base/apps/dist";

source "package.sh";

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
		repo_host="$REPO_HOST";
		repo_dir="$REPO_DIR";
		
		echo "Deploying $artifact";
		
		repo_dest="$repo_dir/$group/$artifact/$version";
		ssh root@$repo_host "mkdir -p \"$repo_dest\"";
		scp -r "$target"/* root@"$repo_host":"$repo_dest";
		# rsync -r "$target" root@"$repo_host":"$repo_dest";
		
	fi
	
done
