var http = require('http'),
    browserify = require('browserify'),
    literalify = require('literalify'),
    React = require('react'),
    ReactDOMServer = require('react-dom/server'),
    request = require("request"),
    DOM = React.DOM, body = DOM.body, div = DOM.div, script = DOM.script,

    App = React.createFactory(require('../build/App')),
    fs = require("fs")


// Load secrets
var fileName = "../secrets.json"
var config

try {
  config = require(fileName)
}
catch (err) {
  config = {}
  console.log("unable to read file '" + fileName + "': ", err)
}

http.createServer(function(req, res) {
  console.log(req.url)

  if (req.url != undefined) {
    var urlParts = req.url.split("?")
    var path = urlParts[0]
    var paramString = urlParts[1]

    if (req.url == '/') {

      res.setHeader('Content-Type', 'text/html')
      var props = {
        items: [ ]
      }

      var html = ReactDOMServer.renderToStaticMarkup(body(null,
        div({id: 'content', dangerouslySetInnerHTML: {__html:
          ReactDOMServer.renderToString(App(props))
        }}),

        script({dangerouslySetInnerHTML: {__html:
          'var APP_PROPS = ' + safeStringify(props) + ';'
        }}),

        script({src: '//cdnjs.cloudflare.com/ajax/libs/react/15.0.1/react.min.js'}),
        script({src: '//cdnjs.cloudflare.com/ajax/libs/react/15.0.1/react-dom.min.js'}),
        script({src: '/bundle.js'})
      ))

      res.end(html)

    } else if (req.url == '/bundle.js') {

      res.setHeader('Content-Type', 'text/javascript')

      browserify()
        .add('build/browser.js')
        .transform(literalify.configure({
          'react': 'window.React',
          'react-dom': 'window.ReactDOM',
        }))
        .bundle()
        .pipe(res)

    } else if (path == "/search") {
      var url = "http://api.shopstyle.com/api/v2/products?pid=" + config.pid + "&" + paramString

      request(url, function(error, response, responseBody) {
        responseDict = JSON.parse(responseBody)

        if (responseDict.products === undefined) {
          res.end(html)
          return
        }

        res.setHeader('Content-Type', 'text/html')
        var props = {
          items: responseDict.products
        }

        var html = ReactDOMServer.renderToStaticMarkup(body(null,
          div({id: 'content', dangerouslySetInnerHTML: {__html:
            ReactDOMServer.renderToString(App(props))
          }}),

          script({dangerouslySetInnerHTML: {__html:
            'var APP_PROPS = ' + safeStringify(props) + ';'
          }}),

          script({src: '//cdnjs.cloudflare.com/ajax/libs/react/15.0.1/react.min.js'}),
          script({src: '//cdnjs.cloudflare.com/ajax/libs/react/15.0.1/react-dom.min.js'}),
          script({src: '/bundle.js'})
        ))

        // Return the page to the browser
        res.end(html)
      })
    } else {
      res.statusCode = 404
      res.end()
    }
  } else {
    res.statusCode = 404
    res.end()
  }

// The http server listens on port 3000
}).listen((process.env.PORT || 3000), function(err) {
  if (err) throw err
  console.log('Listening on 3000...')
})

// A utility function to safely escape JSON for embedding in a <script> tag
function safeStringify(obj) {
  return JSON.stringify(obj).replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<\\!--')
}
