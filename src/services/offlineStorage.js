import Dexie from 'dexie';

export const db = new Dexie('RoadSoSDatabase');

db.version(1).stores({
  pois: 'id, lat, lng, name, category, typeName, phone, address',
  location: 'id, lat, lng, timestamp'
});

export const saveOfflineData = async (lat, lng, pois) => {
  try {
    await db.pois.clear();
    await db.pois.bulkAdd(pois);
    
    await db.location.put({
      id: 1,
      lat,
      lng,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to save offline data:', error);
  }
};

export const getOfflineData = async () => {
  try {
    const pois = await db.pois.toArray();
    const location = await db.location.get(1);
    
    return { pois, location };
  } catch (error) {
    console.error('Failed to get offline data:', error);
    return { pois: [], location: null };
  }
};
