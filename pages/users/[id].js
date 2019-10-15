import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function User() {
    const router = useRouter();

    return (
        <Layout>
            <h1>{router.query.id}</h1>
            <p>Insert individual push-up stats chart.</p>
        </Layout>
    );
}
