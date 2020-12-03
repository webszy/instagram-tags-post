#!/usr/bin/env node
const argv = require('yargs').argv
const request = require('./request')
console.log(argv)
if(argv.h){
  console.log('example: tagfinder tagName --proxy=http://127.0.0.1:1080')
  process.exit(0)
}

if(argv._.length ===0){
  console.log('please input the tag which you want fetch')
  process.exit(0)
}

const fetchData = async function(tag){
  const options = {
     url:`https://www.instagram.com/explore/tags/${tag}/?__a=1`,
  }
  if(argv.proxy){
    options.proxy = argv.proxy
  }
  const data = await request(options)
  let hasNext = data.graphql.hashtag.edge_hashtag_to_media.page_info.has_next_page
  let end_cursor = data.graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor

  const getNextPage = async (end_cursor)=>{
    let variables=JSON.stringify({
      tag_name:tag,
      first:12,
      after:end_cursor
    })
    options.url=`https://www.instagram.com/graphql/query/?query_hash=9b498c08113f1e09617a1703c22b2f32&variables=${encodeURI(variables)}`
    const res = await request(options)
    return {
      edges:res.data.hashtag.edge_hashtag_to_media.edges,
      page_info:res.data.hashtag.edge_hashtag_to_media.page_info
    }
  }

  const getOwner = async(shortcode)=>{
    options.url=`https://www.instagram.com/p/${shortcode}/?__a=1`
    const owner = await request(options)
    return owner.graphql.shortcode_media.owner
  }

  let edges = data.graphql.hashtag.edge_hashtag_to_media.edges
  for(const k of edges){
    k.node.owner  = await getOwner(k.node.shortcode)
  }
  while(hasNext){
    let list = await getNextPage(end_cursor)
    hasNext = list.page_info.has_next_page
    end_cursor = list.page_info.end_cursor
    for(const k of list.edges){
      k.node.owner  = await getOwner(k.node.shortcode)
    }
    edges = edges.concat(list.edges)
    console.log('current data rows: ',edges.length)
  }
  try {
    const path = require('path').join(__dirname,'./data.json')
    require('fs').writeFileSync(path,JSON.stringify(edges))
  } catch (error) {
    console.log(error)
  }
}
console.log('tag which your inputed: ',argv._[0])
console.log('your proxy: ',argv.proxy?argv.proxy:'null')
fetchData(argv._[0])