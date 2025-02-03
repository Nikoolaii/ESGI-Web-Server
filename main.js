const folder = "./www"

function listen(port) {
  const net = require('net')
  const server = net.createServer((socket) => {
    console.log("New connection " + socket.remoteAddress + ":" + socket.remotePort)
    socket.on('data', (data) => {
      manageRequest(data.toString(), socket)
    })
  })

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

function manageRequest(request, socket) {
  const requestLine = request.split('\n')[0]
  const method = requestLine.split(' ')[0]
  let path = requestLine.split(' ')[1]

  if (path === '/') {
    path = '/index.html'
  }

  switch (method) {
    case "GET":
      const file = (folder + path).trim()
      const fs = require('fs')
      console.log(file)

      try {
        if (fs.existsSync(file)) {
          const fileContent = fs.readFileSync(file, '')
          const extension = path.split('.').pop().toLowerCase()
          const contentType = 'text/html'

          const returnValue = [
            "HTTP/1.1 200 OK",
            `Content-Type: ${contentType}`,
            "",
            fileContent
          ]
          socket.write(returnValue.join('\r\n'))
        } else {
          console.log('File not found:', file)
          sendError(socket, 404, 'Not Found')
        }
      } catch (err) {
        console.error('Error reading file:', err)
        sendError(socket, 500, 'Internal Server Error')
      }
      break
    default:
      sendError(socket, 405, 'Method Not Allowed')
      break
  }
}

function sendError(socket, code, message) {
  const returnValue = [
    `HTTP/1.1 ${code} ${message}`,
    "Content-Type: text/html",
    "",
    `<h1>${code} - ${message}</h1>`
  ]
  socket.write(returnValue.join('\r\n'))
}

listen(80)