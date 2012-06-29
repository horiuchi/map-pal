# -*- coding: utf-8 -*-
import simplejson
import datetime

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app


locations = {}


class JSONPHandler(webapp.RequestHandler):
    DATE_FORMAT = '%Y/%m/%d %H:%M:%S'

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
        self._delete_old_data(id)
        return locations.setdefault(id, {})

    def _delete_old_data(self, id):
        if not id in locations:
            return
        names = locations[id]
        for name, value in names.iteritems():
            time = datetime.datetime.strptime(value['now'], self.DATE_FORMAT)
            now = datetime.datetime.utcnow()
            if self._check_old_time(now, time):
                del names[name]

    def _check_old_time(self, now, old):
        return time < now - datetime.timedelta(hours=2)

    def _update_location(self, req):
        id = req.get('id')
        name = req.get('name')

        names = locations.setdefault(id, {})
        value = names.setdefault(name, {})
        if 'first' in value:
            del value['first']
        else:
            value['first'] = True
        value['now'] = datetime.datetime.utcnow().strftime(self.DATE_FORMAT)
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
