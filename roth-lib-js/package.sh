#!/bin/bash


version="0.2.0-SNAPSHOT";
while getopts "v:" opt;
do
	case $opt in
	v)
		version="${OPTARG}";
		;;
	esac
done
source "artifacts.sh";
for artifact in "${artifacts[@]}";
do
	copy=();
	cd ../"$artifact";
	if [ -f "project.sh" ];
	then
		source "project.sh";
		echo "Packaging $artifact";
		rm -rf "target/"*;
		mkdir -p "target";
		touch "target/$artifact.js";
		cat $(printf "src/%s " "${files[@]}") >> "target/$artifact.js";
		namespace="${artifact//-/.}";
		echo -e "$namespace.version = \"$version\";" >> "target/$artifact.js";
		if [ -d "resources" ];
		then
			cp -r "resources/." "target";
		fi
		for dest in "${copy[@]}";
		do
			cp -rf "target/"* "$dest";
		done
	fi
done

