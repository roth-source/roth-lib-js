#!/bin/bash

VERSION="0.1.3-SNAPSHOT";
GROUP="roth.js";
ARTIFACTS=(
	"roth-js-env"
	"roth-js"
	"roth-js-util"
	"roth-js-template"
	"roth-js-client"
	"roth-js-client-dev"
	"roth-js-framework"
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
		cat "$src/$namespace" > "$target/$artifact.js";
		echo -e "${artifact//-/.}.version = \"$version\";" >> "$target/$artifact.js";
		cat $(printf "$src/%s " "${files[@]}") >> "$target/$artifact.js";
		
		if [ -d "$resources" ];
		then
			cp -r "$resources/." "$target";
		fi
		
	fi
	
done
