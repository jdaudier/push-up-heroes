import db from '../init-firebase';
import startOfDay from 'date-fns/startOfDay';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import getSlackProfile from "./getSlackProfile";

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

export async function getTotalChallengeDays() {
    try {
        const [firstSnapshot, lastSnapshot] = await Promise.all([
            await db.collection('users')
                .orderBy('created', 'asc')
                .limit(1).get(),

            await db.collection('users')
                .orderBy('created', 'desc')
                .limit(1).get()
        ]);

        const firstEntryDate = firstSnapshot.docs.map(doc => doc.data().created.toDate())[0];
        const lastEntryDate = lastSnapshot.docs.map(doc => doc.data().created.toDate())[0];

        return differenceInCalendarDays(lastEntryDate, firstEntryDate) + 1
    } catch (err) {
        throw new Error(err.message);
    }
}

export async function getMostRecentSet() {
    try {
        const snapshot = await db.collection('users')
            .orderBy('created', 'desc')
            .limit(1).get();

        return snapshot.docs.map(async (doc) => {
            const rawData = doc.data();
            const created = startOfDay(rawData.created.toDate());
            const profile = await getSlackProfile(rawData.id);
            return {
                ...rawData,
                profile,
                created,
            }
        })[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
