#!/usr/bin/env node
const argv = require('yargs').argv
const request = require('./request')
// console.log(argv)

if (argv.h || argv._.length === 0) {
  console.log('example command: tagsaver tagName --proxy=http://127.0.0.1:1080')
  process.exit(0)
}

const waitSeocond = second => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve && resolve(true)
    }, second * 1000)
  })
}

const fetchData = async function (tag) {
  const options = {
    url: `https://www.instagram.com/explore/tags/${tag}/?__a=1`,
  }
  if (argv.proxy) {
    options.proxy = argv.proxy
  }
  const data = await request(options)
  let hasNext = data.graphql.hashtag.edge_hashtag_to_media.page_info.has_next_page
  let end_cursor = data.graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor
  const total = data.graphql.hashtag.edge_hashtag_to_media.count
  console.log(`there are ${total} post on this tag,please waiting...`,)
  const getNextPage = async (end_cursor) => {
    let variables = JSON.stringify({
      tag_name: tag,
      first: 12,
      after: end_cursor
    })
    options.url = `https://www.instagram.com/graphql/query/?query_hash=9b498c08113f1e09617a1703c22b2f32&variables=${encodeURI(variables)}`
    const res = await request(options)
    return {
      edges: res.data.hashtag.edge_hashtag_to_media.edges,
      page_info: res.data.hashtag.edge_hashtag_to_media.page_info
    }
  }

  const getOwner = async (shortcode) => {
    options.url = `https://www.instagram.com/p/${shortcode}/?__a=1`
    const owner = await request(options)
    return owner.graphql.shortcode_media.owner
  }

  let edges = data.graphql.hashtag.edge_hashtag_to_media.edges
  for (const k of edges) {
    await waitSeocond(.5)
    k.node.owner = await getOwner(k.node.shortcode)
  }
  while (hasNext) {
    await waitSeocond(2)
    let list = await getNextPage(end_cursor)
    hasNext = list.page_info.has_next_page
    end_cursor = list.page_info.end_cursor
    for (const k of list.edges) {
      await waitSeocond(.5)
      k.node.owner = await getOwner(k.node.shortcode)
    }
    edges = edges.concat(list.edges)
    console.log('current data rows: ', edges.length)
  }
  save2json(edges, tag)
}
const save2json = (data, name) => {
  const cwd = require('process').cwd()
  const path = require('path').join(cwd, `./${name}.json`)
  require('fs').writeFile(path, JSON.stringify(data,null,4), 'utf8',
  (error) => {
    if(error){
      console.log(error)
      process.exit(1)
    } else {
      console.log(`all post fetched down(${name}.json),pleas see your current work directory`)
      process.exit(0)
    }
  })
}
console.log('tag which your inputed: ', argv._[0])
console.log('your proxy: ', argv.proxy ? argv.proxy : 'null')
fetchData(argv._[0])
