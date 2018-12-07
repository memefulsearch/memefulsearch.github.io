for x in $(seq 1 10); do  bash -c "curl 'http://memeful.com/web/ajax/posts?count=2000&page=${x}&tags=' > collect/${x}-2000.json" && sleep 1 ; done

jq -s . collect/*.json > data.json

# make them animated
sed -i 's#700w#700wa#g' data.json
sed -i 's#\.jpg#.gif#g' data.json

# get the old data
git show HEAD:data.js > old-data.js

# extract jsons
cat old-data.js | tail -n+2 | head -n-1 > old-data.json
cat data.js | tail -n+2 | head -n-1 > new-data.json

# fix protocol
sed -i 's#http:#https:#g' old-data.json
sed -i 's#http:#https:#g' new-data.json

# merge old and new data
echo 'var data = ' > data.js
jq -s '.[0] + .[1] | unique_by(.[0])' old-data.json new-data.json >> data.js
echo ';' >> data.js

# cleanup 
rm old-data.json
rm new-data.json
rm old-data.js
rm data.json
