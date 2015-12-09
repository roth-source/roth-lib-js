#!/bin/bash


jsdoc="$HOME/.jsdoc";
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
mkdir -p "$jsdoc";
/usr/local/bin/jsdoc \
-t "$HOME/node_modules/minami" \
-d "$jsdoc" \
$src;

cd ..;
git stash;
git checkout gh-pages;
rm -r jsdoc;
mv "$jsdoc" "jsdoc";
git add .;
git commit -m "jsdoc";
git push;
git checkout master;


