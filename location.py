# -*- coding: utf-8 -*-
import simplejson
import datetime

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app


class JSONPHandler(webapp.RequestHandler):
    def get(self):
        data = {'id': self.request.get('id'),
                'name': self.request.get('name'),
                'now': str(datetime.datetime.utcnow())}
        json = simplejson.dumps(data)

        callback = self.request.get('callback')
        if callback:
            json = '%s(%s)' % (callback, json)

        self.response.headers['Content-Type'] =\
                'application/javascript; charset=utf-8'
        self.response.out.write(json)


application = webapp.WSGIApplication([
                                    ('/loc', JSONPHandler),
                                    ], debug=True)


def main():
    run_wsgi_app(application)


if __name__ == '__main__':
    main()
