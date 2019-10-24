import fetch from 'isomorphic-unfetch';

async function getSlackUser(userSlackId) {
    const user = await fetch(`https://slack.com/api/users.info?user=${userSlackId}`, {
        headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${process.env.supremeLeadersSlackToken}`,
        }
    });

    const data = await user.json();
    return Promise.resolve(data.user);
}

export default getSlackUser;
