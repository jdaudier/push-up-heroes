import fetch from 'isomorphic-unfetch';

async function getSlackProfile(userSlackId) {
    const user = await fetch(`https://slack.com/api/users.profile.get?user=${userSlackId}`, {
        headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${process.env.supremeLeadersSlackToken}`,
        }
    });

    const data = await user.json();
    return Promise.resolve(data.profile);
}

export default getSlackProfile;
