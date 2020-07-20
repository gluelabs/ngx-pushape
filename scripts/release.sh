#!/bin/bash

# current Git branch
branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')

# patch, minor, major
versionLabel=v$1

if [ -z "$1" ]; then
  echo "error: no version provided"
  exit
fi

# establish branch and tag name variables
devBranch=develop
masterBranch=master
releaseBranch=release/$1

# create the release branch from the -develop branch
git checkout -b $releaseBranch $devBranch

./node_modules/.bin/json -I -f package.json -e "this.version=\"$1\""

# commit version number increment
git commit -am "build: release $versionLabel"

# create tag for new version from -master
git tag $versionLabel

npm run changelog

# merge release branch with the new version number into master
git checkout $masterBranch
git merge --no-ff $releaseBranch

# merge release branch with the new version number back into develop
git checkout $devBranch
git merge --no-ff $releaseBranch

# remove release branch
git branch -d $releaseBranch
