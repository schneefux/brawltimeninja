import dotenv from 'dotenv';
dotenv.config();
process.env.CACHE_DISABLE = '1';

import createService, { Service } from '../AppServiceFactory';

Object.keys(Service).forEach((serviceName) => {
  describe(`Test service ${serviceName}`, () => {
    const service = createService(Service[<keyof typeof Service>serviceName]);

    const featuredPlayers = service.getFeaturedPlayers();
    featuredPlayers.forEach((featuredPlayer) => {
      it(`should return data for featured player ${featuredPlayer.name}`, async () => {
        const data = await service.getPlayerStatistics(featuredPlayer.shard, featuredPlayer.id);
        expect(data).not.toBeNull();
      });
    });
  });
});