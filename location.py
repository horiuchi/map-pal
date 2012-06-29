# -*- coding: utf-8 -*-
import simplejson
import datetime

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app


locations = {}


class JSONPHandler(webapp.RequestHandler):
    def get(self):
        id = self._update_location(self.request)
        json = simplejson.dumps(self._display_location(id))

        callback = self.request.get('callback')
        if callback:
            json = '%s(%s)' % (callback, json)

        self.response.headers['Content-Type'] =\
                'application/javascript; charset=utf-8'
        self.response.out.write(json)

    def _display_location(self, id):
        return locations.setdefault(id, {})

    def _update_location(self, req):
        id = req.get('id')
        name = req.get('name')

        names = locations.setdefault(id, {})
        value = names.setdefault(name, {})
        if 'first' in value:
            del value['first']
        else:
            value['first'] = True
        value['now'] = str(datetime.datetime.utcnow())
        value['lat'] = req.get('lat')
        value['lng'] = req.get('lng')

        return id


application = webapp.WSGIApplication([
                                    ('/loc', JSONPHandler),
                                    ], debug=True)


def main():
    run_wsgi_app(application)


if __name__ == '__main__':
    main()
