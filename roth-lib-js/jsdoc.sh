#!/bin/bash


source "artifacts.sh";
src="";
for artifact in "${artifacts[@]}";
do
	if [ -f "../$artifact/project.sh" ] && [ "$artifact" != "roth-lib-js-framework" ];
	then
		source "../$artifact/project.sh";
		src="$src$(printf "../$artifact/src/%s " "${files[@]}")";
	fi
done
/usr/local/bin/jsdoc \
-t "$HOME/node_modules/minami" \
-d ../../roth-lib-js-doc/jsdoc \
$src;

