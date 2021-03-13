import Router from '@koa/router';
import httpRequest from '../http_client.mjs';
import { authorize } from '../security.mjs';

async function getOneEvent(eventId){
  const options = {
    hostname: 'conference',
    port: '80',
    path: '/api/events/' + eventId,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const record = await httpRequest(options);

  if (!record) {
    return null;
  }

  try {
    let {
      name,
      from,
      to,
      description,
      logoUrl,
      created,
      updated,
      numberOfPresentations,
      maximumNumberOfAttendees,
      version
    } = record;

    return {
      id: eventId,
      name,
      from,
      to,
      description,
      logoUrl,
      created,
      updated,
      numberOfPresentations,
      maximumNumberOfAttendees,
      version,
      location: {
        id: record.location_id,
        name: record.location_name,
        city: record.location_city,
        state: record.locaiton_state,
        maximumVendorCount: record.location_maximum_vendor_count,
        roomCount: record.location_room_count,
        created: record.location_created,
        updated: record.location_updated,
      },
    };
  } catch (err) {
    console.log('Unexpected error getOneEvent', err);
    return null;
  }
}

export const router = new Router({
  prefix: '/events',
});

router.use(authorize);

router.get('/', async ctx => {
  const options = {
    hostname: 'conference',
    port: '80',
    path: '/api/events?email=' + ctx.claims.email,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const events = await httpRequest(options);
  console.log('events: ', events);


  const aggregatedEventUser = events.reduce(function(acc, _event) {
    if(_event['accountId'] == ctx.claims.id) {
      _event.email = ctx.claims.email;
      _event.name = ctx.claims.name;
      acc.push(_event);
    }

    return acc;
  }, []);

  console.log('aggregated: ', aggregatedEventUser);

  ctx.body = aggregatedEventUser;
});

router.post('/', async ctx => {
  const accountId = ctx.claims.id;
  if (!accountId) {
    ctx.status = 401;
    return ctx.body = {
      code: 'INVALID_TOKEN',
      message: 'Provided an invalid authorization token',
    };
  }
  const { name, description, locationId } = ctx.request.body;

  let eventRows = null;
  try {
    const options = {
      hostname: 'conference',
      port: '80',
      path: '/api/events',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const response = await httpRequest(options, { name, description, locationId, accountId });
    console.log('events response', response);
    eventRows = response;
  } catch (e) {
    console.error(e);
    ctx.status = 400;
    return ctx.body = {
      code: 'INVALID_PARAMETER',
      message: 'Could not create an event with that location or account.'
    };
  }

  const options = {
    hostname: 'conference',
    port: '80',
    path: '/api/locations',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const locationsRows = await httpRequest(options);
  console.log('locations rows : ', locationsRows);
  console.log('event rows: ', eventRows);
  const [{ id, created, updated, version, numberOfPresentations, maximumNumberOfAttendees }] = eventRows;
  ctx.status = 201;
  ctx.body = {
    name,
    description,
    locationId,
    id,
    created,
    updated,
    version,
    numberOfPresentations,
    maximumNumberOfAttendees,
    location: locationsRows[0],
  };
});

router.get('/:id', async ctx => {
  const { id } = ctx.params;
  const event = await getOneEvent(id);

  if (event === null) {
    ctx.status = 404;
    return ctx.body = {
      code: 'INVALID_IDENTIFIER',
      message: `Could not find the event with identifier ${id}`,
    };
  }

  ctx.body = event;
});

router.delete('/:eventId', async ctx => {
  const { eventId } = ctx.params;
  const event = await getOneEvent(eventId, ctx.claims.email);

  if (event !== null) {
    const options = {
      hostname: 'conference',
      port: '80',
      path: '/api/events/' + eventId,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    try {
      httpRequest(options);
    } catch (err) {
      ctx.status = 500; 
    }
  }

  ctx.body = event || {};
});

router.put('/:eventId', async ctx => {
  const { eventId } = ctx.params;
  let { name, from, to, description, logoUrl, locationId, version, numberOfPresentations, maximumNumberOfAttendees } = ctx.request.body;
  if (from === '') { from = null; }
  if (to === '') { to = null; }
  if (logoUrl === '') { logoUrl = null; }
  let eventRows = [];
  try {
    const options = {
      hostname: 'conference',
      port: '80',
      path: '/api/events/' + eventId + '/' + ctx.claims.id,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const updatedRecord = await httpRequest(options);

    eventRows = updatedRecord;
  } catch (e) {
    console.error(e);
    ctx.status = 400;
    return ctx.body = {
      code: 'INVALID_PARAMETER',
      message: 'Could not update the event because of missing or invalid information',
    };
  }
  if (eventRows.length === 0) {
    ctx.status = 409;
    return ctx.body = {
      code: 'VERSION_CONFLICT',
      message: 'Attempted to update an event with an old version',
    };
  }

  const options = {
    hostname: 'conference',
    port: '80',
    path: '/api/locations/',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const locations = await httpRequest(options);

  ctx.body = {
    name,
    description,
    locationId,
    from,
    to,
    logoUrl,
    id: eventId,
    created: locations[0].created,
    updated: locations[0].updated,
    version: locations[0].version,
    numberOfPresentations,
    maximumNumberOfAttendees,
    location: locations[0]
  };
});
