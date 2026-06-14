import '../setup/test-env.setup.js';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import prisma from '../../src/config/prisma.js';
import {
  assertAuthTestEnvironment,
  buildAccessToken,
  buildRegisterPayload,
  cleanupAuthFixtures,
  createLocalUserFixture,
} from '../helpers/auth.helpers.js';

const { default: app } = await import('../../src/app.js');

describe('Follow integration', () => {
  beforeAll(async () => {
    assertAuthTestEnvironment();
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanupAuthFixtures();
  });

  afterAll(async () => {
    await cleanupAuthFixtures();
    await prisma.$disconnect();
  });

  it('POST /api/follow retourne 401 sans token', async () => {
    const response = await request(app).post('/api/follow').send({
      targetId: 'missing-token',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/follow cree un follow et une notification', async () => {
    const followerPayload = buildRegisterPayload('follow-follower');
    const follower = await createLocalUserFixture(
      followerPayload.email,
      followerPayload.password
    );

    const targetPayload = buildRegisterPayload('follow-target');
    const target = await createLocalUserFixture(
      targetPayload.email,
      targetPayload.password
    );

    const response = await request(app)
      .post('/api/follow')
      .set('Cookie', `accessToken=${buildAccessToken(follower)}`)
      .send({
        targetId: target.utilisateur_id,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: follower.utilisateur_id,
          followingId: target.utilisateur_id,
        },
      },
    });

    const notification = await prisma.notification.findFirst({
      where: {
        utilisateur_cible_id: target.utilisateur_id,
        type: 'nouveau_follower',
      },
    });

    expect(follow).not.toBeNull();
    expect(notification).not.toBeNull();
  });

  it('GET followers/following et DELETE /api/follow/:targetId fonctionnent pour un utilisateur authentifie', async () => {
    const followerPayload = buildRegisterPayload('follow-list-follower');
    const follower = await createLocalUserFixture(
      followerPayload.email,
      followerPayload.password
    );

    const targetPayload = buildRegisterPayload('follow-list-target');
    const target = await createLocalUserFixture(
      targetPayload.email,
      targetPayload.password
    );

    await prisma.follow.create({
      data: {
        followerId: follower.utilisateur_id,
        followingId: target.utilisateur_id,
      },
    });

    const followersResponse = await request(app)
      .get(`/api/follow/${target.utilisateur_id}/followers`)
      .set('Cookie', `accessToken=${buildAccessToken(target)}`);

    expect(followersResponse.status).toBe(200);
    expect(followersResponse.body.success).toBe(true);
    expect(followersResponse.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          utilisateur_id: follower.utilisateur_id,
          isFollowing: false,
        }),
      ])
    );

    const followingResponse = await request(app)
      .get(`/api/follow/${follower.utilisateur_id}/following`)
      .set('Cookie', `accessToken=${buildAccessToken(follower)}`);

    expect(followingResponse.status).toBe(200);
    expect(followingResponse.body.success).toBe(true);
    expect(followingResponse.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          utilisateur_id: target.utilisateur_id,
          isFollowing: true,
        }),
      ])
    );

    const deleteResponse = await request(app)
      .delete(`/api/follow/${target.utilisateur_id}`)
      .set('Cookie', `accessToken=${buildAccessToken(follower)}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);

    const removedFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: follower.utilisateur_id,
          followingId: target.utilisateur_id,
        },
      },
    });

    expect(removedFollow).toBeNull();
  });
});
