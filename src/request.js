const rp = require('request-promise')
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
  return rp(options)
}
module.exports = request
