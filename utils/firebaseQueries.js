import db from '../init-firebase';
import startOfDay from 'date-fns/startOfDay';

export async function getUsers() {
    try {
        const snapshot = await db.collection('users').get();
        return snapshot.docs.map(doc => {
            const created = startOfDay(doc.data().created.toDate());
            return {
                ...doc.data(),
                created,
            }
        });
    } catch (err) {
        throw new Error(err.message);
    }
}

export async function getUserStatsById(id) {
    try {
        const snapshot = await db.collection('users').where('id', '==', id).get();
        return snapshot.docs.map(doc => {
            const created = startOfDay(doc.data().created.toDate());
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

export async function getChallengeStartDate() {
    try {
        const snapshot = await db.collection('users')
            .orderBy('created', 'asc')
            .limit(1).get();

        return startOfDay(snapshot.docs.map(doc => doc.data().created.toDate())[0]);
    } catch (err) {
        throw new Error(err.message);
    }
}
