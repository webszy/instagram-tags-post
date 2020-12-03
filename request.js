const rp = require('request-promise')
const to = require('await-to-js').default
const request = async function(options){
  // options.resolveWithFullResponse=true
  options.json = true
  if(!options.method){
    options.method='get'
  }
  if(!options.headers){
    options.headers={}
  }
  options.headers['referer'] = 'https://www.instagram.com/'
  options.headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36'
  const [err,res] = await to(rp(options))
  if(!err && res){
    return res
  } else{
    console.log(err,res)
    return false
  }
}
module.exports = request
