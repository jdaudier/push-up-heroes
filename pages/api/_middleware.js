export async function middleware(req, event) {
    if (req.nextUrl.pathname === '/instructions') {
        return new Response('Hello, world!');
    }
}