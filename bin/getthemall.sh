for x in $(seq 1 10); do  bash -c "curl 'http://memeful.com/web/ajax/posts?count=2000&page=${x}&tags=' > collect/${x}-2000.json" && sleep 1 ; done

jq -s . collect/*.json > data.json

echo 'var data = ' > data.js
cat data.json | jq '.[] | .data | .[] | [.imageUrl, .tags]' | jq -s . >> data.js
echo ';' >> data.js

# make them animated
sed -i 's#700w#700wa#g' data.js
sed -i 's#\.jpg#.gif#g' data.js

rm data.json
