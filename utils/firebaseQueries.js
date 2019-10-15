import db from '../init-firebase';

export async function getUsers() {
    try {
        const snapshot = await db.collection('users').get();
        return snapshot.docs.map(doc => doc.data());
    } catch (err) {
        throw new Error(err.message);
    }
}

export async function getUserStatsById(id) {
    try {
        const snapshot = await db.collection('users').where('id', '==', id).get();
        return snapshot.docs.map(doc => {
            const created = doc.data().created.toDate();
            return {
                ...doc.data(),
                created,
            }
        });
    } catch (err) {
        throw new Error(err.message);
    }
}

export async function addUserData({
                                      name,
                                      id,
                                      count
                                  }) {
    return db.collection('users').add({
        name,
        id,
        count: count,
        created: new Date(),
    });
}

