'use strict';

const faker = require('faker');
const mocks = require('../lib/mocks');
const superagent = require('superagent');
const server = require('../../lib/server');
const image = `${__dirname}/../lib/test.jpg`;
require('jest');

describe('POST /api/v1/photo', function() {
  beforeAll(server.start);
  beforeAll(() => mocks.user.createOne().then(data => this.mockUser = data));
  afterAll(server.stop);
  afterAll(mocks.user.removeAll);
  afterAll(mocks.gallery.removeAll);

  describe('Valid request', () => {
    it('should return a 201 code if POST completed', () => {
      let galleryMock = null;
      return mocks.gallery.createOne()
        .then(mock => {
          galleryMock = mock;
          return superagent.post(`:${process.env.PORT}/api/v1/photo`)
            .set('Authorization', `Bearer ${mock.token}`)
            .field('name', faker.lorem.word())
            .field('desc', faker.lorem.words(4))
            .field('galleryId', `${galleryMock.gallery._id}`)
            .attach('image', image);
        })
        .then(response => {
          expect(response.status).toEqual(201);
          expect(response.body).toHaveProperty('name');
          expect(response.body).toHaveProperty('desc');
          expect(response.body.userId).toEqual(galleryMock.gallery.userId.toString());
        });
    });
  });

  describe('Invalid request', () => {
    it('should return a 401 NOT AUTHORIZED given back token', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/photo`)
        .set('Authorization', 'Bearer BADTOKEN')
        .catch(err => expect(err.status).toEqual(401));
    });
    it('should return a 400 BAD REQUEST on improperly formatted body', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/photo`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .field('name', faker.lorem.word())
        .field('desc', faker.lorem.words(4))
        .attach('image', image)
        .catch(err => expect(err.status).toEqual(400));
    });
  });
});