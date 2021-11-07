const getBestIndividualSetAthletes = require('./getBestIndividualSetAthletes');

describe('getBestIndividualSetAthletes', () => {
   it('should return accumulated athletes if count is not best set', () => {
      const currentAthlete = {
         id: '1',
         name: 'Joanne',
         count: 14,
         created: 'Nov 16',
         profile: {},
      };

      const prevAthlete = {
         id: '2',
         name: 'Norman',
         count: 15,
         created: 'Nov 15',
         profile: {},
      };

      const actual = getBestIndividualSetAthletes({
         count: 14,
         accCount: 15,
         currentAthlete,
         accAthletes: [prevAthlete]
      });
      expect(actual).toEqual([prevAthlete])
   });

   it('should return current athlete in an array if count is highest', () => {
      const currentAthlete = {
         id: '1',
         name: 'Joanne',
         count: 15,
         created: 'Nov 16',
         profile: {},
      };

      const actual = getBestIndividualSetAthletes({
         count: 15,
         accCount: 14,
         currentAthlete,
         accAthletes: [{
            id: '2',
            name: 'Norman',
            count: 14,
            created: 'Nov 15',
            profile: {},
         }]
      });
      expect(actual).toEqual([currentAthlete])
   });

   it('should add current athlete into an array with other athletes if count is the same and current athlete is not in array', () => {
      const currentAthlete = {
         id: '1',
         name: 'Joanne',
         count: 15,
         created: 'Nov 20',
         profile: {},
      };

      const prevBestSetAthlete = {
         id: '2',
         name: 'Norman',
         count: 15,
         created: 'Nov 15',
         profile: {},
      };

      const actual = getBestIndividualSetAthletes({
         count: 15,
         accCount: 15,
         currentAthlete,
         accAthletes: [prevBestSetAthlete]
      });
      expect(actual).toEqual([prevBestSetAthlete, currentAthlete])
   });

   it('should combine the dates for the current athlete into the array if count is the same and current athlete is already in array', () => {
      const currentAthlete = {
         id: '1',
         name: 'Joanne',
         count: 15,
         created: 'Nov 26',
         profile: {},
      };

      const prevBestSetAthlete1 = {
         id: '2',
         name: 'Norman',
         count: 15,
         created: 'Nov 15',
         profile: {},
      };

      const prevBestSetAthlete2 = {
         id: '1',
         name: 'Joanne',
         count: 15,
         created: 'Nov 20',
         profile: {},
      };

      const actual = getBestIndividualSetAthletes({
         count: 15,
         accCount: 15,
         currentAthlete,
         accAthletes: [prevBestSetAthlete1, prevBestSetAthlete2]
      });
      expect(actual).toEqual([prevBestSetAthlete1, {
         ...prevBestSetAthlete2,
         created: 'Nov 20, Nov 26'
      }]);
   });

   it('should combine the dates for the current athlete into the array if count is the same and current athlete is already in array', () => {
      const currentAthlete = {
         id: '1',
         name: 'Joanne',
         count: 17,
         created: 'Nov 28',
         profile: {},
      };

      const prevBestSetAthlete = {
         id: '1',
         name: 'Joanne',
         count: 17,
         created: 'Nov 20, Nov 26',
         profile: {},
      };

      const actual = getBestIndividualSetAthletes({
         count: 17,
         accCount: 17,
         currentAthlete,
         accAthletes: [prevBestSetAthlete]
      });
      expect(actual).toEqual([{
         ...prevBestSetAthlete,
         created: 'Nov 20, Nov 26, Nov 28'
      }]);
   });

   it('should NOT combine the dates for the current athlete into the array if count is the same and current athlete is already in array and date is already in created', () => {
      const currentAthlete = {
         id: '1',
         name: 'Joanne',
         count: 15,
         created: 'Nov 20',
         profile: {},
      };

      const prevBestSetAthlete = {
         id: '1',
         name: 'Joanne',
         count: 15,
         created: 'Nov 20',
         profile: {},
      };

      const actual = getBestIndividualSetAthletes({
         count: 15,
         accCount: 15,
         currentAthlete,
         accAthletes: [prevBestSetAthlete]
      });
      expect(actual).toEqual([prevBestSetAthlete]);
   });
});