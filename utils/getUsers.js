import db from "../init-firebase";

async function getUsers() {
    try {
        const snapshot = await db.collection('users').get();
        return snapshot.docs.map(doc => doc.data());
    } catch (err) {
        console.error('Error fetching users from Firebase', err);
    }
}

export default getUsers;
