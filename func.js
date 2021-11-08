const fetch = require('sync-fetch')
require('dotenv').config()
const logger = require('./log4js').log4js//logger
const fs = require('fs')
const numeral = require('numeral')

function getMessage(coin){
	let msg = ``
	let price = ``
	let maxTokens = ``
	let stakedTokens = ``
	let totalTokens = ``
	let stakedPercent = ``
	let totalPercent = ``
	let teamTokens = ``
	let communityTokens = ``
	let communityPercent = ``
		
	try {
		//no file = create
		let file = `./json/${coin}.json`
		let rJson = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : ''
		var wdate = fs.existsSync(file) ? parseInt(rJson.wdate) + (60 * 1000) : 0
		var cdate = parseInt(new Date().getTime())
		
		if(coin == 'cosmos'){
			let cosmosInfo = getCosmosInfo()
			msg = `⚛️ <b>코스모스 ($ATOM)</b>\nㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ\n\n`
			if( wdate <  cdate) {
				price = getPrice()
				priceUsd = price[0].toFixed(2)
				priceKrw = price[1].toFixed(0)
				maxTokens = (cosmosInfo.max_tokens/ 1000000).toFixed(0)
				stakedTokens = (cosmosInfo.bonded_tokens / 1000000 ).toFixed(0)
				stakedPercent = (stakedTokens / maxTokens * 100).toFixed(0)
				notStakedTokens = maxTokens - stakedTokens
				notStakedPercent = (notStakedTokens / maxTokens * 100).toFixed(0)
				prvDetail = getProvalidatorDetail()//get provalidator detail info
				prvRank = prvDetail.rank
				prvRate = (prvDetail.rate * 100)
				prvTokens = (prvDetail.tokens/ 1000000).toFixed(0)
				
				let wJson = {
					"priceUsd" : priceUsd,
					"priceKrw" : priceKrw,	
					"maxTokens" : maxTokens,
					"stakedTokens" : stakedTokens,
					"stakedPercent" : stakedPercent,
					"notStakedTokens" : notStakedTokens,
					"notStakedPercent" : notStakedPercent,
					"prvRank" : prvRank,
					"prvTokens" : prvTokens,
					"prvRate" :  prvRate,
					"wdate" : new Date().getTime()
				}
				fs.writeFileSync(file, JSON.stringify(wJson))
			}else{
				priceUsd = rJson.priceUsd
				priceKrw = rJson.priceKrw
				maxTokens = rJson.maxTokens
				stakedTokens = rJson.stakedTokens
				stakedPercent = rJson.stakedPercent
				notStakedTokens = rJson.notStakedTokens
				notStakedPercent = rJson.notStakedPercent
				prvRate = rJson.prvRate
				prvTokens = rJson.prvTokens
			}
			msg += `🥩<b>Staking</b>\n\n`
			msg += `💰<b>가격: $${priceUsd} (약 ${numberWithCommas(priceKrw)}원)</b>\n\n`
			msg += `🔐본딩: ${stakedPercent}% / 🔓언본딩: ${notStakedPercent}%\n\n`
			msg += `⛓️최대공급량: ${numberWithCommas(maxTokens)} (100%)\n\n`
			msg += `<b>프로밸리와 $ATOM 스테이킹 하세요❤️</b>\n\n`
			msg += `<b>🏆검증인 순위: #${prvRank}</b>\n\n`
			msg += `<b>🔖수수료: ${prvRate}%</b>\n\n`
			msg += `<b>🤝위임량: ${numberWithCommas(prvTokens)}</b>\n\n`
			msg += `ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ\n`
			msg += `<b>프로밸리(<a href='https://provalidator.com' target='_blank'>Provalidator</a>) 검증인 만듦</b>\n`
		}	

		return msg
	}catch(err){
		logger.error(`=======================func error=======================`)
		logger.error(err)
		return null
	}
}

function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function getPrice(){
	let json = fetch('https://api.coingecko.com/api/v3/simple/price?ids=cosmos&vs_currencies=usd,krw').json()
	return [json.cosmos.usd,json.cosmos.krw]
}

function getCosmosInfo(){
	let json = fetch(process.env.COSMOS_API_URL+"/status").json()
	let returnArr = { 
		'bonded_tokens' : json.bonded_tokens,
		'not_bonded_tokens' : json.not_bonded_tokens,
		'max_tokens' :''
	}
	
	for(var j in json.total_circulating_tokens.supply){
		if(json.total_circulating_tokens.supply[j].denom == 'uatom'){
			returnArr.max_tokens = json.total_circulating_tokens.supply[j].amount
			break
		}
	}
	return returnArr	
}
function getProvalidatorDetail(){
	let json = fetch(process.env.COSMOS_API_URL+"/staking/validators").json()
	let obj = {};
	for(var i in json){
		if(process.env.PROVALIDATOR_OPERATER_ADDRESS === json[i].operator_address){			
			obj.rank = json[i].rank
			obj.rate = json[i].rate
			obj.tokens = json[i].tokens
		}
	}
	return obj	
}

module.exports = {
	getMessage : getMessage,
	getProvalidatorDetail : getProvalidatorDetail
}