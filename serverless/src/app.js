const express = require('express')

const fetch = require('node-fetch')
const StellarBase = require('stellar-base')
const BigNumber = require('bignumber.js')

const app = express()
const { Keypair, FastSigning } = StellarBase

app.get('/', (req, res) => {
  res.json({
    version: VERSION,
    FastSigning
  })
})

app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': process.env.turretBaseUrl,
    'Access-Control-Allow-Methods': 'OPTIONS, POST',
    'Access-Control-Allow-Headers': 'Content-Type, X-Turret-Data, X-Turret-Signature',
  })
  next()
})

app.use(express.json())

app.post('/:txFunctionHash', async (req, res) => {
  try {
    const { body, headers, params } = req

    const turretSignerKeypair = Keypair.fromPublicKey(process.env.turretAddress)
    const turretRunAuthBuffer = Buffer.from(headers['x-turret-data'], 'base64')
    const turretRunAuthSignatureBuffer = Buffer.from(headers['x-turret-signature'], 'base64')

    if (!turretSignerKeypair.verify(turretRunAuthBuffer, turretRunAuthSignatureBuffer)) 
      throw { status: 403 }

    const { txFunctionHash } = params
    const txFunctionCode = (
      body.txFunction // Raw txFunction code string has been included in the body
      || await fetch(`${process.env.turretBaseUrl}/tx-functions/${txFunctionHash}`) // Otherwise just pull it from the turretBaseUrl
      .then(async (res) => {
        if (res.ok) {
          const { function: txFunction } = await res.json()
          return txFunction
        } throw res
      })
    )

    delete body.txFunction

    const txFunction = new Function(
      'fetch, StellarBase, BigNumber', 
      `return ${txFunctionCode}`
    )(fetch, StellarBase, BigNumber)
    const result = await txFunction(body)

    res.send(result)
  }

  catch(err) {
    if (typeof err === 'string')
      err = {message: err, status: 400}

    else if (err.headers?.has('content-type')) 
      err.message = err.headers.get('content-type').indexOf('json') > -1
      ? await err.json()
      : await err.text()

    if (!err.status)
      err.status = 400

    res
    .status(err.status)
    .send({
      ...(
        typeof err.message === 'string'
        ? {message: err.message}
        : err.message
      ),
      status: err.status,
    })
  }
})

app.use((req, res) => {
  res
  .status(404)
  .send('Not Found')
})

module.exports = app
