#!/bin/bash

VERSION="0.1.5-SNAPSHOT";
ARTIFACTS=(
	"roth-lib-js-env"
	"roth-lib-js"
	"roth-lib-js-template"
	"roth-lib-js-client"
	"roth-lib-js-client-dev"
	"roth-lib-js-framework"
);

while getopts "v:" opt;
do
	case $opt in
		v)
			VERSION="${OPTARG}";
			;;
	esac
done
version="$VERSION";

for ARTIFACT in "${ARTIFACTS[@]}";
do
	GROUP="roth.lib.js";
	PROJECT="project.sh";
	SRC="src";
	RESOURCES="resources";
	TARGET="target";
	COPY=();
	NAMESPACE="_namespace.js";
	
	cd ../"$ARTIFACT";
	if [ -f "$PROJECT" ];
	then
		
		source "$PROJECT";
		group=${GROUP//./\/};
		artifact="$ARTIFACT";
		files=("${FILES[@]}");
		src="$SRC";
		resources="$RESOURCES";
		target="$TARGET";
		namespace="$NAMESPACE";
		copy=("${COPY[@]}");
		
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
		
		for dest in "${copy[@]}";
		do
			cp -rf "$target/"* "$dest"
		done
		
	fi
	
done


