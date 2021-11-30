export async function middleware(req, event) {
    if (req.nextUrl.pathname === '/instructions' && req.method === 'POST') {
        return new Response('Hello, world!');
    }
}