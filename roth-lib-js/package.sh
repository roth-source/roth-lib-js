#!/bin/bash

VERSION="0.1.5-SNAPSHOT";
GROUP="roth.lib.js";
ARTIFACTS=(
	"roth-lib-js-env"
	"roth-lib-js"
	"roth-lib-js-template"
	"roth-lib-js-client"
	"roth-lib-js-client-dev"
	"roth-lib-js-framework"
);
PROJECT="project.sh";
SRC="src";
RESOURCES="resources";
TARGET="target";
NAMESPACE="_namespace.js";

while getopts "v:" opt;
do
	case $opt in
		v)
			VERSION="${OPTARG}";
			;;
	esac
done

for ARTIFACT in "${ARTIFACTS[@]}";
do
	
	cd ../"$ARTIFACT";
	if [ -f "$PROJECT" ];
	then
		
		source "$PROJECT";
		version="$VERSION";
		group=${GROUP//./\/};
		artifact="$ARTIFACT";
		files=("${FILES[@]}");
		src="$SRC";
		resources="$RESOURCES";
		target="$TARGET";
		namespace="$NAMESPACE";
		
		echo "Packaging $artifact";
		
		rm -rf "$target/"*;
		mkdir -p "$target";
		touch "$target/$artifact.js";
		
		if [ -f "$src/$namespace" ];
		then
			cat "$src/$namespace" >> "$target/$artifact.js";
			echo -e "${artifact//-/.}.version = \"$version\";" >> "$target/$artifact.js";
		fi
		
		cat $(printf "$src/%s " "${files[@]}") >> "$target/$artifact.js";
		
		if [ -d "$resources" ];
		then
			cp -r "$resources/." "$target";
		fi
		
	fi
	
done
