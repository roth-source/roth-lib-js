#!/bin/bash


version="0.1.5-SNAPSHOT";
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
		if [ -f "src/_namespace.js" ];
		then
			cat "src/_namespace.js" >> "target/$artifact.js";
			echo -e "${artifact//-/.}.version = \"$version\";" >> "target/$artifact.js";
		fi
		cat $(printf "src/%s " "${files[@]}") >> "target/$artifact.js";
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

