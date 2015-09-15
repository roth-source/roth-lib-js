#!/bin/bash

GROUP="roth.js";
ARTIFACTS=(
	roth-js
	roth-js-client
	roth-js-client-dev
	roth-js-env
	roth-js-template
	roth-js-util
);
SRC="src";
RESOURCES="resources";
TARGET="target";
REPO_HOST="dist-deploy.roth.cm";
REPO_DIR="/opt/nginx/base/apps/dist";

group="$GROUP";
artifacts=("${ARTIFACTS[@]}");
src="$SRC";
resources="$RESOURCES";
target="$TARGET";
repo_host="$REPO_HOST";
repo_dir="$REPO_DIR";

while getopts ":v:a:" opt;
do
	case $opt in
		v)
			version="${OPTARG}";
			;;
		a)
			artifacts=("${OPTARG}");
			;;
	esac
done

group=${group//./\/};

while [ -z "$version" ];
do
	echo -n "version: ";
	read version;
done

for artifact in "${artifacts[@]}";
do
	
	cd ../"$artifact";
	shopt -s nullglob
	files=("$src"/_*.js "$src"/[!_]*.js);
	
	namespace="var ";
	seperator="";
	package_parts="";
	package=(${artifact//-/ });
	for package_part in "${package[@]}";
	do
		package_parts+="$seperator";
		package_parts+="$package_part";
		namespace+="$package_parts = $package_parts || {};\n";
		seperator=".";
	done
	namespace+="$package_parts.version = \"$version\";\n";
	
	rm -rf "$target/*";
	mkdir -p "$target";
	echo -e "$namespace" > "$target/$artifact.js";
	cat $(printf "%s " "${files[@]}") >> "$target/$artifact.js";
	
	if [ -d "$resources" ];
	then
		cp -r "$resources/." "$target";
	fi
	
	repo_dest="$repo_dir/$group/$artifact/$version";
	ssh root@$repo_host "mkdir -p \"$repo_dest\"";
	scp -r "$target"/* root@"$repo_host":"$repo_dest";
	
done
