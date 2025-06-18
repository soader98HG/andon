/* main backend file
   comments without accents or the letter ñ */

require('dotenv').config()

const express = require('express')
const cors    = require('cors')
const { Pool } = require('pg')
const mqtt   = require('mqtt')
const { WebSocketServer, WebSocket } = require('ws')

const app  = express()
app.use(cors())          // cors despues de crear app
app.use(express.json())  // parseo json

/* --- conexiones a BD y MQTT --- */
const pool       = new Pool({ connectionString: process.env.PG_URL })
const mqttClient = mqtt.connect(process.env.MQTT_URL)

/* ---------- endpoints extra antes de los clasicos ---------- */

// lista de incidentes, ?status=open | closed | all
app.get('/incidents', async (req,res)=>{
  const status = req.query.status || 'open'
  let sql = 'SELECT * FROM incident'
  let rows
  if(status === 'all'){
    ;({ rows } = await pool.query(sql))
  } else {
    sql += ' WHERE status = $1'
    ;({ rows } = await pool.query(sql,[status]))
  }
  res.json(rows)
})

// cerrar incidente
app.patch('/incidents/:id/close', async (req,res)=>{
  const id = req.params.id
  const { rows } = await pool.query(
    `UPDATE incident
       SET status='closed', closed_at=NOW()
       WHERE id=$1 RETURNING *`, [id])
  if(!rows.length) return res.status(404).json({error:'not found'})

  const inc = rows[0]
  // mqtt color verde y update
  mqttClient.publish('andon/incidents/update', JSON.stringify(inc))
  mqttClient.publish(`andon/station/${inc.station_id}/state`,
    JSON.stringify({ color:'verde' }))
  res.json(inc)
})

// actualizar estado de incidente y baliza
app.patch('/incidents/:id/action', async (req, res) => {
  const id = req.params.id
  const action = req.body.action
  const { rows } = await pool.query('SELECT * FROM incident WHERE id=$1', [id])
  if(!rows.length) return res.status(404).json({ error: 'not found' })
  const inc = rows[0]

  if(action === 'finalizado') {
    const { rows: up } = await pool.query(
      `UPDATE incident
         SET status='closed', closed_at=NOW()
         WHERE id=$1 RETURNING *`, [id])
    const upd = up[0]
    mqttClient.publish('andon/incidents/update', JSON.stringify(upd))
    mqttClient.publish(`andon/station/${upd.station_id}/state`,
      JSON.stringify({ color: 'verde' }))
    return res.json(upd)
  }

  const color = action === 'reproceso'
    ? 'amarillo'
    : action === 'recibido'
      ? 'rojo'
      : null

  if(!color) return res.status(400).json({ error: 'invalid action' })

  mqttClient.publish(`andon/station/${inc.station_id}/state`,
    JSON.stringify({ color }))
  res.json(inc)
})

/* ---------- REST endpoints clasicos ---------- */
app.get('/stations', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM station')
  res.json(rows)
})

app.get('/defects', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM defect_code')
  res.json(rows)
})

app.post('/incidents', async (req, res) => {
  const { station_id, defect_code, vehicle_id } = req.body
  const { rows } = await pool.query(
    `INSERT INTO incident (station_id, defect_code, vehicle_id)
     VALUES ($1,$2,$3) RETURNING *`,
    [station_id, defect_code, vehicle_id]
  )
  const inc = rows[0]
  mqttClient.publish('andon/incidents/new', JSON.stringify(inc))
  mqttClient.publish(
    `andon/station/${station_id}/state`,
    JSON.stringify({ color:'rojo', defect: defect_code })
  )
  res.status(201).json(inc)
})

/* ---------- WebSocket bridge ---------- */
const wss = new WebSocketServer({ port: 8080 })

// forward MQTT messages to all connected websocket clients
mqttClient.on('message', (topic, msg) => {
  const text = msg.toString()
  let payload
  try { payload = JSON.parse(text) } catch { payload = text }
  const packet = JSON.stringify({ topic, payload })
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(packet)
    }
  })
})
mqttClient.subscribe('andon/#')

wss.on('connection', () => {
  // no per-connection listener needed; handled above
})

/* ---------- arranque ---------- */
if (require.main === module) {
  app.listen(process.env.PORT, () =>
    console.log(`API listening on ${process.env.PORT}`)
  )
}

module.exports = app
