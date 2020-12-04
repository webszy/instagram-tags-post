#!/usr/bin/env node
const argv = require('yargs').argv
const {checkProxy} = require('./utils')


// console.log(argv)

if (argv.h || argv._.length === 0) {
  console.log('example command: tagsaver tagName --proxy=http://127.0.0.1:1080')
  process.exit(0)
}

if(argv.proxy&&argv.proxy.length>0){
  checkProxy(argv.proxy)
}
