process.env.CACHE_DISABLE = '1';

import BrawlstarsService from '../Brawlstars';

describe(`Test BrawlstarsService`, () => {
  const service = new BrawlstarsService();
  const featuredPlayers = service.getFeaturedPlayers();
  featuredPlayers.forEach((featuredPlayer) => {
    it(`should return data for featured player ${featuredPlayer.name}`, async () => {
      const data = await service.getPlayerStatistics(featuredPlayer.id);
      expect(data).not.toBeNull();
    });
  });

  it(`should return no data for an invalid name`, async() => {
    const data = await service.getPlayerStatistics('');
    expect(data).toBeNull();
  })
});
