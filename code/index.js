import WebSocket from 'ws'
import params from './params'

import { exec } from 'child_process'

let ws

const init = () => {
  ws = new WebSocket(`ws://${params.WS_URI}/?id=${params.id}&secret=${params.secret}`)

  ws.on('open', () => {
    console.log('conected')
  })

  ws.on('message', (m) => {
    processMessage(m)
  })

  ws.on('close', () => {
    console.log('connection dropped')
    ws.close()
    ws = null
    setTimeout(() => {
      init()
    }, 5000)
  })

  ws.on('error', () => {
    console.log('connection dropped with error')
  })
}

init()


//sed -n '/Common Name,Real Address,Bytes Received,Bytes Sent,Connected Since/,/ROUTING TABLE/p' /etc/openvpn/openvpn-status.log | wc -l
//a esa linea le restamos 2 y da la cantidad de usuarios online 
const handle_get_connected_users = (msg) => {
  exec(`sed -n '/Common Name,Real Address,Bytes Received,Bytes Sent,Connected Since/,/ROUTING TABLE/p' /etc/openvpn/openvpn-status.log | wc -l`, (err, stdout, stderr) => {
    if(stdout.length > 0) {
      ws.send(prepareResponse({
        node_id: msg.node_id,
        action: 'get_connected_users',
        connected_users: isNaN(stdout) ? 0 : parseInt(stdout) - 2 
      }))
    }
  })
}

const handle_create_user = (msg) => {
  exec(`bash create_cert.sh ${msg.accountName}`, (err, stdout, stderr) => {
    if(stdout) {
      ws.send(prepareResponse({
        action: 'cert_created',
        accountName: msg.accountName,
        payload: stdout,
        node_id: msg.node_id
      }))
    }
  })
}

const handle_delete_user = (msg) => {
  exec(`bash revoke_cert.sh ${msg.accountName}`, (err, stdout, stderr) => {
    if(err) {
      ws.send(prepareResponse({
        action: 'err_delete_user',
        accountName: msg.accountName,
        payload: 'Error deleting user'
      }))
    }
    else {
      ws.send(prepareResponse({
        action: 'delete_user',
        accountName: msg.accountName,
        payload: `User ${msg.accountName} deleted!`
      }))
    }
  })
}

const prepareResponse = (data) => {
  return JSON.stringify(data)
}


const processMessage = (message) => {
  const parsedMessage = JSON.parse(message)

  switch (parsedMessage.action) {
    case 'create_user':
      handle_create_user(parsedMessage)
      break
    case 'delete_user':
      handle_delete_user(parsedMessage)
      break
    case 'get_connected_users':
      handle_get_connected_users(parsedMessage)
      break
    default:
      console.log(`Evento '${parsedMessage.action}' no se puede procesar!`)
      break
  }
}